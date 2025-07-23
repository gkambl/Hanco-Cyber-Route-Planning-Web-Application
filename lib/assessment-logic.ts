import { AssessmentQuestion, BranchingCondition } from './assessment-config';

export interface AssessmentResponse {
  questionId: string;
  selectedOptions: string[];
  sliderValue?: number;
  textValue?: string;
}

export interface RiskScore {
  overall: number;
  category: 'Low' | 'Medium' | 'High' | 'Critical';
  breakdown: {
    technical: number;
    operational: number;
    compliance: number;
    financial: number;
  };
  trend: 'improving' | 'stable' | 'worsening';
  confidence: number;
}

export interface ComplianceGap {
  framework: string;
  coverage: number;
  missing: string[];
  priority: 'Low' | 'Medium' | 'High';
}

export interface ServiceRecommendation {
  id: string;
  name: string;
  description: string;
  priority: 'Essential' | 'Recommended' | 'Optional';
  timeframe: string;
  benefits: string[];
  scalingOptions: string[];
  technicalDetails: string[];
  pricingEstimate: {
    range: string;
    model: string;
    factors: string[];
  };
  hancoAdvantage: string[];
  addressedRisks: string[];
  implementation: {
    phase1: string;
    phase2: string;
    phase3?: string;
  };
}

export interface ROIModel {
  investmentRange: string;
  estimatedLossPrevention: number;
  paybackPeriod: string;
  riskReduction: number;
  complianceComplexityPenalty?: {
    isApplicable: boolean;
    description: string;
    additionalCost: number;
    efficiencyLoss: number;
  };
}

export interface AssessmentResults {
  riskScore: RiskScore;
  complianceGaps: ComplianceGap[];
  serviceRecommendations: ServiceRecommendation[];
  roiModel: ROIModel;
  threatProfile: string[];
  benchmarkData: {
    industryAverage: number;
    peerComparison: string;
  };
}

// Currency conversion rates (approximate, for demo purposes)
const CURRENCY_RATES = {
  gbp: 1,
  usd: 1.27,
  eur: 1.17,
  cad: 1.71,
  aud: 1.93
};

const CURRENCY_SYMBOLS = {
  gbp: '£',
  usd: '$',
  eur: '€',
  cad: 'C$',
  aud: 'A$'
};

export function formatCurrency(amount: number, currency: string = 'gbp'): string {
  const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '£';
  const convertedAmount = Math.round(amount * rate);
  return `${symbol}${convertedAmount.toLocaleString()}`;
}

export function formatCurrencyRange(minAmount: number, maxAmount: number, currency: string = 'gbp'): string {
  const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '£';
  const convertedMin = Math.round(minAmount * rate);
  const convertedMax = Math.round(maxAmount * rate);
  return `${symbol}${convertedMin.toLocaleString()}-${symbol}${convertedMax.toLocaleString()}`;
}

/** Branching logic **/
export function shouldShowQuestion(
  question: AssessmentQuestion,
  responses: AssessmentResponse[],
  proficiency: 'novice' | 'intermediate' | 'expert'
): boolean {
  if (question.id === 'currency-preference' || question.id === 'user-proficiency') return true;
  if (proficiency === 'novice' && question.meta?.expertOnly) return false;
  if (proficiency === 'novice' && !question.meta?.noviceFriendly && !question.meta?.showIf) return false;
  if (proficiency === 'intermediate' && question.meta?.expertOnly) return false;

  if (question.meta?.hideIf) {
    for (const cond of question.meta.hideIf)
      if (evaluateCondition(cond, responses)) return false;
  }
  if (question.meta?.showIf) {
    return question.meta.showIf.some(cond => evaluateCondition(cond, responses));
  }
  return true;
}

function evaluateCondition(cond: BranchingCondition, responses: AssessmentResponse[]): boolean {
  const resp = responses.find(r => r.questionId === cond.questionId);
  if (!resp) return false;
  switch (cond.operator) {
    case 'includes':    return resp.selectedOptions.includes(cond.value as string);
    case 'excludes':    return !resp.selectedOptions.includes(cond.value as string);
    case 'equals':      return resp.selectedOptions[0] === cond.value || resp.sliderValue === cond.value;
    case 'greaterThan': return (resp.sliderValue||0) > (cond.value as number);
    case 'lessThan':    return (resp.sliderValue||0) < (cond.value as number);
    default:            return false;
  }
}

