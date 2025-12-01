import { AppInputs, GraphNode, Edge, Cloud, Framework } from './types';
import { seedNodes, seedEdges } from './data/seedCatalog';

/* ----------------------------- Industry helpers ---------------------------- */

type IndustryPreset = {
  emphasizeFrameworks?: string[];
  riskMultipliers?: Partial<Record<'issue'|'detection'|'remediation', number>>;
  preferredIssues?: string[]; // if title contains → mark Open
};

// Normalize common user inputs (e.g., “Tech” → “technology”)
const INDUSTRY_ALIASES: Record<string, string> = {
  tech: 'technology',
  technology: 'technology',
  saas: 'saas',
  fintech: 'financial services',
  finance: 'financial services',
  'financial services': 'financial services',
  banking: 'financial services',
  healthcare: 'healthcare',
  retail: 'retail',
  government: 'government',
   law: 'legal services',
  'law firm': 'legal services',
  legal: 'legal services',
  'legal services': 'legal services',
};

const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  healthcare: {
    emphasizeFrameworks: ['HIPAA', 'NIST CSF 2.0'],
    preferredIssues: ['PHI', 'ePHI', 'MFA', 'Legacy Auth', 'Conditional Access'],
    riskMultipliers: { issue: 1.2, remediation: 1.1 },
  },
  'financial services': {
    emphasizeFrameworks: ['GLBA', 'NIST 800-53', 'NIST CSF 2.0'],
    preferredIssues: ['S3 public', 'GuardDuty', 'CloudTrail', 'IAM *:*', 'KMS', 'Encryption'],
    riskMultipliers: { issue: 1.15 },
  },

  'legal services': {
    emphasizeFrameworks: ['SOC 2', 'GDPR', 'NIST CSF 2.0'],
    preferredIssues: [
      'DLP','eDiscovery','Legal hold','Retention',
      'PII','Access control','MFA','Privileged','Email','Phishing'
    ],
    riskMultipliers: { issue: 1.15 }, // +15% impact on issues, clamped to 5
  },
  
  retail: {
    emphasizeFrameworks: ['SOC 2', 'GDPR'],
    preferredIssues: ['Public buckets', 'Weak IAM', 'Exposed storage', 'Guest sprawl'],
  },
  technology: {
    emphasizeFrameworks: ['SOC 2', 'NIST CSF 2.0', 'GDPR'],
    preferredIssues: ['Public buckets', 'Weak IAM', 'Guest sprawl', 'Secrets', 'CI/CD'],
    riskMultipliers: { issue: 1.1 },
  },
  saas: {
    emphasizeFrameworks: ['SOC 2', 'GDPR', 'CCPA/CPRA'],
    preferredIssues: ['Multi-tenant', 'Data isolation', 'Secrets', 'SSO'],
  },
  government: {
    emphasizeFrameworks: ['NIST 800-53', 'NIST CSF 2.0'],
    preferredIssues: ['Audit', 'Logging', 'Encryption', 'Access control'],
  },
};

function applyIndustryTuning(nodes: GraphNode[], inputs: AppInputs): GraphNode[] {
  const raw = (inputs.industry || '').trim().toLowerCase();
  const key = INDUSTRY_ALIASES[raw] ?? raw;
  const preset = INDUSTRY_PRESETS[key];
  if (!preset) return nodes;

  return nodes.map((n) => {
    // Emphasize certain frameworks by duplicating those badges (simple weighting)
    if (preset.emphasizeFrameworks && n.frameworks?.length) {
      const extra = n.frameworks.filter((f) => preset.emphasizeFrameworks!.includes(f.framework));
      if (extra.length) n.frameworks = [...n.frameworks, ...extra];
    }

    // Risk multiplier (only impact, to keep things stable)
    if (preset.riskMultipliers && (n as any).risk) {
      const mult = preset.riskMultipliers[n.type as 'issue'|'detection'|'remediation'] || 1;
      if (mult !== 1 && n.type === 'issue') {
        const r = (n as any).risk;
        (n as any).risk = {
          impact: Math.min(5, Math.max(1, Math.round(r.impact * mult))),
          likelihood: r.likelihood,
          exposure: r.exposure,
        };
      }
    }

    // Prefer some issues → mark status Open if unset
    if (preset.preferredIssues && n.type === 'issue' && n.title) {
      const hit = preset.preferredIssues.some((k) =>
        n.title.toLowerCase().includes(k.toLowerCase())
      );
      if (hit && (n as any).status === undefined) {
        (n as any).status = 'Open';
      }
    }
    return n;
  });
}

