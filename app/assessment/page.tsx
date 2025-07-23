'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, Info, Users, TrendingUp, Calendar, HelpCircle, AlertTriangle, CheckCircle, Eye, Shield, Lock, Zap, TrendingDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Import your config files - make sure these exist and are properly exported
import { assessmentQuestions, leadCaptureFields, AssessmentQuestion } from '@/lib/assessment-config';
import { AssessmentResponse, shouldShowQuestion, calculateLiveRiskScore } from '@/lib/assessment-logic';

type LiveRisk = {
  score: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  trend: 'up' | 'down' | 'stable';
};

interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone?: string;
}

const cyberTips = [
  {
    icon: Shield,
    title: "Multi-factor authentication",
    tip: "MFA reduces breach risk by 99.9% - it's your strongest first line of defence"
  },
  {
    icon: Lock,
    title: "Password hygiene",
    tip: "Use unique passwords for every account. A password manager makes this effortless"
  },
  {
    icon: Zap,
    title: "Software updates",
    tip: "80% of breaches exploit known vulnerabilities. Keep systems updated automatically"
  },
  {
    icon: Users,
    title: "Employee training",
    tip: "95% of successful attacks involve human error. Regular training is essential"
  },
  {
    icon: Shield,
    title: "Backup strategy",
    tip: "Follow the 3-2-1 rule: 3 copies, 2 different media, 1 offsite. Test restores monthly"
  },
  {
    icon: Lock,
    title: "Network segmentation",
    tip: "Isolate critical systems. If one area is compromised, others remain protected"
  },
  {
    icon: Zap,
    title: "Incident response plan",
    tip: "Have a tested plan ready. The first hour after detection is critical"
  },
  {
    icon: Users,
    title: "Vendor risk management",
    tip: "Your security is only as strong as your weakest supplier. Audit regularly"
  }
];