/** Live risk calc **/
export function calculateLiveRiskScore(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): { score: number; impact: 'low'|'medium'|'high'|'critical'; trend: 'up'|'down'|'stable' } {
  const profResp = responses.find(r => r.questionId==='user-proficiency');
  const proficiency = profResp?.selectedOptions[0] as 'novice'|'intermediate'|'expert' || 'intermediate';
  const visible = questions.filter(q => shouldShowQuestion(q, responses, proficiency));

  let total=0, max=0;
  let lastImpact: 'low'|'medium'|'high'|'critical' = 'low';

  for (const r of responses) {
    const q = visible.find(v => v.id===r.questionId);
    if (!q || q.id === 'currency-preference') continue;
    let qScore=0, qMax=q.weight*100;

    if (q.type==='slider' && r.sliderValue!==undefined) {
      qScore = (100-r.sliderValue)*q.weight;
      const opt = q.options?.find(o=>Math.abs((o.value as number)-r.sliderValue!)<=12.5);
      if (opt) lastImpact = opt.riskImpact||'medium';
    } else if (q.options) {
      for (const sel of r.selectedOptions) {
        const opt = q.options.find(o=>o.id===sel);
        if (opt) {
          qScore += opt.riskMultiplier*q.weight*20;
          lastImpact = opt.riskImpact||'medium';
        }
      }
    }

    total += qScore;
    max   += qMax;
  }

  const norm = max>0?Math.min(100,(total/max)*100):0;
  let impact: 'low'|'medium'|'high'|'critical';
  if (norm<=25) impact='low';
  else if (norm<=50) impact='medium';
  else if (norm<=75) impact='high';
  else impact='critical';

  let trend: 'up'|'down'|'stable' = 'stable';
  if (lastImpact==='critical'||lastImpact==='high') trend='up';
  else if (lastImpact==='low') trend='down';

  return { score: Math.round(norm), impact, trend };
}

/** Full risk calc **/
export function calculateRiskScore(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): RiskScore {
  const profResp = responses.find(r=>r.questionId==='user-proficiency');
  const proficiency = profResp?.selectedOptions[0] as 'novice'|'intermediate'|'expert' || 'intermediate';
  const mult = proficiency==='expert'?1.2:proficiency==='novice'?0.8:1;
  const visible = questions.filter(q=>shouldShowQuestion(q,responses,proficiency));

  let total=0, max=0, answered=0, securityControlsBonus=0;
  const cats = { technical:0, operational:0, compliance:0, financial:0 };

  for (const r of responses) {
    const q = visible.find(v=>v.id===r.questionId);
    if (!q || q.id === 'currency-preference') continue;
    answered++;
    let qScore=0, qMax=q.weight*100;

    // Handle security controls with negative risk multipliers (bonuses)
    if (q.id === 'current-security-controls') {
      for (const sel of r.selectedOptions) {
        const opt = q.options?.find(o=>o.id===sel);
        if (opt && opt.riskMultiplier < 0) {
          securityControlsBonus += Math.abs(opt.riskMultiplier) * q.weight * 20;
        } else if (opt) {
          qScore += opt.riskMultiplier * q.weight * 20;
        }
      }
    } else if (q.type==='slider'&&r.sliderValue!==undefined) {
    }
    if (q.type==='slider'&&r.sliderValue!==undefined) {
      qScore=(100-r.sliderValue)*q.weight;
    } else if (q.options) {
      for (const sel of r.selectedOptions) {
        const opt=q.options.find(o=>o.id===sel);
        if (opt) qScore += opt.riskMultiplier*q.weight*20;
      }
    }

    // Enhanced incident history weighting
    if (q.id === 'security-incidents') {
      const hasSerious = r.selectedOptions.some(opt => 
        ['ransomware-attack', 'data-breach', 'supply-chain-compromise'].includes(opt)
      );
      if (hasSerious) qScore *= 1.5; // Increase weight for serious past incidents
    }

    qScore *= mult; qMax *= mult;
    total+=qScore; max+=qMax;

    // Enhanced categorization
    switch(q.id) {
      case 'cyber-maturity':
      case 'threat-priorities':
      case 'enterprise-complexity':
      case 'current-security-controls':
      case 'infrastructure-complexity':
      case 'security-incidents':
        cats.technical += qScore; break;
      case 'org-profile':
      case 'delivery-preferences':
      case 'startup-priorities':
      case 'data-sensitivity':
        cats.operational += qScore; break;
      case 'compliance-needs':
        cats.compliance += qScore; break;
      case 'budget-flexibility':
      case 'urgency-timeline':
        cats.financial += qScore; break;
    }
  }

  // Apply security controls bonus
  total = Math.max(0, total - securityControlsBonus);

  const norm = max>0?Math.min(100,(total/max)*100):0;
  let category: RiskScore['category'];
  if (norm<=25) category='Low';
  else if (norm<=50) category='Medium';
  else if (norm<=75) category='High';
  else category='Critical';

  const completeness = visible.length>0?answered/visible.length:0;
  const confidence = Math.round(completeness*100);

  // Enhanced trend analysis
  const mat = responses.find(r=>r.questionId==='cyber-maturity')?.selectedOptions||[];
  const thr = responses.find(r=>r.questionId==='threat-priorities')?.selectedOptions||[];
  const inc = responses.find(r=>r.questionId==='security-incidents')?.selectedOptions||[];
  let trend: RiskScore['trend']='stable';
  
  if ((mat.includes('ad-hoc')||mat.includes('basic')) && thr.length>3) trend='worsening';
  else if (inc.includes('ransomware-attack')||inc.includes('data-breach')) trend='worsening';
  else if (mat.includes('advanced')||mat.includes('optimized')) trend='improving';
  else if ((responses.find(r=>r.questionId==='current-security-controls')?.selectedOptions?.length ?? 0) > 6) trend='improving';

  const slice = max*0.25;
  return {
    overall: Math.round(norm),
    category,
    breakdown: {
      technical: Math.min(100, Math.round((cats.technical/slice)*100)),
      operational: Math.min(100, Math.round((cats.operational/slice)*100)),
      compliance: Math.min(100, Math.round((cats.compliance/slice)*100)),
      financial: Math.min(100, Math.round((cats.financial/slice)*100)),
    },
    trend,
    confidence
  };
}