/* --------- Optional: framework priorities & keyword boosts (kept) ---------- */

const INDUSTRY_FRAMEWORK_PRIORITIES: Record<string, Framework[]> = {
  healthcare: ['HIPAA', 'GDPR', 'NIST 800-53'],
  'financial services': ['GLBA', 'SOC 2', 'NIST 800-53', 'NIST CSF 2.0'],
  finance: ['GLBA', 'SOC 2', 'NIST 800-53', 'NIST CSF 2.0'],
  banking: ['GLBA', 'SOC 2', 'NIST 800-53'],
  technology: ['SOC 2', 'NIST CSF 2.0', 'GDPR'],
  saas: ['SOC 2', 'GDPR', 'CCPA/CPRA'],
  retail: ['CCPA/CPRA', 'GDPR', 'SOC 2'],
  government: ['NIST 800-53', 'NIST CSF 2.0'],
};

const INDUSTRY_ISSUE_BOOST: Record<string, string[]> = {
  healthcare: ['unencrypted', 'hipaa', 'patient', 'phi', 'medical'],
  'financial services': ['payment', 'transaction', 'glba', 'pci', 'financial'],
  finance: ['payment', 'transaction', 'glba', 'financial'],
  technology: ['api', 'authentication', 'mfa', 'access'],
  saas: ['multi-tenant', 'data isolation', 'soc 2'],
  'legal services': [
    'ediscovery', 'legal hold', 'dlp', 'retention',
    'privileged', 'pii', 'case', 'matter', 'email', 'phishing'
  ],
};



/* -------------------------------- Generator ------------------------------- */

export function generateGraph(inputs: AppInputs): { nodes: GraphNode[]; edges: Edge[] } {
  // 1) Cloud filter
  let filteredNodes = seedNodes.filter((node) => {
    if (node.cloud && !inputs.clouds.includes(node.cloud)) return false;
    return true;
  });

  // 2) Framework filter
  filteredNodes = filteredNodes.filter((node) => {
    if (!node.frameworks || node.frameworks.length === 0) return true;
    return node.frameworks.some((fw) => inputs.frameworks.includes(fw.framework));
  });

  // 3) Industry keyword boost → slight risk bump for matching issues
  const rawIndustry = (inputs.industry || '').trim().toLowerCase();
  const normIndustry = INDUSTRY_ALIASES[rawIndustry] ?? rawIndustry;
  const industryKeywords = INDUSTRY_ISSUE_BOOST[normIndustry] || [];

  filteredNodes = filteredNodes.map((node) => {
    const matchesIndustry =
      industryKeywords.length > 0 &&
      industryKeywords.some(
        (keyword) =>
          node.title.toLowerCase().includes(keyword) ||
          node.summary.toLowerCase().includes(keyword)
      );

    const newRisk = { ...node.risk };
    if (matchesIndustry && node.type === 'issue') {
      newRisk.impact = Math.min(5, newRisk.impact + 1);
      newRisk.likelihood = Math.min(5, newRisk.likelihood + 1);
    }
    return { ...node, risk: newRisk };
  });

  // 4) Tag with first BU/Env/DataClass (simple defaults)
  filteredNodes = filteredNodes.map((node) => {
    const tags = [...(node.tags || [])];
    if (inputs.businessUnits.length > 0) tags.push(inputs.businessUnits[0]);
    if (inputs.environments.length > 0) tags.push(inputs.environments[0]);
    if (inputs.dataClasses.length > 0) tags.push(inputs.dataClasses[0]);
    return { ...node, tags };
  });

  // 5) Add integration links if software/hardware mentioned
  if (inputs.software.length > 0 || inputs.hardware.length > 0) {
    filteredNodes = filteredNodes.map((node) => {
      const links = [...(node.links || [])];
      const allTools = [...inputs.software, ...inputs.hardware].map((t) => t.toLowerCase());

      for (const tool of allTools) {
        // Identity / MFA
        if (node.summary.toLowerCase().includes('mfa') || node.summary.toLowerCase().includes('authentication')) {
          if (tool.includes('okta')) links.push({ label: 'Okta Integration Guide', url: 'https://docs.okta.com/' });
          if (tool.includes('duo')) links.push({ label: 'Duo Integration Guide', url: 'https://duo.com/docs' });
        }
        // Endpoint / EDR
        if (node.summary.toLowerCase().includes('endpoint') || node.summary.toLowerCase().includes('device')) {
          if (tool.includes('crowdstrike')) links.push({ label: 'CrowdStrike Integration', url: 'https://www.crowdstrike.com/resources/' });
          if (tool.includes('sentinelone')) links.push({ label: 'SentinelOne Integration', url: 'https://www.sentinelone.com/resources/' });
        }
        // Network / Firewall
        if (node.summary.toLowerCase().includes('firewall') || node.cloud === 'Azure') {
          if (tool.includes('palo alto')) links.push({ label: 'Palo Alto Networks Guide', url: 'https://docs.paloaltonetworks.com/' });
          if (tool.includes('fortinet')) links.push({ label: 'Fortinet Integration', url: 'https://docs.fortinet.com/' });
        }
      }
      return links.length > (node.links?.length || 0) ? { ...node, links } : node;
    });
  }

  // 6) Trim frameworks on each node to only selected ones (after potential emphasis)
  filteredNodes = filteredNodes.map((node) => {
    const filteredFrameworks = node.frameworks?.filter((fw) => inputs.frameworks.includes(fw.framework));
    return { ...node, frameworks: filteredFrameworks };
  });

  // 7) Build edges for present nodes
  const nodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = seedEdges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  // 8) Apply industry tuning right before returning (makes Industry matter)
  filteredNodes = applyIndustryTuning(filteredNodes, inputs);

  return { nodes: filteredNodes, edges: filteredEdges };
}

