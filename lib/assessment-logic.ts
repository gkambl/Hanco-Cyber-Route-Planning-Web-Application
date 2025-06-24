import { AssessmentQuestion, AssessmentOption, BranchingCondition } from './assessment-config';

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
  confidence: number; // 0-100, how confident we are in the assessment
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

/**
 * Enhanced branching logic - determines which questions to show based on previous responses
 */
export function shouldShowQuestion(
  question: AssessmentQuestion,
  responses: AssessmentResponse[],
  proficiency: 'novice' | 'intermediate' | 'expert'
): boolean {
  // Always show proficiency question
  if (question.id === 'user-proficiency') return true;

  // Check proficiency-based filtering
  if (proficiency === 'novice' && question.meta?.expertOnly) return false;
  if (proficiency === 'novice' && !question.meta?.noviceFriendly && !question.meta?.showIf) return false;
  if (proficiency === 'intermediate' && question.meta?.expertOnly) return false;

  // Check hideIf conditions
  if (question.meta?.hideIf) {
    for (const condition of question.meta.hideIf) {
      if (evaluateCondition(condition, responses)) {
        return false;
      }
    }
  }

  // Check showIf conditions
  if (question.meta?.showIf) {
    return question.meta.showIf.some(condition => evaluateCondition(condition, responses));
  }

  return true;
}

function evaluateCondition(condition: BranchingCondition, responses: AssessmentResponse[]): boolean {
  const response = responses.find(r => r.questionId === condition.questionId);
  if (!response) return false;

  switch (condition.operator) {
    case 'includes':
      return response.selectedOptions.includes(condition.value as string);
    case 'excludes':
      return !response.selectedOptions.includes(condition.value as string);
    case 'equals':
      return response.selectedOptions[0] === condition.value || response.sliderValue === condition.value;
    case 'greaterThan':
      return (response.sliderValue || 0) > (condition.value as number);
    case 'lessThan':
      return (response.sliderValue || 0) < (condition.value as number);
    default:
      return false;
  }
}

/**
 * Real-time risk calculation for live updates
 */
export function calculateLiveRiskScore(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): { score: number; impact: 'low' | 'medium' | 'high' | 'critical'; trend: 'up' | 'down' | 'stable' } {
  const profResp = responses.find(r => r.questionId === 'user-proficiency');
  const proficiency = profResp?.selectedOptions[0] as 'novice' | 'intermediate' | 'expert' || 'intermediate';
  
  const visibleQuestions = questions.filter(q => shouldShowQuestion(q, responses, proficiency));
  
  let totalScore = 0;
  let maxScore = 0;
  let lastQuestionImpact: 'low' | 'medium' | 'high' | 'critical' = 'low';

  responses.forEach(response => {
    const question = visibleQuestions.find(q => q.id === response.questionId);
    if (!question) return;

    let questionScore = 0;
    let questionMaxScore = question.weight * 100;

    if (question.type === 'slider' && response.sliderValue !== undefined) {
      questionScore = (100 - response.sliderValue) * question.weight;
      const selectedOption = question.options?.find(opt => 
        Math.abs((opt.value as number) - response.sliderValue!) <= 12.5
      );
      if (selectedOption) lastQuestionImpact = selectedOption.riskImpact || 'medium';
    } else if (question.options) {
      response.selectedOptions.forEach(optId => {
        const opt = question.options!.find(o => o.id === optId);
        if (opt) {
          questionScore += opt.riskMultiplier * question.weight * 20;
          lastQuestionImpact = opt.riskImpact || 'medium';
        }
      });
    }

    totalScore += questionScore;
    maxScore += questionMaxScore;
  });

  const normalizedScore = maxScore > 0 ? Math.min(100, (totalScore / maxScore) * 100) : 0;
  
  let impact: 'low' | 'medium' | 'high' | 'critical';
  if (normalizedScore <= 25) impact = 'low';
  else if (normalizedScore <= 50) impact = 'medium';
  else if (normalizedScore <= 75) impact = 'high';
  else impact = 'critical';

  // Determine trend based on last question's impact
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (lastQuestionImpact === 'critical' || lastQuestionImpact === 'high') trend = 'up';
  else if (lastQuestionImpact === 'low') trend = 'down';

  return {
    score: Math.round(normalizedScore),
    impact,
    trend
  };
}

