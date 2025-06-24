// lib/assessment-config.ts

export const assessmentQuestions: AssessmentQuestion[] = [
  // ─── 0. USER PROFICIENCY ─────────────────────────────────────────────────────
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

  // ─── 1. Organisation Profile & Scale ───────────────────────────────────────────
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

  // ─── 2. Industry Vertical ────────────────────────────────────────────────────────
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

  // ─── 3. Current cyber security Maturity ─────────────────────────────────────────
  {
    id: 'cyber-maturity',
    title: 'Current cyber security maturity',
    description: 'Assess your organisation\'s current cyber security capabilities',
    type: 'singleSelect',
    tooltip: 'Helps identify gaps and prioritise improvements',
    required: true,
    weight: 1.8,
    options: [
      { id: 'basic', label: 'Basic (Antivirus, firewall)', value: 'basic', riskMultiplier: 2.5, tooltip: 'Minimal controls → high exposure', riskImpact: 'critical' },
      { id: 'developing', label: 'Developing (Policies + updates)', value: 'developing', riskMultiplier: 2.0, tooltip: 'Foundation exists, needs structure', riskImpact: 'high' },
      { id: 'managed', label: 'Managed (Processes + monitoring)', value: 'managed', riskMultiplier: 1.5, tooltip: 'Structured programme in place', riskImpact: 'medium' },
      { id: 'optimized', label: 'Optimised (Advanced + hunting)', value: 'optimized', riskMultiplier: 1.0, tooltip: 'Proactive threat management', riskImpact: 'low' },
      { id: 'uncertain', label: 'Uncertain / Needs review', value: 'uncertain', riskMultiplier: 2.2, tooltip: 'Baseline unknown, needs analysis', riskImpact: 'high' },
    ],
    meta: { noviceFriendly: true }
  },

  // ─── 4. Compliance Requirements (conditional) ─────────────────────────────────────────────────
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

  // ─── 5. Investment Flexibility ─────────────────────────────────────────────────
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

// ─── 6. Implementation Timeline ────────────────────────────────────────────────
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

  // ─── 7. Primary Threat Concerns (expert/intermediate only) ───────────────────────────────────────────────
  {
    id: 'threat-priorities',
    title: 'Primary Threat Concerns',
    description: 'Which threats keep you awake at night? (Select your top 3 concerns)',
    type: 'multiSelect',
    tooltip: 'Focus on the most impactful security controls for your specific threat landscape',
    required: true,
    weight: 1.6,
    options: [
      { id: 'ransomware', label: 'Ransomware', value: 'ransomware', riskMultiplier: 2.0, tooltip: 'Average downtime 23 days, £4.5M average cost', riskImpact: 'critical' },
      { id: 'data-breach', label: 'Data breaches', value: 'data-breach', riskMultiplier: 1.9, tooltip: 'GDPR fines + reputation damage', riskImpact: 'critical' },
      { id: 'phishing', label: 'Phishing & social engineering', value: 'phishing', riskMultiplier: 1.7, tooltip: '95% of successful attacks start here', riskImpact: 'high' },
      { id: 'insider-threat', label: 'Insider threats', value: 'insider-threat', riskMultiplier: 1.6, tooltip: 'Malicious or negligent employee actions', riskImpact: 'high' },
      { id: 'supply-chain', label: 'Supply chain attacks', value: 'supply-chain', riskMultiplier: 1.8, tooltip: 'Vendor compromises affecting your business', riskImpact: 'high' },
      { id: 'regulatory-fines', label: 'Regulatory fines', value: 'regulatory-fines', riskMultiplier: 1.5, tooltip: 'Penalties for non-compliance', riskImpact: 'medium' },
      { id: 'business-disruption', label: 'Business disruption', value: 'business-disruption', riskMultiplier: 1.4, tooltip: 'Revenue loss and operational impact', riskImpact: 'medium' },
      { id: 'ip-theft', label: 'Intellectual property theft', value: 'ip-theft', riskMultiplier: 1.3, tooltip: 'Loss of competitive advantage', riskImpact: 'medium' },
    ],
    meta: { 
      hideIf: [
        { questionId: 'user-proficiency', operator: 'equals', value: 'novice' }
      ]
    }
  },

  // ─── 8. Service Delivery Preferences ─────────────────────────────────────────
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

  // ─── 9. Enterprise-specific questions (conditional) ─────────────────────────────────────────
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

  // ─── 10. Startup-specific questions (conditional) ─────────────────────────────────────────
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