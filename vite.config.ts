import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/sections/DemoSection.tsx') || id.includes('/src/lib/bo_engine.ts') || id.includes('/src/lib/doe_engine.ts') || id.includes('/src/data/quiz_data.ts')) {
            return 'demo';
          }
          if (id.includes('/src/components/KnowledgeGraph.tsx') || id.includes('/src/data/knowledge_graph.ts')) {
            return 'knowledge-graph';
          }
          if (!id.includes('node_modules')) return;
          if (id.includes('react-plotly.js') || id.includes('plotly.js')) return 'plotly';
          if (id.includes('mermaid') || id.includes('cytoscape')) return 'mermaid';
          if (id.includes('d3-')) return 'd3';
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
