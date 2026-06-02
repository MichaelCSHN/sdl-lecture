import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3Force from 'd3-force';
import { kgNodes, kgEdges, type KGNode } from '../data/knowledge_graph';

const TYPE_COLORS: Record<string, string> = {
  concept: '#00f5d4',
  method: '#fee440',
  person: '#4361ee',
  tool: '#ff6b6b',
  process: '#8a92a3',
  theory: '#c77dff',
};

const TYPE_LABELS: Record<string, string> = {
  concept: '概念', method: '方法', person: '人物', tool: '工具', process: '工序', theory: '理论',
};

interface SimNode extends d3Force.SimulationNodeDatum {
  id: string;
  data: KGNode;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink extends d3Force.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  relation: string;
  relationEn: string;
}

interface WikiCacheEntry {
  title: string;
  extract: string;
  thumbnail?: string;
  lang: string;
  fetchedAt: number;
}

const WIKI_CACHE_KEY = 'sdl_kg_wiki_cache';
const WIKI_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function getWikiCache(): Record<string, WikiCacheEntry> {
  try {
    const raw = localStorage.getItem(WIKI_CACHE_KEY);
    if (!raw) return {};
    const cache = JSON.parse(raw);
    // Remove expired entries
    const now = Date.now();
    for (const key of Object.keys(cache)) {
      if (now - cache[key].fetchedAt > WIKI_CACHE_TTL) delete cache[key];
    }
    return cache;
  } catch { return {}; }
}

function setWikiCache(key: string, entry: WikiCacheEntry) {
  const cache = getWikiCache();
  cache[key] = entry;
  try { localStorage.setItem(WIKI_CACHE_KEY, JSON.stringify(cache)); } catch { /* ignore */ }
}