/** Compliance gaps **/
export function analyzeComplianceGaps(responses: AssessmentResponse[]): ComplianceGap[] {
  const resp = responses.find(r=>r.questionId==='compliance-needs');
  if (!resp) return [];
  const gaps: ComplianceGap[] = [];

  for (const fw of resp.selectedOptions) {
    let coverage=50, missing=['Security Framework','Monitoring','Documentation'], priority:ComplianceGap['priority']='Medium';
    switch(fw) {
      case 'gdpr':
        coverage=55; priority='High';
        missing=['Data Protection Impact Assessments','Breach Notification Procedures','Privacy by Design'];
        break;
      case 'nis2':
        coverage=35; priority='High';
        missing=['Incident Reporting','Supply Chain Security','Governance Framework'];
        break;
      case 'iso27001':
        coverage=60; priority='Medium';
        missing=['Risk Assessment','Security Policies','Audit Framework'];
        break;
      case 'pci-dss':
        coverage=45; priority='High';
        missing=['Cardholder Data Protection','Network Segmentation','Regular Testing'];
        break;
    }
    gaps.push({ framework: fw.toUpperCase(), coverage, missing, priority });
  }

  return gaps;
}

/** Enhanced service recommendations **/
export function generateServiceRecommendations(
  responses: AssessmentResponse[],
  riskScore: RiskScore
): ServiceRecommendation[] {
  const recs: ServiceRecommendation[] = [];
  const org = responses.find(r=>r.questionId==='org-profile');
  const industry = responses.find(r=>r.questionId==='industry-vertical');
  const maturity = responses.find(r=>r.questionId==='cyber-maturity');
  const threats = responses.find(r=>r.questionId==='threat-priorities');
  const compliance = responses.find(r=>r.questionId==='compliance-needs');
  const urgency = responses.find(r=>r.questionId==='urgency-timeline');
  const budget = responses.find(r=>r.questionId==='budget-flexibility');
  const currency = responses.find(r=>r.questionId==='currency-preference')?.selectedOptions[0] || 'gbp';
  
  const isStartup = org?.selectedOptions.includes('startup');
  const isEnt = org?.selectedOptions.includes('enterprise')||org?.selectedOptions.includes('multinational');
  const isFinancial = industry?.selectedOptions.includes('financial');
  const isHealthcare = industry?.selectedOptions.includes('healthcare');
  const hasBasicMaturity = maturity?.selectedOptions.includes('basic') || maturity?.selectedOptions.includes('developing');
  const hasRansomwareConcern = threats?.selectedOptions.includes('ransomware');
  const hasImmediateThreat = urgency?.selectedOptions.includes('immediate-threat');
  const hasComplianceDeadline = urgency?.selectedOptions.includes('compliance-deadline');
  const isConservativeBudget = budget?.sliderValue !== undefined && budget.sliderValue <= 25;
  const hasLimitedBudget = urgency?.selectedOptions.includes('no-urgency') || isStartup;

  // 1. Cybersecurity Advisor - For budget-conscious organisations
  if (isConservativeBudget || hasLimitedBudget || (isStartup && riskScore.overall < 70)) {
    // Tailor service based on company size
    let advisorConfig = {
      name: 'Personal Cybersecurity Advisor',
      sessionLength: '60-minute',
      basePrice: 299,
      features: [
        'One high-impact monthly session with cybersecurity expert',
        'Practical security improvement recommendations per session',
        'Monthly security snapshot report including dark web monitoring',
        'Industry-tailored insights and threat intelligence',
        'Direct access to advisor via email between sessions'
      ],
      technicalDetails: [
        'Monthly 60-minute strategic consultation sessions',
        'Dark web monitoring for leaked credentials and data',
        'Surface web monitoring for brand and domain abuse',
        'Quarterly security posture assessment',
        'Custom security roadmap development',
        'Vendor evaluation and procurement guidance',
        'Incident response planning and tabletop exercises'
      ],
      scalingOptions: [
        `Basic Advisor - ${formatCurrency(299, currency)}/month`,
        `Premium Advisor (bi-weekly sessions) - ${formatCurrency(499, currency)}/month`,
        `Enterprise Advisory (weekly + team access) - ${formatCurrency(899, currency)}/month`
      ]
    };

    // Customize based on organization size
    if (isStartup) {
      advisorConfig = {
        ...advisorConfig,
        name: 'Startup Cybersecurity Advisor',
        sessionLength: '45-minute',
        basePrice: 199,
        features: [
          'One focused 45-minute monthly session with startup security expert',
          'Growth-stage security recommendations per session',
          'Monthly security snapshot report with startup-specific threats',
          'Investor-ready security documentation guidance',
          'Direct access to advisor via email and Slack integration'
        ],
        technicalDetails: [
          'Monthly 45-minute startup-focused consultation sessions',
          'Dark web monitoring for company domain and founder credentials',
          'Basic security posture assessment',
          'Investor due diligence preparation',
          'Cost-effective security tool recommendations',
          'Compliance readiness planning',
          'Security culture development for growing teams'
        ],
        scalingOptions: [
          `Startup Basic - ${formatCurrency(199, currency)}/month`,
          `Startup Growth (bi-weekly) - ${formatCurrency(349, currency)}/month`,
          `Startup Scale (weekly) - ${formatCurrency(599, currency)}/month`
        ]
      };
    } else if (isEnt) {
      advisorConfig = {
        ...advisorConfig,
        name: 'Enterprise Cybersecurity Advisor',
        sessionLength: '90-minute',
        basePrice: 499,
        features: [
          'One comprehensive 90-minute monthly session with senior security advisor',
          'Enterprise-grade security strategy recommendations per session',
          'Monthly executive security dashboard with advanced threat intelligence',
          'Board-level security reporting and presentation support',
          'Direct access to advisor team via dedicated channels'
        ],
        technicalDetails: [
          'Monthly 90-minute enterprise strategic consultation sessions',
          'Advanced threat intelligence and dark web monitoring',
          'Executive security dashboard and KPI tracking',
          'Multi-location security posture assessment',
          'Enterprise security architecture guidance',
          'Vendor risk management and procurement support',
          'Crisis communication and incident response planning'
        ],
        scalingOptions: [
          `Enterprise Standard - ${formatCurrency(499, currency)}/month`,
          `Enterprise Premium (bi-weekly) - ${formatCurrency(799, currency)}/month`,
          `Enterprise Dedicated (weekly + team) - ${formatCurrency(1299, currency)}/month`
        ]
      };
    }

    recs.push({
      id: 'cybersecurity-advisor',
      name: advisorConfig.name,
      description: `Monthly strategic cybersecurity guidance with a dedicated advisor. Perfect for ${isStartup ? 'growing startups' : isEnt ? 'enterprise organizations' : 'organizations'} that need expert direction but want to maintain control over implementation.`,
      priority: 'Recommended',
      timeframe: '1 week to assign advisor and begin',
      benefits: advisorConfig.features,
      technicalDetails: advisorConfig.technicalDetails,
      pricingEstimate: {
        range: `${formatCurrency(advisorConfig.basePrice, currency)}/month (First month free)`,
        model: 'Fixed monthly fee with no long-term contract',
        factors: [
          'No setup fees or hidden costs',
          'Cancel anytime with 30 days notice',
          'Additional ad-hoc sessions available',
          'Includes all monitoring and reporting',
          'No per-user or per-device charges'
        ]
      },
      hancoAdvantage: [
        `${isStartup ? 'Startup-focused' : isEnt ? 'Enterprise-grade' : 'Senior'} advisors with 15+ years experience, not junior consultants`,
        `${isStartup ? 'Growth-stage' : isEnt ? 'Enterprise' : 'Industry'}-specific expertise across all major sectors`,
        'No vendor bias - we recommend what\'s best for you, not what we sell',
        'Direct relationship with your advisor, not a rotating team',
        `Proven track record helping ${isStartup ? '50+ startups scale securely' : isEnt ? '100+ enterprises' : '200+ organisations'} improve security`,
        'Emergency consultation available for urgent security matters'
      ],
      addressedRisks: [
        `${isStartup ? 'Growth-stage' : isEnt ? 'Enterprise' : 'Strategic'} security planning and roadmap development`,
        `${isStartup ? 'Cost-effective' : 'Budget-conscious'} security improvements with maximum ROI`,
        `${isStartup ? 'Startup-relevant' : isEnt ? 'Enterprise-grade' : 'Proactive'} threat awareness and industry intelligence`,
        `${isStartup ? 'Startup-friendly' : isEnt ? 'Enterprise' : 'Vendor'} selection and contract negotiation support`,
        `${isStartup ? 'Investor-ready' : isEnt ? 'Board-level' : 'Compliance'} planning and gap identification`,
        ...(isStartup ? ['Investor due diligence preparation', 'Security culture development for growing teams'] : []),
        ...(isEnt ? ['Multi-location security coordination', 'Executive reporting and board presentations'] : [])
      ],
      scalingOptions: advisorConfig.scalingOptions,
      implementation: {
        phase1: `${isStartup ? 'Startup-focused advisor' : isEnt ? 'Senior enterprise advisor' : 'Advisor'} assignment, initial security assessment, relationship establishment`,
        phase2: `${advisorConfig.sessionLength} strategic sessions, monitoring setup, roadmap development`,
        phase3: `Ongoing advisory relationship, ${isStartup ? 'growth-aligned' : isEnt ? 'enterprise-grade' : 'continuous'} improvement, scaling as needed`
      }
    });
  }

  // 2. Managed SOC Services - Critical for high-risk scenarios
  if (riskScore.overall > 60 || hasImmediateThreat || hasRansomwareConcern || riskScore.breakdown.technical > 70) {
    recs.push({
      id: 'managed-soc',
      name: 'Managed SOC Services',
      description: '24/7 Security Operations Centre with advanced threat detection, incident response, and continuous monitoring using SIEM, SOAR, and threat intelligence platforms.',
      priority: 'Essential',
      timeframe: hasImmediateThreat ? 'Emergency deployment (24-48 hours)' : '5-10 business days',
      benefits: [
        'Mean Time to Detection (MTTD) reduced to <15 minutes',
        'Mean Time to Response (MTTR) reduced to <1 hour',
        'Advanced persistent threat (APT) detection using behavioural analytics',
        'Automated incident containment and forensic evidence preservation',
        'Compliance reporting for GDPR Article 33, NIS2, and sector-specific requirements'
      ],
      technicalDetails: [
        'Splunk Enterprise Security or Microsoft Sentinel SIEM deployment',
        'Phantom/Demisto SOAR integration for automated response workflows',
        'CrowdStrike Falcon or SentinelOne EDR endpoint protection',
        'Network traffic analysis using Darktrace or ExtraHop',
        'Threat intelligence feeds from Recorded Future and FireEye',
        'Custom detection rules based on MITRE ATT&CK framework',
        'Zero-trust network access (ZTNA) implementation'
      ],
      pricingEstimate: {
        range: isStartup 
          ? formatCurrencyRange(900, 2500, currency) + '/month'
          : isEnt 
          ? formatCurrencyRange(8000, 25000, currency) + '/month'
          : formatCurrencyRange(2500, 8000, currency) + '/month',
        model: 'Tiered service levels based on asset count and complexity',
        factors: [
          'Number of endpoints and servers monitored',
          'Log volume and retention requirements',
          'Compliance framework complexity',
          'Custom integration requirements',
          'Dedicated analyst allocation'
        ]
      },
      hancoAdvantage: [
        '95% client retention rate - we deliver measurable security improvements',
        'UK-based SOC analysts with SC clearance available for government clients',
        'Proprietary threat intelligence from 15+ years of incident response',
        'No vendor lock-in - we use best-of-breed tools, not single-vendor stacks',
        'Transparent pricing with no hidden costs for alert escalations',
        'Direct access to senior analysts, not just tier-1 support'
      ],
      addressedRisks: [
        `Technical Risk: ${riskScore.breakdown.technical}% → Reduced to <25%`,
        'Advanced persistent threats and zero-day exploits',
        'Insider threat detection through user behaviour analytics',
        'Supply chain compromise detection',
        'Ransomware prevention and rapid containment'
      ],
      scalingOptions: isStartup 
        ? [
          `SOC Lite (8×5 coverage) - ${formatCurrency(900, currency)}/month`,
          `SOC Standard (24×7 coverage) - ${formatCurrency(2500, currency)}/month`,
          `SOC Premium (dedicated analyst) - ${formatCurrency(4500, currency)}/month`
        ]
        : isEnt
        ? [
          `Enterprise SOC (multi-tenant) - ${formatCurrency(8000, currency)}/month`,
          `Dedicated SOC (single-tenant) - ${formatCurrency(15000, currency)}/month`,
          `White-label SOC (your branding) - ${formatCurrency(25000, currency)}/month`
        ]
        : [
          `SME SOC Standard - ${formatCurrency(2500, currency)}/month`,
          `SME SOC Premium - ${formatCurrency(4500, currency)}/month`,
          `SME SOC Enterprise - ${formatCurrency(7000, currency)}/month`
        ],
      implementation: {
        phase1: 'SIEM deployment, log source integration, baseline monitoring (Week 1-2)',
        phase2: 'Custom detection rules, SOAR workflows, analyst training (Week 3-4)',
        phase3: 'Advanced analytics, threat hunting, compliance reporting (Week 5-6)'
      }
    });
  }

  // 3. Vulnerability Management - Essential for most organisations
  recs.push({
    id: 'vulnerability-management',
    name: 'Continuous Vulnerability Management',
    description: 'Comprehensive vulnerability assessment and management using automated scanning, risk-based prioritisation, and guided remediation with integration into your existing DevOps pipeline.',
    priority: riskScore.overall > 50 || hasBasicMaturity ? 'Essential' : 'Recommended',
    timeframe: '1-2 weeks for initial deployment',
    benefits: [
      'Continuous asset discovery and vulnerability scanning',
      'Risk-based prioritisation using CVSS 3.1 and business context',
      'Automated patch management for critical vulnerabilities',
      'DevSecOps integration with CI/CD pipeline security gates',
      'Executive dashboards with trend analysis and KPI tracking'
    ],
    technicalDetails: [
      'Tenable.io or Qualys VMDR for comprehensive vulnerability scanning',
      'Nessus Professional for authenticated scanning',
      'Integration with Jira/ServiceNow for remediation tracking',
      'API integration with AWS Security Hub, Azure Security Center',
      'Custom vulnerability correlation and false positive reduction',
      'Container and cloud-native security scanning (Twistlock/Prisma)',
      'Web application security testing (OWASP ZAP, Burp Suite Enterprise)'
    ],
    pricingEstimate: {
      range: isStartup 
        ? formatCurrencyRange(500, 1500, currency) + '/month'
        : isEnt 
        ? formatCurrencyRange(3000, 12000, currency) + '/month'
        : formatCurrencyRange(1500, 4000, currency) + '/month',
      model: 'Based on asset count and scanning frequency',
      factors: [
        'Number of IP addresses and domains',
        'Frequency of scanning (weekly/daily)',
        'Integration complexity',
        'Remediation support level',
        'Compliance reporting requirements'
      ]
    },
    hancoAdvantage: [
      'Proprietary risk scoring algorithm that reduces false positives by 60%',
      'Direct integration with 50+ security tools and platforms',
      'Dedicated vulnerability researchers providing zero-day intelligence',
      'Automated remediation scripts for common vulnerabilities',
      'Compliance mapping for PCI DSS, ISO 27001, NIST frameworks',
      'No per-scan charges - unlimited scanning included'
    ],
    addressedRisks: [
      `Technical Risk: Addresses ${Math.min(40, riskScore.breakdown.technical)}% of technical vulnerabilities`,
      'Unpatched systems and software vulnerabilities',
      'Misconfigurations in cloud and on-premise infrastructure',
      'Web application security flaws (OWASP Top 10)',
      'Container and Kubernetes security issues'
    ],
    scalingOptions: [
      'Basic Scanning (monthly) - Lower tier pricing',
      'Continuous Scanning (daily) - Mid tier pricing',
      'Premium with Remediation Support - Top tier pricing'
    ],
    implementation: {
      phase1: 'Asset discovery, initial vulnerability scan, baseline establishment',
      phase2: 'Risk prioritisation, remediation planning, tool integration',
      phase3: 'Continuous monitoring, automated reporting, process optimisation'
    }
  });

  // 4. Incident Response & Digital Forensics - Critical for high-risk or immediate threats
  if (hasImmediateThreat || riskScore.overall > 70 || hasRansomwareConcern) {
    recs.push({
      id: 'incident-response',
      name: 'Incident Response & Digital Forensics',
      description: 'Rapid incident response capability with digital forensics, malware analysis, and business continuity support. Includes retainer-based emergency response and comprehensive incident management.',
      priority: 'Essential',
      timeframe: 'Emergency response: <2 hours | Full deployment: 1 week',
      benefits: [
        'Emergency response team activation within 2 hours',
        'Digital forensics and malware analysis capabilities',
        'Legal and regulatory compliance support',
        'Business continuity and disaster recovery planning',
        'Post-incident security improvements and lessons learned'
      ],
      technicalDetails: [
        'SANS-certified incident response methodology (PICERL)',
        'EnCase and Cellebrite digital forensics tools',
        'Volatility Framework for memory analysis',
        'YARA rules for malware detection and classification',
        'Wireshark and NetworkMiner for network forensics',
        'Incident response playbooks for common attack vectors',
        'Secure evidence handling and chain of custody procedures'
      ],
      pricingEstimate: {
        range: `${formatCurrencyRange(2000, 5000, currency)}/month retainer + ${formatCurrency(1500, currency)}/day activation`,
        model: 'Retainer-based with activation fees',
        factors: [
          'Retainer level (response time SLA)',
          'On-site vs remote response requirements',
          'Forensics complexity and data volume',
          'Legal and compliance support needs',
          'Post-incident remediation scope'
        ]
      },
      hancoAdvantage: [
        'CREST-certified incident response team with 15+ years experience',
        'Relationships with law enforcement and regulatory bodies',
        'Proprietary threat intelligence from 500+ incident responses',
        'No additional charges for weekend/holiday emergency response',
        'Integrated legal support through partner law firms',
        'Insurance claim support and documentation'
      ],
      addressedRisks: [
        'Active security incidents and data breaches',
        'Ransomware attacks and business disruption',
        'Insider threats and data exfiltration',
        'Advanced persistent threats (APTs)',
        'Regulatory investigation and compliance violations'
      ],
      scalingOptions: [
        `Basic Retainer (8-hour response) - ${formatCurrency(2000, currency)}/month`,
        `Premium Retainer (2-hour response) - ${formatCurrency(3500, currency)}/month`,
        `Enterprise Retainer (1-hour response) - ${formatCurrency(5000, currency)}/month`
      ],
      implementation: {
        phase1: 'Incident response plan development, team training, tool deployment',
        phase2: 'Tabletop exercises, process refinement, integration testing',
        phase3: 'Continuous improvement, threat intelligence integration, automation'
      }
    });
  }

  // 5. Compliance & Governance - Essential for regulated industries or compliance deadlines
  if (hasComplianceDeadline || isFinancial || isHealthcare || (compliance?.selectedOptions?.length ?? 0) > 1) {
    recs.push({
      id: 'compliance-governance',
      name: 'Compliance & Security Governance',
      description: 'Comprehensive compliance management covering GDPR, NIS2, ISO 27001, PCI DSS, and sector-specific requirements with automated evidence collection and audit support.',
      priority: hasComplianceDeadline ? 'Essential' : 'Recommended',
      timeframe: hasComplianceDeadline ? '4-8 weeks (expedited)' : '8-12 weeks',
      benefits: [
        'Automated compliance monitoring and evidence collection',
        'Gap analysis and remediation roadmaps',
        'Audit support and documentation management',
        'Policy development and staff training programmes',
        'Continuous compliance posture monitoring'
      ],
      technicalDetails: [
        'GRC platforms (ServiceNow GRC, MetricStream, or RSA Archer)',
        'Automated control testing and evidence collection',
        'Policy management and version control systems',
        'Risk register and treatment plan management',
        'Compliance dashboard with real-time status updates',
        'Integration with security tools for continuous monitoring',
        'Audit trail and documentation management systems'
      ],
      pricingEstimate: {
        range: isStartup 
          ? formatCurrencyRange(1500, 4000, currency) + '/month'
          : isEnt 
          ? formatCurrencyRange(5000, 15000, currency) + '/month'
          : formatCurrencyRange(3000, 8000, currency) + '/month',
        model: 'Based on frameworks and organisational complexity',
        factors: [
          'Number of compliance frameworks',
          'Organisational size and complexity',
          'Audit frequency and scope',
          'Custom policy development needs',
          'Training and awareness requirements'
        ]
      },
      hancoAdvantage: [
        'Pre-built compliance templates for 20+ frameworks',
        'Relationships with certification bodies and auditors',
        'Automated evidence collection reducing audit prep by 70%',
        'Multi-framework approach avoiding compliance complexity penalties',
        'Fixed-price compliance packages with no scope creep',
        'Ongoing compliance monitoring, not just point-in-time assessments'
      ],
      addressedRisks: [
        `Compliance Risk: ${riskScore.breakdown.compliance}% → Reduced to <15%`,
        'Regulatory fines and penalties',
        'Failed audits and certification delays',
        'Data protection violations and privacy breaches',
        'Contractual compliance failures'
      ],
      scalingOptions: [
        'Single Framework (e.g., GDPR only)',
        'Multi-Framework (2-3 frameworks)',
        'Enterprise Governance (comprehensive GRC)'
      ],
      implementation: {
        phase1: 'Gap analysis, framework mapping, baseline assessment',
        phase2: 'Policy development, control implementation, staff training',
        phase3: 'Continuous monitoring, audit preparation, certification support'
      }
    });
  }

  // 6. Cloud Security - Essential for cloud-heavy organisations
  if (org?.selectedOptions.includes('remote-first') || riskScore.breakdown.technical > 60) {
    recs.push({
      id: 'cloud-security',
      name: 'Cloud Security & Zero Trust Architecture',
      description: 'Comprehensive cloud security implementation including CSPM, CWPP, and zero trust network access with multi-cloud support for AWS, Azure, and Google Cloud.',
      priority: 'Recommended',
      timeframe: '3-6 weeks for full implementation',
      benefits: [
        'Cloud Security Posture Management (CSPM) across all cloud platforms',
        'Container and serverless security protection',
        'Zero trust network access implementation',
        'Cloud workload protection and runtime security',
        'DevSecOps integration and infrastructure as code security'
      ],
      technicalDetails: [
        'Prisma Cloud or Dome9 for multi-cloud security posture management',
        'Aqua Security or Twistlock for container protection',
        'Zscaler or Palo Alto Prisma Access for zero trust network access',
        'AWS GuardDuty, Azure Sentinel, GCP Security Command Center integration',
        'Terraform and CloudFormation security scanning',
        'Kubernetes security hardening (CIS benchmarks)',
        'Cloud access security broker (CASB) implementation'
      ],
      pricingEstimate: {
        range: formatCurrencyRange(2000, 8000, currency) + '/month',
        model: 'Based on cloud spend and workload complexity',
        factors: [
          'Number of cloud accounts and subscriptions',
          'Workload types (containers, serverless, VMs)',
          'Data classification and sensitivity',
          'Integration complexity',
          'Compliance requirements'
        ]
      },
      hancoAdvantage: [
        'Certified cloud architects for all major platforms (AWS, Azure, GCP)',
        'Pre-built security baselines and hardening scripts',
        'Cost optimisation alongside security improvements',
        'DevSecOps integration without slowing development cycles',
        'Multi-cloud expertise avoiding vendor lock-in',
        'Automated remediation for 80% of common misconfigurations'
      ],
      addressedRisks: [
        'Cloud misconfigurations and exposed resources',
        'Container and Kubernetes security vulnerabilities',
        'Insider threats in cloud environments',
        'Data breaches in cloud storage',
        'Compliance violations in cloud deployments'
      ],
      scalingOptions: [
        'Single Cloud Platform Security',
        'Multi-Cloud Security Management',
        'Enterprise Zero Trust Implementation'
      ],
      implementation: {
        phase1: 'Cloud asset discovery, security baseline assessment, quick wins',
        phase2: 'CSPM deployment, policy enforcement, zero trust planning',
        phase3: 'Advanced protection, automation, continuous improvement'
      }
    });
  }

  // 7. Security Awareness & Training - Recommended for all, essential for high phishing risk
  if (threats?.selectedOptions.includes('phishing') || hasBasicMaturity || riskScore.breakdown.operational > 50) {
    const userCostMin = isStartup ? 15 : isEnt ? 25 : 20;
    const userCostMax = isStartup ? 35 : isEnt ? 50 : 40;
    
    recs.push({
      id: 'security-training',
      name: 'Security Awareness & Phishing Simulation',
      description: 'Comprehensive security awareness programme with simulated phishing campaigns, role-based training, and measurable behaviour change tracking.',
      priority: threats?.selectedOptions.includes('phishing') ? 'Essential' : 'Recommended',
      timeframe: '2-4 weeks for programme launch',
      benefits: [
        'Measurable reduction in successful phishing attempts',
        'Role-based security training tailored to job functions',
        'Continuous phishing simulation and testing',
        'Security culture development and engagement metrics',
        'Compliance training for regulatory requirements'
      ],
      technicalDetails: [
        'KnowBe4 or Proofpoint security awareness platform',
        'Custom phishing simulation campaigns',
        'Learning management system (LMS) integration',
        'Behavioural analytics and reporting dashboards',
        'Mobile device security training modules',
        'Incident reporting and response training',
        'Executive and board-level security briefings'
      ],
      pricingEstimate: {
        range: `${formatCurrencyRange(userCostMin, userCostMax, currency)} per user per year`,
        model: 'Per-user annual licensing',
        factors: [
          'Number of users and locations',
          'Training content customisation',
          'Simulation frequency and complexity',
          'Reporting and analytics requirements',
          'Integration with HR systems'
        ]
      },
      hancoAdvantage: [
        'Custom training content based on your industry and threats',
        'Behavioural psychology expertise for lasting behaviour change',
        'Integration with incident response for real-world learning',
        'Multilingual training content for global organisations',
        'Gamification and engagement strategies proven to work',
        'Measurable ROI through reduced security incidents'
      ],
      addressedRisks: [
        `Operational Risk: ${Math.min(30, riskScore.breakdown.operational)}% reduction through human factor improvements`,
        'Phishing and social engineering attacks',
        'Insider threats and negligent data handling',
        'Password-related security incidents',
        'Compliance violations due to staff errors'
      ],
      scalingOptions: [
        'Basic Awareness (quarterly training)',
        'Advanced Programme (monthly simulations)',
        'Premium with Custom Content'
      ],
      implementation: {
        phase1: 'Baseline assessment, platform setup, initial training launch',
        phase2: 'Phishing simulations, targeted training, progress tracking',
        phase3: 'Advanced scenarios, culture measurement, continuous improvement'
      }
    });
  }

  return recs;
}