/**
 * Enhanced risk score calculation with confidence metrics
 */
export function calculateRiskScore(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): RiskScore {
  const profResp = responses.find(r => r.questionId === 'user-proficiency');
  const proficiency = profResp?.selectedOptions[0] as 'novice' | 'intermediate' | 'expert' || 'intermediate';
  const profMultiplier = proficiency === 'expert' ? 1.2 : proficiency === 'novice' ? 0.8 : 1;

  const visibleQuestions = questions.filter(q => shouldShowQuestion(q, responses, proficiency));

  let totalScore = 0;
  let maxScore = 0;
  let answeredQuestions = 0;
  const categoryScores = {
    technical: 0,
    operational: 0,
    compliance: 0,
    financial: 0
  };

  responses.forEach(response => {
    const question = visibleQuestions.find(q => q.id === response.questionId);
    if (!question) return;

    answeredQuestions++;
    let questionScore = 0;
    let questionMaxScore = question.weight * 100;

    if (question.type === 'slider' && response.sliderValue !== undefined) {
      questionScore = (100 - response.sliderValue) * question.weight;
    } else if (question.options) {
      response.selectedOptions.forEach(optId => {
        const opt = question.options!.find(o => o.id === optId);
        if (opt) {
          questionScore += opt.riskMultiplier * question.weight * 20;
        }
      });
    }

    questionScore *= profMultiplier;
    questionMaxScore *= profMultiplier;

    totalScore += questionScore;
    maxScore += questionMaxScore;

    // Enhanced categorization
    switch (question.id) {
      case 'cyber-maturity':
      case 'threat-priorities':
      case 'enterprise-complexity':
        categoryScores.technical += questionScore;
        break;
      case 'org-profile':
      case 'delivery-preferences':
      case 'startup-priorities':
        categoryScores.operational += questionScore;
        break;
      case 'compliance-needs':
        categoryScores.compliance += questionScore;
        break;
      case 'budget-flexibility':
      case 'urgency-timeline':
        categoryScores.financial += questionScore;
        break;
    }
  });

  const normalizedScore = Math.min(100, (totalScore / maxScore) * 100);
  let category: RiskScore['category'];
  if (normalizedScore <= 25) category = 'Low';
  else if (normalizedScore <= 50) category = 'Medium';
  else if (normalizedScore <= 75) category = 'High';
  else category = 'Critical';

  // Calculate confidence based on completeness and consistency
  const completeness = answeredQuestions / visibleQuestions.length;
  const confidence = Math.round(completeness * 100);

  // Determine trend based on maturity vs threats
  const maturityResp = responses.find(r => r.questionId === 'cyber-maturity');
  const threatResp = responses.find(r => r.questionId === 'threat-priorities');
  let trend: RiskScore['trend'] = 'stable';
  
  if (maturityResp?.selectedOptions.includes('basic') && threatResp?.selectedOptions.length > 2) {
    trend = 'worsening';
  } else if (maturityResp?.selectedOptions.includes('optimized')) {
    trend = 'improving';
  }

  const slice = maxScore * 0.25;
  return {
    overall: Math.round(normalizedScore),
    category,
    breakdown: {
      technical: Math.min(100, Math.round((categoryScores.technical / slice) * 100)),
      operational: Math.min(100, Math.round((categoryScores.operational / slice) * 100)),
      compliance: Math.min(100, Math.round((categoryScores.compliance / slice) * 100)),
      financial: Math.min(100, Math.round((categoryScores.financial / slice) * 100))
    },
    trend,
    confidence
  };
}

