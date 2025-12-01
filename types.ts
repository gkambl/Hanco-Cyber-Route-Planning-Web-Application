import { ENV_ALLOW, CLASS_ALLOW } from './validation';

export type Framework =
  | 'NIST CSF 2.0'
  | 'NIST 800-53'
  | 'MITRE ATT&CK'
  | 'SOC 2'
  | 'GDPR'
  | 'HIPAA'
  | 'GLBA'
  | 'CCPA/CPRA';

export type Cloud = 'M365' | 'Azure' | 'AWS';

export type Environment = typeof ENV_ALLOW[number];
export type DataClassification = typeof CLASS_ALLOW[number];

export type NodeType = 'issue' | 'detection' | 'remediation' | 'validation' | 'control' | 'reference';

export type Status = 'Open' | 'In-Progress' | 'Verified';

export interface FrameworkRef {
  framework: Framework;
  id: string;
  title: string;
  notes?: string;
}

export interface NodeBase {
  id: string;
  type: NodeType;
  title: string;
  summary: string;
  cloud?: Cloud;
  services?: string[];
  risk: {
    impact: 1 | 2 | 3 | 4 | 5;
    likelihood: 1 | 2 | 3 | 4 | 5;
    exposure: 1 | 2 | 3 | 4 | 5;
  };
  status: Status;
  owners?: string[];
  tags?: string[];
  frameworks?: FrameworkRef[];
  links?: { label: string; url: string }[];
}

export interface RemediationDetail {
  steps: string[];
  guardrails?: string[];
  rollback?: string[];
  successCriteria?: string[];
  automationHints?: string[];
  validationChecks?: string[];
}

export interface RemediationNode extends NodeBase {
  type: 'remediation';
  details?: RemediationDetail;
}

export type GraphNode = NodeBase | RemediationNode;

export type EdgeRelation = 'leads-to' | 'blocked-by' | 'verifies' | 'duplicates';

export interface Edge {
  id: string;
  source: string;
  target: string;
  relation: EdgeRelation;
}

export interface AppInputs {
  company: string;
  industry: string;
  businessUnits: string[];
  environments: Environment[];
  dataClasses: DataClassification[];
  clouds: Cloud[];
  software: string[];
  hardware: string[];
  frameworks: Framework[];
  riskDefaults: {
    impact: number;
    likelihood: number;
    exposure: number;
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: Edge[];
  inputs: AppInputs;
}
