import { useEffect, useMemo, useState } from 'react';
import { InputPanel } from './components/InputPanel';
import { FlowCanvas } from './components/FlowCanvas';
import { TopBar } from './components/TopBar';
import { Top3Priorities } from './components/Top3Priorities';
import { useStore, loadPersistedState } from './store';
import { generateGraph, searchNodes, filterNodes } from './graphGenerator';
import { exportToPNG, exportToPDF, exportToCSV } from './exportUtils';
import { GraphData } from './types';
import type { InputsValidated } from './validation';

function App() {
  const { inputs, nodes, edges, searchTerm, filters, setGraph } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadPersistedState();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Quick focus to first text input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Reserved for zoom keys if you wire them later
      if (e.key === '0' && !e.metaKey && !e.ctrlKey) {
        // reset zoom placeholder
      }
      if (e.key === '+' || e.key === '=') {
        // zoom in placeholder
      }
      if (e.key === '-' || e.key === '_') {
        // zoom out placeholder
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Accept an optional override of freshly-validated inputs from InputPanel.
  const handleGenerate = async (override?: InputsValidated) => {
    setIsGenerating(true);
    try {
      const effective = override ?? inputs; // use freshest values if provided
      const { nodes: generatedNodes, edges: generatedEdges } = generateGraph(effective);
      setGraph(generatedNodes, generatedEdges);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredNodes = useMemo(() => {
    let result = nodes;

    if (searchTerm) {
      result = searchNodes(result, searchTerm);
    }

    result = filterNodes(result, filters);

    return result;
  }, [nodes, searchTerm, filters]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  }, [filteredNodes, edges]);

  const handleExportPNG = () => {
    exportToPNG('.react-flow', `hanco-graph-${Date.now()}.png`);
  };

  const handleExportPDF = () => {
    exportToPDF('.react-flow', `hanco-graph-${Date.now()}.pdf`);
  };

  const handleExportCSV = () => {
    exportToCSV(nodes, `hanco-coverage-${Date.now()}.csv`);
  };

  const handleImportGraph = (data: GraphData) => {
    if (data.inputs) {
      useStore.setState({ inputs: data.inputs });
    }
    if (data.nodes && data.edges) {
      setGraph(data.nodes, data.edges);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <TopBar
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
        onImportGraph={handleImportGraph}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Pass loading state + onGenerate that accepts validated override */}
        <InputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />

        <div className="flex-1 relative">
          {/* Optional full-canvas overlay while generating */}
          {isGenerating && (
            <div className="absolute inset-0 grid place-items-center bg-white/60 dark:bg-black/40 z-10">
              <div
                className="flex items-center gap-3 px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#0399b8', color: 'white' }}
              >
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" />
                </svg>
                <span>Generating flowchart…</span>
              </div>
            </div>
          )}

          {filteredNodes.length > 0 ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="overflow-y-auto flex-1">
                {nodes.length > 0 && (
                  <div className="p-6">
                    <Top3Priorities nodes={nodes} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <FlowCanvas nodes={filteredNodes} edges={filteredEdges} />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md px-6">
                <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-primary-600 dark:text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Iter - your pathway to success</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill in the inputs on the left panel and click “Generate Graph” to visualize your
                  security issues and remediations mapped to compliance frameworks.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      isGenerating
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {isGenerating ? 'Generating…' : 'Get Started'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
