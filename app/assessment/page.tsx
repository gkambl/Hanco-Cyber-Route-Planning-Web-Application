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
    if (currentStep >= visibleQuestions.length && visibleQuestions.length > 0 && !leadData && !showLeadCapture && !showDisclaimerWarning && !showLoadingScreen && isInitialized) {
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
    if (!currentQuestion || currentStep >= visibleQuestions.length) return true;
    const currentResponse = getCurrentResponse(currentQuestion.id);
    if (!currentResponse) return false;
    
    if (currentQuestion.type === 'slider') {
      return currentResponse.sliderValue !== undefined;
    }
    
    return currentResponse.selectedOptions.length > 0;
  };

  const handleNext = () => {
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep >= visibleQuestions.length - 1 && !showLeadCapture && !leadData) {
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
            By proceeding, you acknowledge that this assessment provides general guidance only and that specific security recommendations require detailed consultation.
          </p>
        </Card>
      </div>
    );
  }

  // Loading Screen with Cyber Tips
  if (showLoadingScreen) {
    const currentTip = cyberTips[currentTipIndex];
    const IconComponent = currentTip.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-white p-4 rounded-full shadow-sm w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Image
                src="/HancoCyber-White-landscape-375.png"
                alt="Hanco Cyber"
                width={60}
                height={15}
                className="h-4 w-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analysing your cybersecurity posture
            </h2>
            <p className="text-gray-600 mb-6">
              We're processing your responses and generating personalised recommendations...
            </p>
            
            <div className="mb-8">
              <Progress value={loadingProgress} className="h-3 mb-2" />
              <p className="text-sm text-gray-500">
                {Math.round(loadingProgress)}% complete
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                <IconComponent className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Cyber tip: {currentTip.title}
                </h3>
                <p className="text-red-700">
                  {currentTip.tip}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-2 mb-6">
            {cyberTips.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTipIndex ? 'bg-red-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              What we're analysing:
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="flex items-center justify-center p-2 bg-gray-50 rounded">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                Risk assessment
              </div>
              <div className="flex items-center justify-center p-2 bg-gray-50 rounded">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                Compliance gaps
              </div>
              <div className="flex items-center justify-center p-2 bg-gray-50 rounded">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                Service recommendations
              </div>
              <div className="flex items-center justify-center p-2 bg-gray-50 rounded">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                ROI calculations
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (showLeadCapture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="bg-white p-4 rounded-full shadow-sm w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Image
                src="/HancoCyber-White-landscape-375.png"
                alt="Hanco Cyber"
                width={60}
                height={15}
                className="h-4 w-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get your personalised results</h2>
            <p className="text-gray-600 mb-4">
              You've completed the assessment! Please share your details to receive your personalised cybersecurity roadmap and recommendations.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                How your company name helps personalise results:
              </h3>
              <ul className="text-xs text-blue-700 space-y-1 text-left">
                <li>• Industry-specific threat intelligence and benchmarks</li>
                <li>• Tailored compliance requirements for your sector</li>
                <li>• Company size-appropriate service recommendations</li>
                <li>• Relevant case studies and peer comparisons</li>
                <li>• Accurate ROI calculations based on your business model</li>
              </ul>
            </div>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data: LeadData = {
              firstName: formData.get('firstName') as string,
              lastName: formData.get('lastName') as string,
              email: formData.get('email') as string,
              company: formData.get('company') as string,
              jobTitle: formData.get('jobTitle') as string,
              phone: formData.get('phone') as string,
            };
            handleLeadCapture(data);
          }} className="space-y-4">
            {leadCaptureFields.map((field) => (
              <div key={field.id}>
                <Label htmlFor={field.id} className="text-sm font-medium">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  required={field.required}
                  className="mt-1"
                />
              </div>
            ))}
            
            <div className="space-y-3">
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                View my personalised results
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={handleSkipLeadCapture}
              >
                <Eye className="h-4 w-4 mr-2" />
                Just let me see my results
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  Your privacy is protected
                </h4>
                <div className="text-xs text-green-700 space-y-1">
                  <p><strong>GDPR compliance:</strong> Your information is processed lawfully under legitimate interest for providing personalised cybersecurity recommendations.</p>
                  <p><strong>Data Use:</strong> We use your details solely to:</p>
                  <ul className="ml-3 space-y-0.5">
                    <li>• Personalise your assessment results</li>
                    <li>• Provide industry-specific recommendations</li>
                    <li>• Calculate accurate ROI models for your business</li>
                    <li>• Contact you about your results (if requested)</li>
                  </ul>
                  <p><strong>No Sharing:</strong> We never sell, rent, or share your data with third parties for marketing purposes.</p>
                  <p><strong>Your Rights:</strong> You can request access, correction, or deletion of your data at any time by contacting info@hancocyber.com</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your information is secure and will only be used to provide personalised recommendations.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/HancoCyber-White-landscape-375.png"
                alt="Hanco Cyber"
                width={180}
                height={45}
                className="h-10 w-auto"
              />
              <div>
                <p className="text-sm text-gray-600">Security assessment</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-red-200 text-red-700">
                <Users className="h-3 w-3 mr-1" />
                {socialProofStats.todayAssessments} completed today
              </Badge>
              <Badge variant="outline" className="border-red-200 text-red-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                Avg. risk: {socialProofStats.averageRisk}%
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleScheduleConsultation}
                className="border-red-200 text-red-700 hover:bg-red-50 hidden sm:flex"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar with Live Risk Score */}
      <div className="bg-white border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentStep + 1} of {totalSteps}
            </span>
            <div className="flex items-center space-x-4">
              {responses.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getRiskColor(liveRiskScore.impact)}`}>
                    Risk: {liveRiskScore.score}%
                  </Badge>
                  <div className={`${getRiskColor(liveRiskScore.impact)} p-1 rounded`}>
                    {getTrendIcon(liveRiskScore.trend)}
                  </div>
                </div>
              )}
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
        {currentQuestion && (
          <Card className="p-8 relative">
            <div className="absolute top-6 right-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleScheduleConsultation}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p className="text-sm">Need help answering? Schedule a consultation with our experts</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="mb-8 pr-12">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-5 w-5 text-gray-400 cursor-help flex-shrink-0 ml-2" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>{currentQuestion.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-gray-600 text-lg">
                {currentQuestion.description}
              </p>
            </div>

            <div className="mb-12">
              {renderQuestion(currentQuestion)}
            </div>

            <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Need guidance on this question?</h4>
                  <p className="text-xs text-red-600">Our cybersecurity experts can help you assess your specific situation</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleScheduleConsultation}
                  className="border-red-200 text-red-700 hover:bg-red-100 ml-4 flex-shrink-0"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Get Expert Help
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isCurrentStepValid()}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center"
              >
                {currentStep >= visibleQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Enhanced Floating Social Proof with Live Risk Updates */}
        <div className="fixed bottom-6 left-6 bg-white p-4 rounded-lg shadow-lg border border-red-100 max-w-sm z-40">
          <div className="text-sm">
            <div className="font-medium text-gray-900 mb-1">Live Activity</div>
            <div className="text-gray-600 space-y-1">
              <div>{socialProofStats.weeklyAssessments} assessments this week</div>
              <div>Average industry risk: {socialProofStats.averageRisk}%</div>
              {responses.length > 1 && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span>Your current risk:</span>
                    <Badge className={`text-xs ${getRiskColor(liveRiskScore.impact)}`}>
                      {liveRiskScore.score}%
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