export default function Assessment() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showDisclaimerWarning, setShowDisclaimerWarning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showComplianceWarning, setShowComplianceWarning] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [socialProofStats, setSocialProofStats] = useState({
    todayAssessments: 47,
    weeklyAssessments: 312,
    averageRisk: 72
  });

  // Enhanced state for dynamic assessment
  const [visibleQuestions, setVisibleQuestions] = useState<Array<AssessmentQuestion>>([]);
  const [liveRiskScore, setLiveRiskScore] = useState<LiveRisk>({
    score: 0,
    impact: 'low',
    trend: 'stable',
  });

  const [proficiency, setProficiency] = useState<'novice' | 'intermediate' | 'expert'>('intermediate');

  // Initialize assessment - clear any existing data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('assessmentResponses');
      localStorage.removeItem('leadData');
    }
    setIsInitialized(true);
  }, []);

  // Update visible questions based on responses
  useEffect(() => {
    const profResp = responses.find(r => r.questionId === 'user-proficiency');
    const currentProficiency = profResp?.selectedOptions[0] as 'novice' | 'intermediate' | 'expert' || 'intermediate';
    setProficiency(currentProficiency);

    const filtered = assessmentQuestions.filter(q => shouldShowQuestion(q, responses, currentProficiency));
    setVisibleQuestions(filtered);

    // Update live risk score
    if (responses.length > 0) {
      const liveScore = calculateLiveRiskScore(responses, assessmentQuestions);
      setLiveRiskScore(liveScore);
    }
  }, [responses]);

  // Adjust current step if it's beyond visible questions
  useEffect(() => {
    if (currentStep >= visibleQuestions.length && visibleQuestions.length > 0) {
      setCurrentStep(Math.max(0, visibleQuestions.length - 1));
    }
  }, [visibleQuestions, currentStep]);

  // Update social proof stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSocialProofStats(prev => ({
        todayAssessments: prev.todayAssessments + Math.floor(Math.random() * 3),
        weeklyAssessments: prev.weeklyAssessments + Math.floor(Math.random() * 5),
        averageRisk: prev.averageRisk + (Math.random() > 0.5 ? 1 : -1)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Loading screen tip rotation and progress
  useEffect(() => {
    if (!showLoadingScreen) return;

    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % cyberTips.length);
    }, 3000);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('assessmentResponses', JSON.stringify(responses));
            localStorage.setItem('leadData', JSON.stringify(leadData));
          }
          router.push('/results');
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [showLoadingScreen, responses, leadData, router]);

  // Show lead capture after completing all visible questions
  useEffect(() => {
    if (currentStep >= visibleQuestions.length && visibleQuestions.length > 0 && !leadData && !showLeadCapture && isInitialized) {
      setShowLeadCapture(true);
    }
  }, [currentStep, visibleQuestions.length, leadData, showLeadCapture, isInitialized]);

  // Check for compliance over-selection
  useEffect(() => {
    const currentQuestion = visibleQuestions[currentStep];
    if (currentQuestion?.id === 'compliance-needs') {
      const currentResponse = getCurrentResponse('compliance-needs');
      if (currentResponse && currentResponse.selectedOptions.length >= 4) {
        setShowComplianceWarning(true);
      } else {
        setShowComplianceWarning(false);
      }
    }
  }, [responses, currentStep, visibleQuestions]);

  const totalSteps = visibleQuestions.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const currentQuestion = visibleQuestions[currentStep];

  const handleResponse = (questionId: string, selectedOptions: string[], sliderValue?: number, textValue?: string) => {
    const updatedResponses = responses.filter(r => r.questionId !== questionId);
    updatedResponses.push({
      questionId,
      selectedOptions,
      sliderValue,
      textValue
    });
    setResponses(updatedResponses);
  };

  const getCurrentResponse = (questionId: string): AssessmentResponse | undefined => {
    return responses.find(r => r.questionId === questionId);
  };

  const isCurrentStepValid = (): boolean => {
    if (!currentQuestion) return false;
    const currentResponse = getCurrentResponse(currentQuestion.id);
    if (!currentResponse) return false;
    
    if (currentQuestion.type === 'slider') {
      return currentResponse.sliderValue !== undefined;
    }
    
    return currentResponse.selectedOptions.length > 0;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowLeadCapture(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLeadCapture = (data: LeadData) => {
    setLeadData(data);
    setShowLeadCapture(false);
    setShowDisclaimerWarning(true);
  };

  const handleSkipLeadCapture = () => {
    const minimalData: LeadData = {
      firstName: 'Anonymous',
      lastName: 'User',
      email: 'anonymous@example.com',
      company: 'Not Provided',
      jobTitle: 'Not Provided'
    };
    
    setLeadData(minimalData);
    setShowLeadCapture(false);
    setShowDisclaimerWarning(true);
  };

  const handleDisclaimerAccept = () => {
    setShowDisclaimerWarning(false);
    setShowLoadingScreen(true);
    setLoadingProgress(0);
    setCurrentTipIndex(0);
  };

  const handleScheduleConsultation = () => {
    window.open('https://calendly.com/goureshkamble/cyber-security-consultation1?back=1&month=2025-06', '_blank');
  };

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    const currentResponse = getCurrentResponse(question.id);

    switch (question.type) {
      case 'multiSelect':
        return (
          <div className="space-y-4">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={option.id}
                  checked={currentResponse?.selectedOptions.includes(option.id) || false}
                  onCheckedChange={(checked) => {
                    const current = currentResponse?.selectedOptions || [];
                    const updated = checked
                      ? [...current, option.id]
                      : current.filter(id => id !== option.id);
                    handleResponse(question.id, updated);
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    {option.riskImpact && (
                      <Badge variant="outline" className={`text-xs ${getRiskColor(option.riskImpact)}`}>
                        {option.riskImpact} impact
                      </Badge>
                    )}
                  </div>
                  {option.tooltip && (
                    <p className="text-sm text-gray-500 mt-1">{option.tooltip}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Compliance Warning */}
            {question.id === 'compliance-needs' && showComplianceWarning && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">
                      Compliance complexity warning
                    </h4>
                    <p className="text-sm text-amber-700 mb-3">
                      You've selected multiple compliance frameworks. Whilst compliance is important, 
                      <strong> over-compliance can actually increase risk</strong> by creating:
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1 mb-3">
                      <li>• Conflicting security controls that reduce effectiveness</li>
                      <li>• Administrative overhead that diverts resources from actual security</li>
                      <li>• Complex audit requirements that slow business operations</li>
                      <li>• Higher costs with diminishing security returns</li>
                    </ul>
                    <div className="bg-amber-100 p-3 rounded border border-amber-300">
                      <p className="text-sm text-amber-800">
                        <strong>Hanco Cyber Recommendation:</strong> Focus on 1-2 primary frameworks that align 
                        with your business needs. We'll help you achieve <em>effective</em> security, not just 
                        checkbox compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'singleSelect':
        return (
          <RadioGroup
            value={currentResponse?.selectedOptions[0] || ''}
            onValueChange={(value) => handleResponse(question.id, [value])}
          >
            <div className="space-y-4">
              {question.options?.map((option) => (
                <div
                  key={option.id}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={option.id}
                        className="block text-sm font-medium cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      {option.riskImpact && (
                        <Badge variant="outline" className={`text-xs ${getRiskColor(option.riskImpact)}`}>
                          {option.riskImpact} impact
                        </Badge>
                      )}
                    </div>
                    {option.tooltip && (
                      <p className="text-sm text-gray-500 mt-1">
                        {option.tooltip}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'slider':
        const sliderValue = currentResponse?.sliderValue || 50;
        const selectedOption = question.options?.find(opt => 
          Math.abs((opt.value as number) - sliderValue) <= 12.5
        );
        
        return (
          <div className="space-y-6">
            <div className="px-4">
              <Slider
                value={[sliderValue]}
                onValueChange={(value) => handleResponse(question.id, [], value[0])}
                max={100}
                min={0}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Conservative</span>
                <span>Balanced</span>
                <span>Aggressive</span>
                <span>Risk-driven</span>
              </div>
            </div>
            {selectedOption && (
              <div className={`p-4 border rounded-lg ${getRiskColor(selectedOption.riskImpact || 'medium')}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{selectedOption.label}</h4>
                  {selectedOption.riskImpact && (
                    <Badge className={getRiskColor(selectedOption.riskImpact)}>
                      {selectedOption.riskImpact} impact
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{selectedOption.tooltip}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialising assessment...</p>
        </div>
      </div>
    );
  }

  // Disclaimer Warning Screen
  if (showDisclaimerWarning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-amber-100 p-4 rounded-full shadow-sm w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Important: Assessment Limitations
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Before viewing your results, please understand the scope and limitations of this assessment.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              This is a high-level assessment only
            </h3>
            <div className="space-y-3 text-sm text-amber-700">
              <div className="flex items-start space-x-3">
                <div className="bg-amber-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-amber-800">1</span>
                </div>
                <p><strong>Limited scope:</strong> This assessment is based on your responses to general questions and cannot capture the full complexity of your organisation's security posture.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-amber-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-amber-800">2</span>
                </div>
                <p><strong>No technical audit:</strong> We haven't examined your actual systems, networks, or security controls. Real vulnerabilities may exist that this assessment cannot detect.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-amber-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-amber-800">3</span>
                </div>
                <p><strong>Estimates only:</strong> Pricing, timelines, and risk scores are estimates based on industry averages and may vary significantly based on your specific requirements.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-amber-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-amber-800">4</span>
                </div>
                <p><strong>Subject to change:</strong> All recommendations, pricing, and risk assessments are subject to change following detailed consultation and technical assessment.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              What happens next?
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• <strong>Review your results:</strong> Use them as a starting point for security planning</p>
              <p>• <strong>Schedule a consultation:</strong> Get detailed, personalised recommendations</p>
              <p>• <strong>Technical assessment:</strong> We'll conduct a proper security audit of your systems</p>
              <p>• <strong>Tailored proposal:</strong> Receive accurate pricing and implementation plans</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-1">
                  No guarantee of security
                </h4>
                <p className="text-xs text-red-700">
                  This assessment does not guarantee your organisation's security. Only a comprehensive security audit and implementation of appropriate controls can provide real protection.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleDisclaimerAccept}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              I understand - Show my results
            </Button>
            
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleScheduleConsultation}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Skip results - Schedule consultation instead
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            By