async function fetchWikiSummary(title: string, lang: 'zh' | 'en'): Promise<WikiCacheEntry | null> {
  const cacheKey = `${lang}:${title}`;
  const cache = getWikiCache();
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const domain = lang === 'zh' ? 'zh.wikipedia.org' : 'en.wikipedia.org';
    const resp = await fetch(
      `https://${domain}/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const entry: WikiCacheEntry = {
      title: data.title,
      extract: data.extract || '暂无摘要',
      thumbnail: data.thumbnail?.source,
      lang,
      fetchedAt: Date.now(),
    };
    setWikiCache(cacheKey, entry);
    return entry;
  } catch { return null; }
}

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3Force.Simulation<SimNode, SimLink> | null>(null);
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null);
  const [wikiData, setWikiData] = useState<WikiCacheEntry | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [simLinks, setSimLinks] = useState<SimLink[]>([]);
  const isDragging = useRef(false);
  const dragNode = useRef<string | null>(null);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    let nodes = kgNodes;
    if (typeFilter) nodes = nodes.filter((n) => n.type === typeFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(term) ||
          n.labelEn.toLowerCase().includes(term) ||
          n.description.toLowerCase().includes(term)
      );
    }
    return nodes;
  }, [typeFilter, searchTerm]);

  // Initialize simulation
  useEffect(() => {
    const width = dimensions.width;
    const height = dimensions.height;

    const nodes: SimNode[] = filteredNodes.map((n) => ({
      id: n.id,
      data: n,
      x: width / 2 + (Math.random() - 0.5) * width * 0.6,
      y: height / 2 + (Math.random() - 0.5) * height * 0.6,
    }));

    const nodeSet = new Set(nodes.map((n) => n.id));
    const links: SimLink[] = kgEdges
      .filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target))
      .map((e) => ({ ...e, source: e.source, target: e.target }));

    const sim = d3Force
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3Force
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(80)
          .strength(0.5)
      )
      .force('charge', d3Force.forceManyBody().strength(-200))
      .force('center', d3Force.forceCenter(width / 2, height / 2))
      .force('collision', d3Force.forceCollide<SimNode>().radius(25))
      .on('tick', () => {
        setSimNodes([...nodes]);
        setSimLinks([...links]);
      });

    simRef.current = sim;

    return () => {
      sim.stop();
    };
  }, [filteredNodes, dimensions]);

  // Handle resize
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fetch wiki on node select
  useEffect(() => {
    if (!selectedNode) { setWikiData(null); return; }
    setWikiLoading(true);
    const titleEn = selectedNode.labelEn.replace(/\s+/g, '_');
    const titleZh = selectedNode.label;

    // Try Chinese first, fallback to English
    const tryFetch = async () => {
      if (selectedNode.wikiUrl) {
        const result = await fetchWikiSummary(titleZh, 'zh');
        if (result) { setWikiData(result); setWikiLoading(false); return; }
      }
      if (selectedNode.wikiUrlEn) {
        const result = await fetchWikiSummary(titleEn, 'en');
        if (result) { setWikiData(result); setWikiLoading(false); return; }
      }
      // Try English label as fallback
      const result = await fetchWikiSummary(titleEn, 'en');
      setWikiData(result);
      setWikiLoading(false);
    };
    tryFetch();
  }, [selectedNode]);

  // Mouse handlers for zoom/pan
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform((prev) => ({ ...prev, k: Math.max(0.3, Math.min(5, prev.k * scaleFactor)) }));
    },
    []
  );

  const handleMouseDown = useCallback((nodeId: string) => {
    isDragging.current = true;
    dragNode.current = nodeId;
    setSelectedNode(kgNodes.find((n) => n.id === nodeId) || null);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current || !dragNode.current || !simRef.current) return;
      const node = simRef.current.nodes().find((n) => n.id === dragNode.current);
      if (!node) return;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      node.fx = (e.clientX - rect.left - transform.x) / transform.k;
      node.fy = (e.clientY - rect.top - transform.y) / transform.k;
      simRef.current.alpha(0.3).restart();
    },
    [transform]
  );

  const handleMouseUp = useCallback(() => {
    if (dragNode.current && simRef.current) {
      const node = simRef.current.nodes().find((n) => n.id === dragNode.current);
      if (node) { node.fx = null; node.fy = null; }
    }
    isDragging.current = false;
    dragNode.current = null;
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Graph area */}
      <div className="flex-1 glass-panel p-3 relative overflow-hidden" style={{ minHeight: 500 }}>
        {/* Search */}
        <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索节点..."
            className="flex-1 bg-[rgba(6,22,42,0.9)] border border-[rgba(67,97,238,0.3)] rounded px-3 py-1.5 text-xs text-[#d0d4dc] font-mono placeholder:text-[#8a92a3]/50 focus:border-[#00f5d4] outline-none"
          />
          <button
            onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
            className="px-3 py-1.5 border border-[rgba(67,97,238,0.2)] rounded text-[10px] text-[#8a92a3] font-mono hover:text-[#d0d4dc]"
          >
            重置视图
          </button>
        </div>

        {/* Type filter */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1">
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-2 py-0.5 text-[9px] font-mono rounded border ${typeFilter === null ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'}`}
          >
            全部
          </button>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? null : key)}
              className={`px-2 py-0.5 text-[9px] font-mono rounded border flex items-center gap-1 ${typeFilter === key ? 'border-[#00f5d4] text-[#00f5d4]' : 'border-[rgba(67,97,238,0.2)] text-[#8a92a3]'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLORS[key] }} />
              {label}
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
          <button onClick={() => setTransform((p) => ({ ...p, k: Math.min(5, p.k * 1.2) }))} className="w-7 h-7 border border-[rgba(67,97,238,0.3)] rounded bg-[rgba(6,22,42,0.9)] text-[#8a92a3] hover:text-[#d0d4dc] text-xs flex items-center justify-center">+</button>
          <button onClick={() => setTransform((p) => ({ ...p, k: Math.max(0.3, p.k / 1.2) }))} className="w-7 h-7 border border-[rgba(67,97,238,0.3)] rounded bg-[rgba(6,22,42,0.9)] text-[#8a92a3] hover:text-[#d0d4dc] text-xs flex items-center justify-center">−</button>
        </div>

        {/* SVG Graph */}
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ minHeight: 500, cursor: isDragging.current ? 'grabbing' : 'grab' }}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* Links */}
            {simLinks.map((link, i) => {
              const source = typeof link.source === 'string' ? simNodes.find((n) => n.id === link.source) : (link.source as SimNode);
              const target = typeof link.target === 'string' ? simNodes.find((n) => n.id === link.target) : (link.target as SimNode);
              if (!source || !target) return null;
              return (
                <line
                  key={i}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="rgba(67,97,238,0.2)"
                  strokeWidth={selectedNode && (source.data.id === selectedNode.id || target.data.id === selectedNode.id) ? 1.5 : 0.5}
                  opacity={selectedNode && !(source.data.id === selectedNode.id || target.data.id === selectedNode.id) ? 0.3 : 1}
                />
              );
            })}

            {/* Nodes */}
            {simNodes.map((node) => {
              const isSelected = selectedNode?.id === node.data.id;
              const isRelated = selectedNode
                ? kgEdges.some((e) => (e.source === selectedNode.id && e.target === node.data.id) || (e.target === selectedNode.id && e.source === node.data.id))
                : false;
              const dimmed = selectedNode && !isSelected && !isRelated;
              const color = TYPE_COLORS[node.data.type] || '#8a92a3';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onMouseDown={() => handleMouseDown(node.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={dimmed ? 0.3 : 1}
                >
                  <circle
                    r={isSelected ? 8 : 5}
                    fill={isSelected ? `${color}40` : `${color}20`}
                    stroke={color}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    x={10}
                    y={3}
                    fontSize="9"
                    fill={isSelected ? '#00f5d4' : '#d0d4dc'}
                    fontFamily="monospace"
                    opacity={isSelected ? 1 : 0.7}
                  >
                    {node.data.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Detail panel */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
        {selectedNode ? (
          <>
            <div className="glass-panel p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[selectedNode.type] }} />
                <span className="text-[10px] text-[#8a92a3] font-mono">{TYPE_LABELS[selectedNode.type]}</span>
              </div>
              <h4 className="text-base font-semibold font-mono text-[#d0d4dc] mb-0.5">{selectedNode.label}</h4>
              <p className="text-[10px] text-[#8a92a3] font-mono mb-2">{selectedNode.labelEn}</p>
              <p className="text-xs text-[#d0d4dc] leading-relaxed mb-1">{selectedNode.description}</p>
              <p className="text-[10px] text-[#8a92a3] leading-relaxed">{selectedNode.descriptionEn}</p>
            </div>

            {/* Wiki data */}
            <div className="glass-panel p-4">
              <div className="text-[10px] text-[#00f5d4] font-mono tracking-wider mb-2">WIKIPEDIA</div>
              {wikiLoading ? (
                <div className="flex items-center gap-2 text-xs text-[#8a92a3]">
                  <span className="w-3 h-3 border border-[#00f5d4] border-t-transparent rounded-full animate-spin" />
                  正在获取...
                </div>
              ) : wikiData ? (
                <div>
                  {wikiData.thumbnail && (
                    <img src={wikiData.thumbnail} alt={wikiData.title} className="w-full h-24 object-cover rounded mb-2" />
                  )}
                  <div className="text-xs text-[#d0d4dc] leading-relaxed">{wikiData.extract}</div>
                  <div className="text-[9px] text-[#8a92a3] font-mono mt-1">Source: Wikipedia ({wikiData.lang})</div>
                </div>
              ) : (
                <div className="text-xs text-[#8a92a3]">Wikipedia 暂无该词条的详细摘要</div>
              )}
              {(selectedNode.wikiUrl || selectedNode.wikiUrlEn) && (
                <div className="mt-2 flex gap-2">
                  {selectedNode.wikiUrl && (
                    <a href={selectedNode.wikiUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#00f5d4] hover:underline font-mono">中文维基</a>
                  )}
                  {selectedNode.wikiUrlEn && (
                    <a href={selectedNode.wikiUrlEn} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#00f5d4] hover:underline font-mono">English Wiki</a>
                  )}
                </div>
              )}
            </div>

            {/* Related nodes */}
            {(() => {
              const related = kgEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id);
              if (related.length === 0) return null;
              return (
                <div className="glass-panel p-4">
                  <div className="text-[10px] text-[#8a92a3] font-mono mb-2">RELATED ({related.length})</div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {related.map((edge, i) => {
                      const isSource = edge.source === selectedNode.id;
                      const otherId = isSource ? edge.target : edge.source;
                      const other = kgNodes.find((n) => n.id === otherId);
                      if (!other) return null;
                      return (
                        <button key={i} onClick={() => setSelectedNode(other)} className="flex items-center gap-2 text-left w-full group">
                          <span className="text-[10px] text-[#8a92a3]">{isSource ? '→' : '←'}</span>
                          <span className="text-[11px] text-[#00f5d4] font-mono group-hover:underline">{other.label}</span>
                          <span className="text-[9px] text-[#8a92a3]">({edge.relation})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="glass-panel p-6 flex items-center justify-center min-h-[160px]">
            <p className="text-[#8a92a3] font-mono text-xs text-center">
              搜索或点击图谱中的节点<br />查看 Wikipedia 摘要与关联
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
