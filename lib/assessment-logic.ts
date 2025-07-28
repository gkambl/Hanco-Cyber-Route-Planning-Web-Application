// lib/assessment-config.ts

export interface AssessmentOption {
  id: string;
  label: string;
  value: string | number;
  riskMultiplier: number;
  tooltip?: string;
  riskImpact?: 'low' | 'medium' | 'high' | 'critical';
}

export interface BranchingCondition {
  questionId: string;
  operator: 'includes' | 'excludes' | 'equals' | 'greaterThan' | 'lessThan';
  value: string | number;
}

export interface AssessmentQuestion {
  id: string;
  title: string;
  description: string;
  type: 'multiSelect' | 'singleSelect' | 'slider' | 'text';
  tooltip?: string;
  required: boolean;
  weight: number;
  options?: AssessmentOption[];
  meta?: {
    noviceFriendly?: boolean;
    expertOnly?: boolean;
    showIf?: BranchingCondition[];
    hideIf?: BranchingCondition[];
    industrySpecific?: string[];
    companySize?: string[];
    riskThreshold?: number;
  };
}

export const assessmentQuestions: AssessmentQuestion[] = [
  // ─── 0. CURRENCY PREFERENCE ─────────────────────────────────────────────────────
  {
    id: 'currency-preference',
    title: 'What currency would you like to see pricing in?',
    description: 'All pricing estimates will be shown in your preferred currency.',
    type: 'singleSelect',
    required: true,
    weight: 0,
    options: [
      {
        id: 'gbp',
        label: 'British Pounds (£)',
        value: 'gbp',
        riskMultiplier: 0,
        tooltip: 'UK Pounds Sterling',
        riskImpact: 'low'
      },
      {
        id: 'usd',
        label: 'US Dollars ($)',
        value: 'usd',
        riskMultiplier: 0,
        tooltip: 'United States Dollars',
        riskImpact: 'low'
      },
      {
        id: 'eur',
        label: 'Euros (€)',
        value: 'eur',
        riskMultiplier: 0,
        tooltip: 'European Union Euros',
        riskImpact: 'low'
      },
      {
        id: 'cad',
        label: 'Canadian Dollars (C$)',
        value: 'cad',
        riskMultiplier: 0,
        tooltip: 'Canadian Dollars',
        riskImpact: 'low'
      },
      {
        id: 'aud',
        label: 'Australian Dollars (A$)',
        value: 'aud',
        riskMultiplier: 0,
        tooltip: 'Australian Dollars',
        riskImpact: 'low'
      }
    ],
    meta: { noviceFriendly: true }
  },

  // ─── 1. USER PROFICIENCY ─────────────────────────────────────────────────────
  {
    id: 'user-proficiency',
    title: 'How would you describe your cyber security knowledge?',
    description: 'This helps us tailor the assessment complexity to your expertise level.',
    type: 'singleSelect',
    required: true,
    weight: 0,
    options: [
      {
        id: 'novice',
        label: "I'm new to cyber security",
        value: 'novice',
        riskMultiplier: 0,
        tooltip: "You'll see essential, high-level questions focused on business impact",
        riskImpact: 'low'
      },
      {
        id: 'intermediate',
        label: 'I have some experience',
        value: 'intermediate',
        riskMultiplier: 0,
        tooltip: "You'll see most questions, balanced between technical and business",
        riskImpact: 'low'
      },
      {
        id: 'expert',
        label: "I'm a cyber security professional",
        value: 'expert',
        riskMultiplier: 0,
        tooltip: "You'll see all questions, including deep technical detail",
        riskImpact: 'low'
      }
    ],
    meta: { noviceFriendly: true }
  },

  // ─── 2.5. Current Security Controls Assessment ─────────────────────────────────
  {
    id: 'current-security-controls',
    title: 'Current Security Controls',
    description: 'Which security controls do you currently have in place?',
    type: 'multiSelect',
    tooltip: 'Helps us understand your existing security posture more accurately',
    required: true,
    weight: 2.0,
    options: [
      { id: 'endpoint-protection', label: 'Endpoint Protection (Antivirus/EDR)', value: 'endpoint-protection', riskMultiplier: -0.3, tooltip: 'Reduces malware and endpoint threats', riskImpact: 'low' },
      { id: 'firewall-configured', label: 'Properly Configured Firewall', value: 'firewall-configured', riskMultiplier: -0.2, tooltip: 'Network perimeter protection', riskImpact: 'low' },
      { id: 'mfa-enabled', label: 'Multi-Factor Authentication', value: 'mfa-enabled', riskMultiplier: -0.4, tooltip: 'Significantly reduces account compromise', riskImpact: 'low' },
      { id: 'backup-strategy', label: 'Regular Backups (Tested)', value: 'backup-strategy', riskMultiplier: -0.3, tooltip: 'Critical for ransomware recovery', riskImpact: 'low' },
      { id: 'patch-management', label: 'Automated Patch Management', value: 'patch-management', riskMultiplier: -0.3, tooltip: 'Reduces vulnerability exposure', riskImpact: 'low' },
      { id: 'security-monitoring', label: 'Security Monitoring/SIEM', value: 'security-monitoring', riskMultiplier: -0.4, tooltip: 'Early threat detection', riskImpact: 'low' },
      { id: 'employee-training', label: 'Regular Security Training', value: 'employee-training', riskMultiplier: -0.2, tooltip: 'Reduces human error risks', riskImpact: 'low' },
      { id: 'incident-response-plan', label: 'Incident Response Plan', value: 'incident-response-plan', riskMultiplier: -0.2, tooltip: 'Faster recovery from incidents', riskImpact: 'low' },
      { id: 'vulnerability-scanning', label: 'Regular Vulnerability Scanning', value: 'vulnerability-scanning', riskMultiplier: -0.3, tooltip: 'Proactive vulnerability management', riskImpact: 'low' },
      { id: 'email-security', label: 'Advanced Email Security', value: 'email-security', riskMultiplier: -0.2, tooltip: 'Blocks phishing and malware', riskImpact: 'low' },
      { id: 'network-segmentation', label: 'Network Segmentation', value: 'network-segmentation', riskMultiplier: -0.3, tooltip: 'Limits breach impact', riskImpact: 'low' },
      { id: 'privileged-access', label: 'Privileged Access Management', value: 'privileged-access', riskMultiplier: -0.4, tooltip: 'Controls admin access', riskImpact: 'low' },
      { id: 'minimal-controls', label: 'Minimal/Basic Controls Only', value: 'minimal-controls', riskMultiplier: 1.5, tooltip: 'High risk exposure', riskImpact: 'critical' }
    ],
    meta: { noviceFriendly: true }
  },

  // ─── 2.6. Data Sensitivity Assessment ─────────────────────────────────────
  {
    id: 'data-sensitivity',
    title: 'Data Sensitivity & Volume',
    description: 'What types of sensitive data does your organisation handle?',
    type: 'multiSelect',
    tooltip: 'Different data types have different risk profiles and regulatory requirements',
    required: true,
    weight: 1.8,
    options: [
      { id: 'customer-pii', label: 'Customer Personal Data (PII)', value: 'customer-pii', riskMultiplier: 1.4, tooltip: 'GDPR and privacy law implications', riskImpact: 'high' },
      { id: 'payment-data', label: 'Payment Card Data', value: 'payment-data', riskMultiplier: 1.8, tooltip: 'PCI DSS compliance required', riskImpact: 'critical' },
      { id: 'health-records', label: 'Health/Medical Records', value: 'health-records', riskMultiplier: 1.9, tooltip: 'HIPAA and strict privacy laws', riskImpact: 'critical' },
      { id: 'financial-records', label: 'Financial Records', value: 'financial-records', riskMultiplier: 1.6, tooltip: 'Financial regulations and SOX', riskImpact: 'high' },
      { id: 'intellectual-property', label: 'Intellectual Property/Trade Secrets', value: 'intellectual-property', riskMultiplier: 1.5, tooltip: 'Competitive advantage at risk', riskImpact: 'high' },
      { id: 'government-data', label: 'Government/Classified Data', value: 'government-data', riskMultiplier: 2.0, tooltip: 'National security implications', riskImpact: 'critical' },
      { id: 'employee-data', label: 'Employee HR Data', value: 'employee-data', riskMultiplier: 1.2, tooltip: 'Employment law and privacy', riskImpact: 'medium' },
      { id: 'business-confidential', label: 'Business Confidential Data', value: 'business-confidential', riskMultiplier: 1.1, tooltip: 'Competitive information', riskImpact: 'medium' },
      { id: 'public-data-only', label: 'Mostly Public Data', value: 'public-data-only', riskMultiplier: 0.7, tooltip: 'Lower sensitivity profile', riskImpact: 'low' }
    ],
    meta: { noviceFriendly: true }
  },

  // ─── 2.7. IT Infrastructure Complexity ─────────────────────────────────────
  {
    id: 'infrastructure-complexity',
    title: 'IT Infrastructure Complexity',
    description: 'Describe your current IT infrastructure setup',
    type: 'multiSelect',
    tooltip: 'Infrastructure complexity directly impacts security risk and implementation approach',
    required: true,
    weight: 1.6,
    options: [
      { id: 'cloud-native', label: 'Cloud-Native (AWS/Azure/GCP)', value: 'cloud-native', riskMultiplier: 1.0, tooltip: 'Modern but needs cloud security expertise', riskImpact: 'medium' },
      { id: 'hybrid-cloud', label: 'Hybrid Cloud Environment', value: 'hybrid-cloud', riskMultiplier: 1.3, tooltip: 'Complex integration challenges', riskImpact: 'medium' },
      { id: 'on-premise-modern', label: 'Modern On-Premise Infrastructure', value: 'on-premise-modern', riskMultiplier: 1.1, tooltip: 'Controlled but needs maintenance', riskImpact: 'medium' },
      { id: 'legacy-systems', label: 'Legacy Systems (10+ years)', value: 'legacy-systems', riskMultiplier: 1.8, tooltip: 'High risk from outdated security', riskImpact: 'critical' },
      { id: 'mixed-environment', label: 'Mixed Legacy and Modern', value: 'mixed-environment', riskMultiplier: 1.4, tooltip: 'Integration and compatibility issues', riskImpact: 'high' },
      { id: 'saas-heavy', label: 'SaaS-Heavy Environment', value: 'saas-heavy', riskMultiplier: 1.1, tooltip: 'Third-party dependency risks', riskImpact: 'medium' },
      { id: 'iot-devices', label: 'IoT/Connected Devices', value: 'iot-devices', riskMultiplier: 1.5, tooltip: 'Expanded attack surface', riskImpact: 'high' },
      { id: 'mobile-first', label: 'Mobile-First Operations', value: 'mobile-first', riskMultiplier: 1.2, tooltip: 'Mobile security challenges', riskImpact: 'medium' }
    ],
    meta: { 
      hideIf: [
        { questionId: 'user-proficiency', operator: 'equals', value: 'novice' }
      ]
    }
  },

  // ─── 2.8. Previous Security Incidents ─────────────────────────────────────
  {
    id: 'security-incidents',
    title: 'Previous Security Incidents',
    description: 'Has your organisation experienced any security incidents in the past 2 years?',
    type: 'multiSelect',
    tooltip: 'Past incidents indicate current vulnerabilities and help prioritise defenses',
    required: true,
    weight: 2.2,
    options: [
      { id: 'no-incidents', label: 'No Known Security Incidents', value: 'no-incidents', riskMultiplier: 0.8, tooltip: 'Good track record or undetected issues', riskImpact: 'low' },
      { id: 'phishing-attempts', label: 'Phishing/Email Attacks', value: 'phishing-attempts', riskMultiplier: 1.3, tooltip: 'Common attack vector, needs training', riskImpact: 'medium' },
      { id: 'malware-infection', label: 'Malware/Virus Infections', value: 'malware-infection', riskMultiplier: 1.5, tooltip: 'Endpoint security gaps', riskImpact: 'high' },
      { id: 'data-breach', label: 'Data Breach/Unauthorized Access', value: 'data-breach', riskMultiplier: 2.0, tooltip: 'Serious security failure', riskImpact: 'critical' },
      { id: 'ransomware-attack', label: 'Ransomware Attack', value: 'ransomware-attack', riskMultiplier: 2.2, tooltip: 'Critical business disruption', riskImpact: 'critical' },
      { id: 'insider-incident', label: 'Insider Threat Incident', value: 'insider-incident', riskMultiplier: 1.7, tooltip: 'Internal controls needed', riskImpact: 'high' },
      { id: 'ddos-attack', label: 'DDoS/Service Disruption', value: 'ddos-attack', riskMultiplier: 1.4, tooltip: 'Availability and resilience issues', riskImpact: 'medium' },
      { id: 'supply-chain-compromise', label: 'Vendor/Supply Chain Compromise', value: 'supply-chain-compromise', riskMultiplier: 1.8, tooltip: 'Third-party risk management needed', riskImpact: 'high' },
      { id: 'unsure-incidents', label: 'Unsure/No Monitoring in Place', value: 'unsure-incidents', riskMultiplier: 1.6, tooltip: 'Blind spots in security monitoring', riskImpact: 'high' }
    ],
    meta: { noviceFriendly: true }
  },

  // ─── 2.9. Company Size & Revenue (for better risk profiling) ─────────────────
  {
    id: 'company-size-revenue',
    title: 'Company Size & Annual Revenue',
    description: 'Help us understand your organization\'s scale for accurate risk assessment',
    type: 'singleSelect',
    tooltip: 'Company size affects threat exposure, regulatory requirements, and available resources',
    required: true,
    weight: 1.3,
    options: [
      { id: 'micro', label: 'Micro Business (<£100k revenue)', value: 'micro', riskMultiplier: 0.7, tooltip: 'Lower profile but limited security resources', riskImpact: 'low' },
      { id: 'small', label: 'Small Business (£100k-£2M)', value: 'small', riskMultiplier: 0.9, tooltip: 'Growing visibility with basic security needs', riskImpact: 'medium' },
      { id: 'medium', label: 'Medium Business (£2M-£25M)', value: 'medium', riskMultiplier: 1.2, tooltip: 'Attractive target with complex requirements', riskImpact: 'medium' },
      { id: 'large', label: 'Large Business (£25M-£100M)', value: 'large', riskMultiplier: 1.5, tooltip: 'High-value target with regulatory scrutiny', riskImpact: 'high' },
      { id: 'enterprise', label: 'Enterprise (£100M+)', value: 'enterprise', riskMultiplier: 1.8, tooltip: 'Prime target with complex global operations', riskImpact: 'critical' }
    ],
    meta: { noviceFriendly: true }
  },

  // ─── 2.10. Geographic Operations (for regulatory complexity) ─────────────────
  {
    id: 'geographic-operations',
    title: 'Geographic Operations',
    description: 'Where does your organization operate?',
    type: 'multiSelect',
    tooltip: 'Different regions have different regulatory requirements and threat landscapes',
    required: true,
    weight: 1.2,
    options: [
      { id: 'uk-only', label: 'UK Only', value: 'uk-only', riskMultiplier: 1.0, tooltip: 'UK regulations (GDPR, NIS2, Cyber Essentials)', riskImpact: 'medium' },
      { id: 'eu-operations', label: 'European Union', value: 'eu-operations', riskMultiplier: 1.3, tooltip: 'GDPR, NIS2, and country-specific requirements', riskImpact: 'medium' },
      { id: 'us-operations', label: 'United States', value: 'us-operations', riskMultiplier: 1.4, tooltip: 'State privacy laws, sector regulations', riskImpact: 'high' },
      { id: 'apac-operations', label: 'Asia-Pacific', value: 'apac-operations', riskMultiplier: 1.2, tooltip: 'Diverse regulatory landscape', riskImpact: 'medium' },
      { id: 'global-operations', label: 'Global Operations', value: 'global-operations', riskMultiplier: 1.6, tooltip: 'Complex multi-jurisdictional compliance', riskImpact: 'high' },
      { id: 'emerging-markets', label: 'Emerging Markets', value: 'emerging-markets', riskMultiplier: 1.5, tooltip: 'Higher threat environment', riskImpact: 'high' }
    ],
    meta: { 
      hideIf: [
        { questionId: 'user-proficiency', operator: 'equals', value: 'novice' }
      ]
    }
  },

  // ─── 2. Organisation Profile & Scale ───────────────────────────────────────────
  {
    id: 'org-profile',
    title: 'Organisation Profile & Scale',
    description: 'Help us understand your organisation structure and operational scale',
    type: 'multiSelect',
    tooltip: 'Organisation size and complexity directly impact cyber security requirements and threat exposure',
    required: true,
    weight: 1.2,
    options: [
      { id: 'startup',       label: 'Startup (1-50 employees)',           value: 'startup',       riskMultiplier: 0.8, tooltip: 'Smaller attack surface but limited resources',         riskImpact: 'low' },
      { id: 'sme',           label: 'SME (51-250 employees)',             value: 'sme',           riskMultiplier: 1.0, tooltip: 'Growing complexity needs structure',                  riskImpact: 'medium' },
      { id: 'enterprise',    label: 'Enterprise (250+ employees)',        value: 'enterprise',    riskMultiplier: 1.4, tooltip: 'Complex infrastructure with many attack vectors',    riskImpact: 'high' },
      { id: 'multinational', label: 'Multinational Corporation',          value: 'multinational', riskMultiplier: 1.8, tooltip: 'Global ops face diverse compliance requirements',     riskImpact: 'critical' },
      { id: 'remote-first',  label: 'Remote-first Organisation',          value: 'remote-first',  riskMultiplier: 1.3, tooltip: 'Distributed workforce adds complexity',              riskImpact: 'medium' },
      { id: 'hybrid-model',  label: 'Hybrid Work Model',                  value: 'hybrid-model',  riskMultiplier: 1.1, tooltip: 'Mixed environments need broad controls',             riskImpact: 'medium' }
    ],
    meta: { noviceFriendly: true }
  },

  // ─── 2.9. Company Size & Revenue (for better risk profiling) ─────────────────
  {
    id: 'technology-stack',
    title: 'Primary Technology Stack',
    description: 'What technology ecosystem does your organization primarily use?',
    type: 'singleSelect',
    tooltip: 'Technology choices affect security architecture and threat exposure',
    required: true,
    weight: 1.4,
    options: [
      { id: 'microsoft-stack', label: 'Microsoft Ecosystem (Office 365, Azure, Windows)', value: 'microsoft-stack', riskMultiplier: 1.0, tooltip: 'Integrated security but high-value target', riskImpact: 'medium' },
      { id: 'google-workspace', label: 'Google Workspace & Cloud', value: 'google-workspace', riskMultiplier: 0.9, tooltip: 'Strong built-in security features', riskImpact: 'low' },
      { id: 'aws-ecosystem', label: 'Amazon Web Services Ecosystem', value: 'aws-ecosystem', riskMultiplier: 1.1, tooltip: 'Powerful but complex security model', riskImpact: 'medium' },
      { id: 'open-source-heavy', label: 'Open Source Heavy', value: 'open-source-heavy', riskMultiplier: 1.3, tooltip: 'Flexible but requires security expertise', riskImpact: 'medium' },
      { id: 'saas-first', label: 'SaaS-First Approach', value: 'saas-first', riskMultiplier: 1.2, tooltip: 'Third-party dependency risks', riskImpact: 'medium' },
      { id: 'custom-developed', label: 'Custom/In-House Development', value: 'custom-developed', riskMultiplier: 1.4, tooltip: 'Full control but security responsibility', riskImpact: 'high' },
      { id: 'legacy-proprietary', label: 'Legacy Proprietary Systems', value: 'legacy-proprietary', riskMultiplier: 1.8, tooltip: 'Limited security updates and support', riskImpact: 'critical' }
    ],
    meta: { 
      hideIf: [
        { questionId: 'user-proficiency', operator: 'equals', value: 'novice' }
      ]
    }
  },

  // ─── 3. Industry Vertical ────────────────────────────────────────────────────────
  {
    id: 'industry-vertical',
    title: 'Industry Vertical',
    description: 'Select your primary industry sector',
    type: 'singleSelect',
    tooltip: 'Different industries face unique threat profiles and regulatory requirements',
    required: true,
    weight: 1.5,
    options: [
      { id: 'financial', label: 'Financial Services', value: 'financial', riskMultiplier: 2.0, tooltip: 'High-value target with strict regulations', riskImpact: 'critical' },
      { id: 'healthcare', label: 'Healthcare & Life Sciences', value: 'healthcare', riskMultiplier: 1.9, tooltip: 'Patient data under GDPR & HIPAA', riskImpact: 'critical' },
      { id: 'government', label: 'Government & Public Sector', value: 'government', riskMultiplier: 1.8, tooltip: 'National security & public data', riskImpact: 'critical' },
      { id: 'technology', label: 'Technology & Software', value: 'technology', riskMultiplier: 1.6, tooltip: 'IP protection & supply chain risks', riskImpact: 'high' },
      { id: 'manufacturing', label: 'Manufacturing & Industrial', value: 'manufacturing', riskMultiplier: 1.4, tooltip: 'OT/IT convergence risks', riskImpact: 'high' },
      { id: 'retail', label: 'Retail & E-commerce', value: 'retail', riskMultiplier: 1.3, tooltip: 'Customer data & payment processing', riskImpact: 'medium' },
      { id: 'education', label: 'Education', value: 'education', riskMultiplier: 1.1, tooltip: 'Student data & research IP', riskImpact: 'medium' },
      { id: 'professional', label: 'Professional Services', value: 'professional', riskMultiplier: 1.0, tooltip: 'Client confidentiality focus', riskImpact: 'medium' },
      { id: 'other', label: 'Other', value: 'other', riskMultiplier: 1.0, tooltip: 'Sector-specific risk model', riskImpact: 'medium' },
    ],
    meta: { noviceFriendly: true }
  },

  // ─── Industry-Specific Threat Concerns ─────────────────
  {
    id: 'industry-specific-threats',
    title: 'Industry-Specific Security Concerns',
    description: 'Which industry-specific threats are most concerning for your organization?',
    type: 'multiSelect',
    tooltip: 'Industry-specific threats require specialized security controls and expertise',
    required: true,
    weight: 1.5,
    options: [
      // Financial Services
      { id: 'financial-fraud', label: 'Financial Fraud & Money Laundering', value: 'financial-fraud', riskMultiplier: 2.0, tooltip: 'Direct financial impact and regulatory scrutiny', riskImpact: 'critical' },
      { id: 'trading-systems', label: 'Trading System Manipulation', value: 'trading-systems', riskMultiplier: 1.9, tooltip: 'Market manipulation and systemic risk', riskImpact: 'critical' },
      
      // Healthcare
      { id: 'patient-data-breach', label: 'Patient Data Breaches', value: 'patient-data-breach', riskMultiplier: 1.8, tooltip: 'HIPAA violations and patient privacy', riskImpact: 'critical' },
      { id: 'medical-device-security', label: 'Medical Device Security', value: 'medical-device-security', riskMultiplier: 1.7, tooltip: 'Life-critical system vulnerabilities', riskImpact: 'critical' },
      
      // Manufacturing
      { id: 'industrial-espionage', label: 'Industrial Espionage', value: 'industrial-espionage', riskMultiplier: 1.6, tooltip: 'Trade secret and IP theft', riskImpact: 'high' },
      { id: 'operational-disruption', label: 'Production Line Disruption', value: 'operational-disruption', riskMultiplier: 1.8, tooltip: 'Physical safety and business continuity', riskImpact: 'critical' },
      
      // Technology
      { id: 'source-code-theft', label: 'Source Code & IP Theft', value: 'source-code-theft', riskMultiplier: 1.7, tooltip: 'Competitive advantage loss', riskImpact: 'high' },
      { id: 'supply-chain-attacks', label: 'Software Supply Chain Attacks', value: 'supply-chain-attacks', riskMultiplier: 1.9, tooltip: 'Downstream customer impact', riskImpact: 'critical' },
      
      // Retail/E-commerce
      { id: 'payment-fraud', label: 'Payment Processing Fraud', value: 'payment-fraud', riskMultiplier: 1.6, tooltip: 'PCI compliance and customer trust', riskImpact: 'high' },
      { id: 'customer-data-theft', label: 'Customer Database Theft', value: 'customer-data-theft', riskMultiplier: 1.5, tooltip: 'GDPR fines and reputation damage', riskImpact: 'high' },
      
      // Professional Services
      { id: 'client-confidentiality', label: 'Client Confidentiality Breaches', value: 'client-confidentiality', riskMultiplier: 1.4, tooltip: 'Professional liability and trust', riskImpact: 'medium' },
      { id: 'regulatory-reporting', label: 'Regulatory Reporting Integrity', value: 'regulatory-reporting', riskMultiplier: 1.3, tooltip: 'Compliance and audit requirements', riskImpact: 'medium' },
      
      // General
      { id: 'business-email-compromise', label: 'Business Email Compromise', value: 'business-email-compromise', riskMultiplier: 1.4, tooltip: 'Financial fraud via email', riskImpact: 'high' },
      { id: 'cloud-misconfigurations', label: 'Cloud Security Misconfigurations', value: 'cloud-misconfigurations', riskMultiplier: 1.3, tooltip: 'Data exposure in cloud services', riskImpact: 'medium' }
    ],
    meta: {
      showIf: [
        { questionId: 'industry-vertical', operator: 'excludes', value: 'other' }
      ]
    }
  },

  // ─── 4. Current cyber security Maturity ─────────────────────────────────────────
  {
    id: 'cyber-maturity',
    title: 'Cyber Security Programme Maturity',
    description: 'How would you describe your organisation\'s current cyber security programme?',
    type: 'singleSelect',
    tooltip: 'This helps us understand your starting point and recommend appropriate next steps',
    required: true,
    weight: 1.8,
    options: [
      { id: 'ad-hoc', label: 'Ad-hoc (No formal programme)', value: 'ad-hoc', riskMultiplier: 2.8, tooltip: 'Individual tools without coordination', riskImpact: 'critical' },
      { id: 'basic', label: 'Basic (Essential tools only)', value: 'basic', riskMultiplier: 2.3, tooltip: 'Antivirus, firewall, basic controls', riskImpact: 'critical' },
      { id: 'developing', label: 'Developing (Policies + procedures)', value: 'developing', riskMultiplier: 1.9, tooltip: 'Documented processes, regular updates', riskImpact: 'high' },
      { id: 'managed', label: 'Managed (Structured programme)', value: 'managed', riskMultiplier: 1.4, tooltip: 'Formal governance, monitoring, metrics', riskImpact: 'medium' },
      { id: 'advanced', label: 'Advanced (Proactive defence)', value: 'advanced', riskMultiplier: 1.0, tooltip: 'Threat hunting, advanced analytics', riskImpact: 'low' },
      { id: 'optimized', label: 'Optimised (Continuous improvement)', value: 'optimized', riskMultiplier: 0.7, tooltip: 'Mature programme with automation', riskImpact: 'low' },
      { id: 'uncertain', label: 'Uncertain / Needs assessment', value: 'uncertain', riskMultiplier: 2.4, tooltip: 'Current state unknown', riskImpact: 'high' },
    ],
    meta: { noviceFriendly: true }
  },

  // ─── Security Team Capability ─────────────────
  {
    id: 'security-team-capability',
    title: 'Security Team & Expertise',
    description: 'What internal security capability does your organization have?',
    type: 'singleSelect',
    tooltip: 'Internal capability affects service delivery approach and support requirements',
    required: true,
    weight: 1.4,
    options: [
      { id: 'no-security-team', label: 'No Dedicated Security Personnel', value: 'no-security-team', riskMultiplier: 2.0, tooltip: 'Requires fully managed services', riskImpact: 'critical' },
      { id: 'part-time-security', label: 'Part-time/Shared Security Responsibility', value: 'part-time-security', riskMultiplier: 1.6, tooltip: 'Limited security focus and expertise', riskImpact: 'high' },
      { id: 'single-security-person', label: 'One Dedicated Security Person', value: 'single-security-person', riskMultiplier: 1.3, tooltip: 'Single point of failure, needs support', riskImpact: 'medium' },
      { id: 'small-security-team', label: 'Small Security Team (2-5 people)', value: 'small-security-team', riskMultiplier: 1.0, tooltip: 'Good foundation, may need specialization', riskImpact: 'low' },
      { id: 'mature-security-team', label: 'Mature Security Team (5+ specialists)', value: 'mature-security-team', riskMultiplier: 0.8, tooltip: 'Strong internal capability', riskImpact: 'low' },
      { id: 'ciso-led-team', label: 'CISO-Led Security Organization', value: 'ciso-led-team', riskMultiplier: 0.6, tooltip: 'Executive-level security leadership', riskImpact: 'low' }
    ],
    meta: { 
      hideIf: [
        { questionId: 'user-proficiency', operator: 'equals', value: 'novice' }
      ]
    }
  },

  // ─── 5. Compliance Requirements (conditional) ─────────────────────────────────────────────────
  {
    id: 'compliance-needs',
    title: 'Compliance requirements',
    description: 'Select all regulatory frameworks that apply to your organisation',
    type: 'multiSelect',
    tooltip: 'Drives specific controls and audits',
    required: true,
    weight: 1.4,
    options: [
      { id: 'gdpr', label: 'GDPR', value: 'gdpr', riskMultiplier: 1.6, tooltip: 'EU data law with heavy fines', riskImpact: 'high' },
      { id: 'nis2', label: 'NIS2 Directive', value: 'nis2', riskMultiplier: 1.8, tooltip: 'Critical infrastructure requirements', riskImpact: 'high' },
      { id: 'iso27001', label: 'ISO 27001', value: 'iso27001', riskMultiplier: 1.2, tooltip: 'International standard', riskImpact: 'medium' },
      { id: 'pci-dss', label: 'PCI DSS', value: 'pci-dss', riskMultiplier: 1.7, tooltip: 'Payment card industry standard', riskImpact: 'high' },
      { id: 'sox', label: 'SOX', value: 'sox', riskMultiplier: 1.5, tooltip: 'Financial reporting controls', riskImpact: 'medium' },
      { id: 'hipaa', label: 'HIPAA', value: 'hipaa', riskMultiplier: 1.8, tooltip: 'US healthcare data law', riskImpact: 'high' },
      { id: 'cyber-essentials', label: 'Cyber Essentials', value: 'cyber-essentials', riskMultiplier: 1.1, tooltip: 'UK government certification', riskImpact: 'low' },
      { id: 'nist', label: 'NIST Framework', value: 'nist', riskMultiplier: 1.3, tooltip: 'Widely adopted framework', riskImpact: 'medium' },
      { id: 'none', label: 'No specific requirements', value: 'none', riskMultiplier: 1.0, tooltip: 'Use best practices & risk management', riskImpact: 'low' },
    ],
    meta: { 
      hideIf: [
        { questionId: 'user-proficiency', operator: 'equals', value: 'novice' }
      ]
    }
  },

  // ─── Audit Frequency ─────────────────
  {
    id: 'audit-frequency',
    title: 'Audit & Compliance Frequency',
    description: 'How often does your organization undergo security or compliance audits?',
    type: 'singleSelect',
    tooltip: 'Audit frequency affects ongoing compliance overhead and documentation requirements',
    required: false,
    weight: 1.3,
    options: [
      { id: 'no-audits', label: 'No Regular Audits', value: 'no-audits', riskMultiplier: 0.9, tooltip: 'Lower compliance overhead', riskImpact: 'low' },
      { id: 'annual-audits', label: 'Annual Compliance Audits', value: 'annual-audits', riskMultiplier: 1.2, tooltip: 'Standard compliance requirements', riskImpact: 'medium' },
      { id: 'quarterly-reviews', label: 'Quarterly Compliance Reviews', value: 'quarterly-reviews', riskMultiplier: 1.4, tooltip: 'High regulatory scrutiny', riskImpact: 'medium' },
      { id: 'continuous-monitoring', label: 'Continuous Regulatory Monitoring', value: 'continuous-monitoring', riskMultiplier: 1.6, tooltip: 'Critical infrastructure or high-risk sector', riskImpact: 'high' },
      { id: 'multiple-regulators', label: 'Multiple Regulatory Bodies', value: 'multiple-regulators', riskMultiplier: 1.8, tooltip: 'Complex overlapping requirements', riskImpact: 'high' }
    ],
    meta: {
      showIf: [
        { questionId: 'compliance-needs', operator: 'excludes', value: 'none' }
      ]
    }
  },

  // ─── 6. Investment Flexibility ─────────────────────────────────────────────────
  {
    id: 'budget-flexibility',
    title: 'Investment Flexibility',
    description: 'How flexible is your cyber security investment approach?',
    type: 'slider',
    tooltip: 'Helps us recommend appropriate service levels',
    required: true,
    weight: 1.0,
    options: [
      { id: 'conservative', label: 'Conservative', value: 25, riskMultiplier: 1.4, tooltip: 'Gradual rollout with ROI validation each phase', riskImpact: 'medium' },
      { id: 'balanced', label: 'Balanced', value: 50, riskMultiplier: 1.0, tooltip: 'Balance between cost & risk mitigation', riskImpact: 'low' },
      { id: 'aggressive', label: 'Aggressive', value: 75, riskMultiplier: 0.7, tooltip: 'Rapid deployment of comprehensive controls', riskImpact: 'low' },
      { id: 'unlimited', label: 'Risk-driven', value: 100, riskMultiplier: 0.5, tooltip: 'Budget driven by risk appetite', riskImpact: 'low' },
    ],
    meta: { noviceFriendly: true }
  },

  // ─── Annual Security Budget ─────────────────
  {
    id: 'annual-security-budget',
    title: 'Annual Security Budget',
    description: 'What is your approximate annual cyber security budget?',
    type: 'singleSelect',
    tooltip: 'Budget constraints help us recommend appropriate service tiers and implementation approaches',
    required: true,
    weight: 1.1,
    options: [
      { id: 'under-10k', label: 'Under £10,000', value: 'under-10k', riskMultiplier: 1.4, tooltip: 'Limited budget requires focused priorities', riskImpact: 'medium' },
      { id: '10k-50k', label: '£10,000 - £50,000', value: '10k-50k', riskMultiplier: 1.2, tooltip: 'Good foundation budget for SMEs', riskImpact: 'low' },
      { id: '50k-100k', label: '£50,000 - £100,000', value: '50k-100k', riskMultiplier: 1.0, tooltip: 'Comprehensive security programme possible', riskImpact: 'low' },
      { id: '100k-500k', label: '£100,000 - £500,000', value: '100k-500k', riskMultiplier: 0.9, tooltip: 'Enterprise-grade security capabilities', riskImpact: 'low' },
      { id: '500k-1m', label: '£500,000 - £1,000,000', value: '500k-1m', riskMultiplier: 0.8, tooltip: 'Advanced security with dedicated resources', riskImpact: 'low' },
      { id: 'over-1m', label: 'Over £1,000,000', value: 'over-1m', riskMultiplier: 0.7, tooltip: 'Mature security organization possible', riskImpact: 'low' },
      { id: 'no-budget', label: 'No Dedicated Security Budget', value: 'no-budget', riskMultiplier: 1.8, tooltip: 'High risk due to resource constraints', riskImpact: 'high' }
    ],
    meta: { noviceFriendly: true }
  },

// ─── 7. Implementation Timeline ────────────────────────────────────────────────
{
  id: 'urgency-timeline',
  title: 'Implementation timeline',
  description: "What's driving your cyber security initiative timeline?",
  type: 'multiSelect',
  tooltip: 'Helps prioritise services and onboarding approach',
  required: true,
  weight: 1.3,
  options: [
    { id: 'immediate-threat',      label: 'Immediate threat response',     value: 'immediate-threat',      riskMultiplier: 2.0, tooltip: 'Active incident demands urgent action',           riskImpact: 'critical' },
    { id: 'compliance-deadline',   label: 'Compliance deadline',           value: 'compliance-deadline',   riskMultiplier: 1.8, tooltip: 'Fixed audit or regulatory deadline',               riskImpact: 'high' },
    { id: 'board-mandate',         label: 'Board mandate',                 value: 'board-mandate',         riskMultiplier: 1.5, tooltip: 'Executive directive for security improvement',    riskImpact: 'medium' },
    { id: 'growth-scaling',        label: 'Business growth/scaling',       value: 'growth-scaling',        riskMultiplier: 1.2, tooltip: 'Support expansion with security foundation',     riskImpact: 'medium' },
    { id: 'contract-requirement',  label: 'Contract requirement',          value: 'contract-requirement',  riskMultiplier: 1.4, tooltip: 'Security clauses in client contracts',           riskImpact: 'medium' },
    { id: 'strategic-planning',    label: 'Strategic planning',            value: 'strategic-planning',    riskMultiplier: 1.0, tooltip: 'Planned roadmap integration',                     riskImpact: 'low' },
    { id: 'no-urgency',            label: 'No specific urgency',           value: 'no-urgency',            riskMultiplier: 0.8, tooltip: 'Enhancement without time pressure',               riskImpact: 'low' }
  ],
  meta: { noviceFriendly: true }
},

  // ─── 8. Primary Threat Concerns (expert/intermediate only) ───────────────────────────────────────────────
  {
    id: 'threat-priorities',
    title: 'Top Security Concerns',
    description: 'Which security threats are you most concerned about? (Select up to 4 that worry you most)',
    type: 'multiSelect',
    tooltip: 'Helps us prioritise the most relevant security controls for your threat landscape',
    required: true,
    weight: 1.6,
    options: [
      { id: 'ransomware', label: 'Ransomware Attacks', value: 'ransomware', riskMultiplier: 2.1, tooltip: 'Business shutdown, data encryption, ransom demands', riskImpact: 'critical' },
      { id: 'data-breach', label: 'Data Breaches & Privacy Violations', value: 'data-breach', riskMultiplier: 1.9, tooltip: 'Customer data theft, GDPR fines, reputation damage', riskImpact: 'critical' },
      { id: 'phishing', label: 'Phishing & Email Attacks', value: 'phishing', riskMultiplier: 1.6, tooltip: 'Employee credential theft, initial access vector', riskImpact: 'high' },
      { id: 'insider-threat', label: 'Insider Threats', value: 'insider-threat', riskMultiplier: 1.7, tooltip: 'Malicious employees, negligent data handling', riskImpact: 'high' },
      { id: 'supply-chain', label: 'Vendor/Supply Chain Attacks', value: 'supply-chain', riskMultiplier: 1.8, tooltip: 'Third-party compromises affecting your systems', riskImpact: 'high' },
      { id: 'cloud-security', label: 'Cloud Security Breaches', value: 'cloud-security', riskMultiplier: 1.5, tooltip: 'Misconfigured cloud services, data exposure', riskImpact: 'high' },
      { id: 'regulatory-compliance', label: 'Regulatory Non-Compliance', value: 'regulatory-compliance', riskMultiplier: 1.4, tooltip: 'Fines, legal action, business restrictions', riskImpact: 'medium' },
      { id: 'business-disruption', label: 'Business Continuity Disruption', value: 'business-disruption', riskMultiplier: 1.3, tooltip: 'System outages, productivity loss', riskImpact: 'medium' },
      { id: 'financial-fraud', label: 'Financial Fraud & Theft', value: 'financial-fraud', riskMultiplier: 1.6, tooltip: 'Payment fraud, financial system compromise', riskImpact: 'high' },
      { id: 'ip-theft', label: 'Intellectual Property Theft', value: 'ip-theft', riskMultiplier: 1.4, tooltip: 'Trade secrets, competitive advantage loss', riskImpact: 'medium' },
      { id: 'reputation-damage', label: 'Brand & Reputation Damage', value: 'reputation-damage', riskMultiplier: 1.2, tooltip: 'Customer trust loss, market impact', riskImpact: 'medium' },
      { id: 'advanced-threats', label: 'Advanced Persistent Threats (APTs)', value: 'advanced-threats', riskMultiplier: 1.9, tooltip: 'Sophisticated, long-term attacks', riskImpact: 'critical' }
    ],
    meta: { 
      hideIf: [
        { questionId: 'user-proficiency', operator: 'equals', value: 'novice' }
      ]
    }
  },

  // ─── 9. Service Delivery Preferences ─────────────────────────────────────────
  {
    id: 'delivery-preferences',
    title: 'Service Delivery Preferences',
    description: 'How would you prefer to receive cyber security services?',
    type: 'multiSelect',
    tooltip: 'Delivery model shapes implementation approach and ongoing management',
    required: true,
    weight: 1.1,
    options: [
      { id: 'fully-managed', label: 'Fully managed/outsourced', value: 'fully-managed', riskMultiplier: 0.8, tooltip: 'Complete operations managed by Hanco Cyber', riskImpact: 'low' },
      { id: 'hybrid-support', label: 'Hybrid (in-house + external)', value: 'hybrid-support', riskMultiplier: 0.9, tooltip: 'Mix of internal team and external expertise', riskImpact: 'low' },
      { id: 'white-label', label: 'White-label services', value: 'white-label', riskMultiplier: 1.0, tooltip: 'Services delivered under your brand', riskImpact: 'medium' },
      { id: 'consulting-advisory', label: 'Consulting & advisory', value: 'consulting-advisory', riskMultiplier: 1.2, tooltip: 'Strategic guidance for your internal team', riskImpact: 'medium' },
      { id: 'staff-augmentation', label: 'Staff augmentation', value: 'staff-augmentation', riskMultiplier: 1.1, tooltip: 'Embed Hanco experts within your team', riskImpact: 'low' },
      { id: 'project-based', label: 'Project-based delivery', value: 'project-based', riskMultiplier: 1.0, tooltip: 'Defined deliverables and timelines', riskImpact: 'medium' },
    ],
    meta: { noviceFriendly: true }
  },

  // ─── 10. Enterprise-specific questions (conditional) ─────────────────────────────────────────
  {
    id: 'enterprise-complexity',
    title: 'Enterprise complexity factors',
    description: 'Select all factors that apply to your enterprise environment',
    type: 'multiSelect',
    tooltip: 'Enterprise environments have unique security challenges',
    required: true,
    weight: 1.4,
    options: [
      { id: 'multi-cloud', label: 'Multi-cloud infrastructure', value: 'multi-cloud', riskMultiplier: 1.3, tooltip: 'Complex cloud security management', riskImpact: 'medium' },
      { id: 'legacy-systems', label: 'Legacy systems integration', value: 'legacy-systems', riskMultiplier: 1.6, tooltip: 'Older systems with security limitations', riskImpact: 'high' },
      { id: 'mergers-acquisitions', label: 'Recent M&A activity', value: 'mergers-acquisitions', riskMultiplier: 1.5, tooltip: 'Integration challenges and security gaps', riskImpact: 'high' },
      { id: 'global-operations', label: 'Global operations', value: 'global-operations', riskMultiplier: 1.4, tooltip: 'Multiple jurisdictions and regulations', riskImpact: 'medium' },
      { id: 'critical-infrastructure', label: 'Critical infrastructure', value: 'critical-infrastructure', riskMultiplier: 1.8, tooltip: 'High-impact operational technology', riskImpact: 'critical' },
    ],
    meta: {
      showIf: [
        { questionId: 'org-profile', operator: 'includes', value: 'enterprise' },
        { questionId: 'org-profile', operator: 'includes', value: 'multinational' }
      ]
    }
  },

  // ─── 11. Startup-specific questions (conditional) ─────────────────────────────────────────
  {
    id: 'startup-priorities',
    title: 'Startup Security Priorities',
    description: 'What are your main security concerns as a growing startup?',
    type: 'multiSelect',
    tooltip: 'Startups have unique security needs and constraints',
    required: true,
    weight: 1.2,
    options: [
      { id: 'investor-requirements', label: 'Investor security requirements', value: 'investor-requirements', riskMultiplier: 1.2, tooltip: 'Due diligence and compliance for funding', riskImpact: 'medium' },
      { id: 'customer-trust', label: 'Building customer trust', value: 'customer-trust', riskMultiplier: 1.1, tooltip: 'Security as competitive advantage', riskImpact: 'low' },
      { id: 'rapid-scaling', label: 'Rapid scaling challenges', value: 'rapid-scaling', riskMultiplier: 1.3, tooltip: 'Security keeping pace with growth', riskImpact: 'medium' },
      { id: 'limited-budget', label: 'Limited security budget', value: 'limited-budget', riskMultiplier: 1.4, tooltip: 'Cost-effective security solutions', riskImpact: 'medium' },
      { id: 'regulatory-readiness', label: 'Regulatory readiness', value: 'regulatory-readiness', riskMultiplier: 1.2, tooltip: 'Preparing for compliance requirements', riskImpact: 'low' },
    ],
    meta: {
      showIf: [
        { questionId: 'org-profile', operator: 'includes', value: 'startup' }
      ]
    }
  }
];

export const leadCaptureFields = [
  { id: 'firstName', label: 'First Name', type: 'text', required: true },
  { id: 'lastName', label: 'Last Name', type: 'text', required: true },
  { id: 'email', label: 'Business Email', type: 'email', required: true },
  { id: 'company', label: 'Company Name', type: 'text', required: true },
  { id: 'jobTitle', label: 'Job Title', type: 'text', required: true },
  { id: 'phone', label: 'Phone Number', type: 'tel', required: false },
];