export function analyzeComplianceGaps(responses: AssessmentResponse[]): ComplianceGap[] {
  const complianceResponse = responses.find(r => r.questionId === 'compliance-needs');
  if (!complianceResponse) return [];
  const gaps: ComplianceGap[] = [];

  complianceResponse.selectedOptions.forEach(framework => {
    let coverage = 40;
    let missing: string[] = [];
    let priority: ComplianceGap['priority'] = 'Medium';

    switch (framework) {
      case 'gdpr':
        missing = ['Data Protection Impact Assessments', 'Breach Notification Procedures', 'Privacy by Design'];
        coverage = 55; priority = 'High'; break;
      case 'nis2':
        missing = ['Incident Reporting', 'Supply Chain Security', 'Governance Framework'];
        coverage = 35; priority = 'High'; break;
      case 'iso27001':
        missing = ['Risk Assessment', 'Security Policies', 'Audit Framework'];
        coverage = 60; priority = 'Medium'; break;
      case 'pci-dss':
        missing = ['Cardholder Data Protection', 'Network Segmentation', 'Regular Testing'];
        coverage = 45; priority = 'High'; break;
      default:
        missing = ['Security Framework', 'Monitoring', 'Documentation'];
        coverage = 50; priority = 'Medium';
    }

    gaps.push({
      framework: framework.toUpperCase(),
      coverage,
      missing,
      priority
    });
  });

  return gaps;
}

export function generateServiceRecommendations(
  responses: AssessmentResponse[],
  riskScore: RiskScore
): ServiceRecommendation[] {
  const recs: ServiceRecommendation[] = [];
  const orgProfile = responses.find(r => r.questionId === 'org-profile');
  const isStartup = orgProfile?.selectedOptions.includes('startup');
  const isEnterprise = orgProfile?.selectedOptions.includes('enterprise') || orgProfile?.selectedOptions.includes('multinational');

  // Managed SOC - priority based on risk and urgency
  if (riskScore.overall > 60 || responses.find(r => r.questionId === 'urgency-timeline')?.selectedOptions.includes('immediate-threat')) {
    recs.push({
      id: 'managed-soc',
      name: 'Managed SOC Services',
      description: '24/7 monitoring & incident response with 15-min SLA',
      priority: 'Essential',
      timeframe: 'Immediate deployment',
      benefits: ['Continuous threat monitoring','Rapid incident response','Expert analysts','Compliance support'],
      scalingOptions: isStartup 
        ? ['SOC Lite (8×5) – £900/mo', 'Standard SOC (24/7)', 'Premium SOC with hunting']
        : ['Standard SOC (24/7)', 'Premium SOC with hunting', 'Enterprise SOC with dedicated analysts']
    });
  }

  // Vulnerability Management
  recs.push({
    id: 'vulnerability-management',
    name: 'Vulnerability Management',
    description: 'Continuous scanning + prioritized remediation',
    priority: riskScore.overall > 50 ? 'Essential' : 'Recommended',
    timeframe: '2–4 weeks',
    benefits: ['Asset discovery','Continuous scanning','Risk-based prioritization','Tracking & guidance'],
    scalingOptions: ['Basic scanning','Advanced scanning with reporting','Full remediation support']
  });

  // Enterprise-specific recommendations
  if (isEnterprise) {
    recs.push({
      id: 'enterprise-governance',
      name: 'Enterprise Security Governance',
      description: 'Board-level risk management and strategic oversight',
      priority: 'Recommended',
      timeframe: '4–6 weeks',
      benefits: ['Executive dashboards','Risk quantification','Strategic roadmaps','Board reporting'],
      scalingOptions: ['Quarterly reviews','Monthly governance','Continuous oversight']
    });
  }

  // Startup-specific recommendations
  if (isStartup) {
    recs.push({
      id: 'startup-foundation',
      name: 'Startup Security Foundation',
      description: 'Essential security controls for growing businesses',
      priority: 'Essential',
      timeframe: '1–2 weeks',
      benefits: ['Investor-ready security','Scalable architecture','Cost-effective controls','Growth enablement'],
      scalingOptions: ['Foundation package','Growth package','Scale package']
    });
  }

  return recs;
}