/** ROI **/
export function calculateROI(
  responses: AssessmentResponse[],
  riskScore: RiskScore
): ROIModel {
  const ind = responses.find(r=>r.questionId==='industry-vertical');
  const orgS = responses.find(r=>r.questionId==='org-profile');
  const comp = responses.find(r=>r.questionId==='compliance-needs');
  const currency = responses.find(r=>r.questionId==='currency-preference')?.selectedOptions[0] || 'gbp';

  let base=50_000, loss=500_000;
  if (orgS?.selectedOptions.includes('startup')) { base=25_000; loss=250_000; }
  else if (orgS?.selectedOptions.includes('enterprise')) { base=150_000; loss=2_000_000; }
  else if (orgS?.selectedOptions.includes('multinational')) { base=300_000; loss=5_000_000; }

  if (ind?.selectedOptions.includes('financial')) { loss*=3; base*=1.5; }
  else if (ind?.selectedOptions.includes('healthcare')) { loss*=2.5; base*=1.4; }

  const mul=riskScore.overall/100; loss*=1+mul;

  const count=comp?.selectedOptions?.length||0;
  let penalty=null;
  if (count>=4) {
    const pm=1+(count-3)*0.25;
    const add=base*(pm-1);
    const eff=Math.min(30,(count-3)*8);
    base*=pm;
    penalty={ isApplicable:true, description:'Multiple frameworks create overhead & operational complexity', additionalCost:Math.round(add), efficiencyLoss:eff };
  }

  const red=Math.min(85,60+base/10_000);
  const adj=penalty?red-penalty.efficiencyLoss:red;
  const months=Math.max(3,Math.round(base/(loss*(adj/100)/12)));

  return {
    investmentRange: formatCurrencyRange(base*0.8, base*1.2, currency),
    estimatedLossPrevention: Math.round(loss*(adj/100)),
    paybackPeriod: `${months} months`,
    riskReduction: Math.round(adj),
    complianceComplexityPenalty: penalty ? {
      ...penalty,
      additionalCost: Math.round(penalty.additionalCost)
    } : undefined
  };
}

/** Final results builder **/
export function generateAssessmentResults(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): AssessmentResults {
  const riskScore = calculateRiskScore(responses, questions);
  const gaps      = analyzeComplianceGaps(responses);
  const recs      = generateServiceRecommendations(responses, riskScore);
  const roi       = calculateROI(responses, riskScore);
  const thrResp   = responses.find(r=>r.questionId==='threat-priorities');
  const threatProfile = thrResp?.selectedOptions||[];
  const indResp   = responses.find(r=>r.questionId==='industry-vertical');
  const avg       = indResp?.selectedOptions.includes('financial')?78:indResp?.selectedOptions.includes('healthcare')?75:68;
  const peerComp  = riskScore.overall>avg?'Above Average Risk':riskScore.overall<avg-10?'Below Average Risk':'Average Risk';

  return {
    riskScore,
    complianceGaps:gaps,
    serviceRecommendations:recs,
    roiModel:roi,
    threatProfile,
    benchmarkData:{ industryAverage:avg, peerComparison:peerComp }
  };
}