/* ------------------------------ Search & Filter ---------------------------- */

export function searchNodes(nodes: GraphNode[], searchTerm: string): GraphNode[] {
  if (!searchTerm.trim()) return nodes;
  const term = searchTerm.toLowerCase();
  return nodes.filter((node) => {
    if (node.title.toLowerCase().includes(term)) return true;
    if (node.summary.toLowerCase().includes(term)) return true;
    if (node.services?.some((s) => s.toLowerCase().includes(term))) return true;
    if (node.frameworks?.some((fw) => fw.id.toLowerCase().includes(term))) return true;
    if (node.frameworks?.some((fw) => fw.title.toLowerCase().includes(term))) return true;
    if (node.frameworks?.some((fw) => fw.framework.toLowerCase().includes(term))) return true;
    return false;
  });
}

export function filterNodes(
  nodes: GraphNode[],
  filters: {
    clouds: Cloud[];
    statuses: any[];
    severities: number[];
    frameworks: Framework[];
    businessUnits: string[];
    environments: string[];
  }
): GraphNode[] {
  return nodes.filter((node) => {
    if (filters.clouds.length > 0 && node.cloud) {
      if (!filters.clouds.includes(node.cloud)) return false;
    }
    if (filters.statuses.length > 0) {
      if (!filters.statuses.includes(node.status)) return false;
    }
    if (filters.severities.length > 0) {
      const avgRisk = (node.risk.impact + node.risk.likelihood + node.risk.exposure) / 3;
      const severity = Math.ceil(avgRisk);
      if (!filters.severities.includes(severity)) return false;
    }
    if (filters.frameworks.length > 0 && node.frameworks) {
      const hasFramework = node.frameworks.some((fw) => filters.frameworks.includes(fw.framework));
      if (!hasFramework) return false;
    }
    if (filters.businessUnits.length > 0) {
      const hasBU = node.tags?.some((tag) => filters.businessUnits.includes(tag));
      if (!hasBU) return false;
    }
    if (filters.environments.length > 0) {
      const hasEnv = node.tags?.some((tag) => filters.environments.includes(tag));
      if (!hasEnv) return false;
    }
    return true;
  });
}
