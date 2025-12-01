import { create } from 'zustand';
import { AppInputs, GraphNode, Edge, Framework, Cloud, Status } from './types';
import { InputsValidated } from './validation';

interface AppState {
  inputs: AppInputs;
  nodes: GraphNode[];
  edges: Edge[];
  searchTerm: string;
  filters: {
    clouds: Cloud[];
    statuses: Status[];
    severities: number[];
    frameworks: Framework[];
    businessUnits: string[];
    environments: string[];
  };
  showCoverageHeatmap: boolean;
  isDarkMode: boolean;
  commandPaletteOpen: boolean;

  setInputs: (inputs: InputsValidated) => void;
  setGraph: (nodes: GraphNode[], edges: Edge[]) => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  toggleCoverageHeatmap: () => void;
  toggleDarkMode: () => void;
  toggleCommandPalette: () => void;
  updateNodeStatus: (nodeId: string, status: Status, evidence?: string) => void;
  resetFilters: () => void;
  resetInputs: () => void;
}

const DEFAULT_INPUTS: AppInputs = {
  company: '',
  industry: '',
  businessUnits: [],
  environments: [],
  dataClasses: [],
  clouds: [],
  software: [],
  hardware: [],
  frameworks: ['NIST CSF 2.0', 'NIST 800-53', 'MITRE ATT&CK', 'SOC 2', 'GDPR'],
  riskDefaults: {
    impact: 3,
    likelihood: 3,
    exposure: 2,
  },
};

export const useStore = create<AppState>((set) => ({
  inputs: DEFAULT_INPUTS,
  nodes: [],
  edges: [],
  searchTerm: '',
  filters: {
    clouds: [],
    statuses: [],
    severities: [],
    frameworks: [],
    businessUnits: [],
    environments: [],
  },
  showCoverageHeatmap: false,
  isDarkMode: false,
  commandPaletteOpen: false,

  setInputs: (validated) => {
    const inputs: AppInputs = {
      company: validated.company,
      industry: validated.industry,
      businessUnits: validated.businessUnits,
      environments: validated.environments,
      dataClasses: validated.dataClasses,
      clouds: validated.clouds,
      software: validated.software,
      hardware: validated.hardware,
      frameworks: validated.frameworks,
      riskDefaults: validated.riskDefaults,
    };

    set({ inputs });
    localStorage.setItem('hanco-inputs', JSON.stringify(inputs));
  },

  setGraph: (nodes, edges) => set({ nodes, edges }),

  setSearchTerm: (term) => set({ searchTerm: term }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  toggleCoverageHeatmap: () =>
    set((state) => ({ showCoverageHeatmap: !state.showCoverageHeatmap })),

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      localStorage.setItem('hanco-dark-mode', JSON.stringify(newMode));
      return { isDarkMode: newMode };
    }),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  updateNodeStatus: (nodeId, status, evidence) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              status,
              ...(evidence && {
                links: [
                  ...(node.links || []),
                  { label: 'Evidence', url: evidence },
                ],
              }),
            }
          : node
      ),
    })),

  resetFilters: () =>
    set({
      filters: {
        clouds: [],
        statuses: [],
        severities: [],
        frameworks: [],
        businessUnits: [],
        environments: [],
      },
    }),

  resetInputs: () => {
    set({ inputs: DEFAULT_INPUTS, nodes: [], edges: [] });
    localStorage.removeItem('hanco-inputs');
  },
}));

export const loadPersistedState = () => {
  try {
    const savedInputs = localStorage.getItem('hanco-inputs');
    const savedDarkMode = localStorage.getItem('hanco-dark-mode');

    if (savedInputs) {
      const inputs = JSON.parse(savedInputs);
      useStore.setState({ inputs });
    }

    if (savedDarkMode) {
      const isDarkMode = JSON.parse(savedDarkMode);
      useStore.setState({ isDarkMode });
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }
};
