import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const renderedRef = useRef(false);

  useEffect(() => {
    if (renderedRef.current) return;
    renderedRef.current = true;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        primaryColor: '#00f5d4',
        primaryTextColor: '#d0d4dc',
        primaryBorderColor: '#00f5d4',
        lineColor: '#4361ee',
        secondaryColor: '#06162a',
        tertiaryColor: '#06162a',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '13px',
        nodeBorder: '1px',
        clusterBkg: 'rgba(6,22,42,0.8)',
        clusterBorder: 'rgba(67,97,238,0.3)',
        edgeLabelBackground: 'rgba(6,22,42,0.9)',
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        padding: 16,
        nodeSpacing: 40,
        rankSpacing: 60,
      },
    });

    const render = async () => {
      const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
      try {
        const { svg } = await mermaid.render(id, chart.trim());
        setSvg(svg);
      } catch (e) {
        console.error('Mermaid render error:', e);
      }
    };

    render();
  }, [chart]);

  return (
    <div className="glass-panel p-4 overflow-x-auto">
      <div ref={containerRef} className="mermaid-container" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