export function calculateROI(
  responses: AssessmentResponse[],
  riskScore: RiskScore
): ROIModel {
  const industryResp = responses.find(r => r.questionId === 'industry-vertical');
  const orgSizeResp = responses.find(r => r.questionId === 'org-profile');
  const complianceResp = responses.find(r => r.questionId === 'compliance-needs');

  let baseInvest = 50_000;
  let estLoss = 500_000;

  // Organization size adjustments
  if (orgSizeResp?.selectedOptions.includes('startup')) {
    baseInvest = 25_000; estLoss = 250_000;
  } else if (orgSizeResp?.selectedOptions.includes('enterprise')) {
    baseInvest = 150_000; estLoss = 2_000_000;
  } else if (orgSizeResp?.selectedOptions.includes('multinational')) {
    baseInvest = 300_000; estLoss = 5_000_000;
  }

  // Industry adjustments
  if (industryResp?.selectedOptions.includes('financial')) {
    estLoss *= 3; baseInvest *= 1.5;
  } else if (industryResp?.selectedOptions.includes('healthcare')) {
    estLoss *= 2.5; baseInvest *= 1.4;
  }

  // Risk multiplier
  const riskMul = riskScore.overall / 100;
  estLoss *= 1 + riskMul;

  // Compliance complexity penalty
  const compCount = complianceResp?.selectedOptions.length || 0;
  let complianceComplexityPenalty = null;
  if (compCount >= 4) {
    const compMul = 1 + (compCount - 3) * 0.25;
    const addCost = baseInvest * (compMul - 1);
    const effLoss = Math.min(30, (compCount - 3) * 8);

    baseInvest *= compMul;
    complianceComplexityPenalty = {
      isApplicable: true,
      description: `Multiple frameworks create overhead & operational complexity`,
      additionalCost: Math.round(addCost),
      efficiencyLoss: effLoss
    };
  }

  const riskReduction = Math.min(85, 60 + baseInvest/10_000);
  const adjustedRiskRed = complianceComplexityPenalty
    ? riskReduction - complianceComplexityPenalty.efficiencyLoss
    : riskReduction;

  const paybackMonths = Math.max(
    3,
    Math.round(baseInvest / (estLoss * (adjustedRiskRed/100) / 12))
  );

  return {
    investmentRange: `£${(baseInvest*0.8).toLocaleString()} - £${(baseInvest*1.2).toLocaleString()}`,
    estimatedLossPrevention: Math.round(estLoss * (adjustedRiskRed/100)),
    paybackPeriod: `${paybackMonths} months`,
    riskReduction: Math.round(adjustedRiskRed),
    complianceComplexityPenalty
  };
}

export function generateAssessmentResults(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[]
): AssessmentResults {
  const riskScore = calculateRiskScore(responses, questions);
  const complianceGaps = analyzeComplianceGaps(responses);
  const serviceRecommendations = generateServiceRecommendations(responses, riskScore);
  const roiModel = calculateROI(responses, riskScore);
  
  const threatResp = responses.find(r => r.questionId === 'threat-priorities');
  const threatProfile = threatResp?.selectedOptions || [];

  const industryResp = responses.find(r => r.questionId === 'industry-vertical');
  const industryAverage = industryResp?.selectedOptions.includes('financial') ? 78
    : industryResp?.selectedOptions.includes('healthcare') ? 75 : 68;
  const peerComparison = riskScore.overall > industryAverage
    ? 'Above Average Risk'
    : riskScore.overall < industryAverage - 10
      ? 'Below Average Risk'
      : 'Average Risk';

  return {
    riskScore,
    complianceGaps,
    serviceRecommendations,
    roiModel,
    threatProfile,
    benchmarkData: { industryAverage, peerComparison }
  };
}