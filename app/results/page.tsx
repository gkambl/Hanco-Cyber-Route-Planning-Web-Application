'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Phone, 
  Mail, 
  Calendar,
  Download,
  Star,
  Target,
  DollarSign,
  Clock,
  Users,
  Award,
  TrendingDown,
  Radar
} from 'lucide-react';
import { assessmentQuestions } from '@/lib/assessment-config';
import { 
  AssessmentResponse, 
  generateAssessmentResults, 
  AssessmentResults 
} from '@/lib/assessment-logic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Results() {
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedResponses = localStorage.getItem('assessmentResponses');
    const storedLead = localStorage.getItem('leadData');
    
    if (!storedResponses) {
      // No assessment data found, redirect to assessment
      router.push('/assessment');
      return;
    }

    try {
      const responses: AssessmentResponse[] = JSON.parse(storedResponses);
      const lead = storedLead ? JSON.parse(storedLead) : null;
      
      // Validate that we have actual responses
      if (!responses || responses.length === 0) {
        router.push('/assessment');
        return;
      }
      
      const assessmentResults = generateAssessmentResults(responses, assessmentQuestions);
      setResults(assessmentResults);
      setLeadData(lead);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing results:', error);
      router.push('/assessment');
    }
  }, [router]);

  const getRiskColor = (score: number) => {
    if (score <= 25) return 'text-green-600 bg-green-100';
    if (score <= 50) return 'text-yellow-600 bg-yellow-100';
    if (score <= 75) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskIcon = (score: number) => {
    if (score <= 25) return <CheckCircle className="h-5 w-5" />;
    if (score <= 50) return <Target className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent(`Cybersecurity Consultation Request - ${leadData?.company || 'Assessment'}`);
    const body = encodeURIComponent(`Dear Hanco Cyber Team,

I've completed your cybersecurity assessment and would like to discuss the results.

Company: ${leadData?.company || 'Not provided'}
Contact: ${leadData?.firstName} ${leadData?.lastName}
Risk Score: ${results?.riskScore.overall}% (${results?.riskScore.category})

I'm particularly interested in:
- ${results?.serviceRecommendations.slice(0, 3).map(s => s.name).join('\n- ')}

Please contact me to schedule a consultation.

Best regards,
${leadData?.firstName} ${leadData?.lastName}`);
    
    window.location.href = `mailto:gouresh@hancoglobal.com?subject=${subject}&body=${body}`;
  };

  const handleStartNewAssessment = () => {
    // Clear localStorage and redirect to assessment
    localStorage.removeItem('assessmentResponses');
    localStorage.removeItem('leadData');
    router.push('/assessment');
  };

  const handleScheduleConsultation = () => {
    window.open('https://calendly.com/goureshkamble/cyber-security-consultation1?back=1&month=2025-06', '_blank');
  };

  if (isLoading || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analysing your cyber security posture...</p>
        </div>
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
                src="/HancoCyber-White-landscape 375.png"
                alt="Hanco Cyber"
                width={180}
                height={45}
                className="h-10 w-auto"
              />
              <div>
                <p className="text-sm text-gray-600">Assessment results</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleStartNewAssessment}>
                New assessment
              </Button>
              <Button variant="outline" onClick={handleEmailContact}>
                <Mail className="h-4 w-4 mr-2" />
                Email results
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleScheduleConsultation}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book consultation
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Executive Summary */}
        <div className="mb-12">
          <Card className="p-8 border-2 border-red-200">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your cyber security risk assessment
              </h1>
              {leadData && leadData.company !== 'Not Provided' && (
                <p className="text-lg text-gray-600">
                  Prepared for {leadData.firstName} {leadData.lastName} at {leadData.company}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Risk Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getRiskColor(results.riskScore.overall)} mb-4`}>
                  {getRiskIcon(results.riskScore.overall)}
                  <span className="text-2xl font-bold ml-2">{results.riskScore.overall}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall risk score</h3>
                <Badge className={getRiskColor(results.riskScore.overall)}>
                  {results.riskScore.category} Risk
                </Badge>
              </div>

              {/* Compliance Status */}
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 inline-flex items-center justify-center w-24 h-24 rounded-full mb-4">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance gaps</h3>
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  {results.complianceGaps.length} Areas that need attention
                </Badge>
              </div>

              {/* ROI Potential */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
                  results.roiModel.complianceComplexityPenalty?.isApplicable 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {results.roiModel.complianceComplexityPenalty?.isApplicable ? (
                    <TrendingDown className="h-8 w-8" />
                  ) : (
                    <DollarSign className="h-8 w-8" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ROI potential</h3>
                <Badge className={
                  results.roiModel.complianceComplexityPenalty?.isApplicable 
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : 'bg-green-100 text-green-800 border-green-200'
                }>
                  {results.roiModel.paybackPeriod} Payback
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Results Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Risk Breakdown */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="h-6 w-6 text-red-600 mr-2" />
                Risk analysis breakdown
              </h2>
              
              <div className="space-y-4">
                {Object.entries(results.riskScore.breakdown).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category} Risk
                      </span>
                      <span className="text-sm text-gray-600">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Industry benchmark</h4>
                <p className="text-sm text-gray-600">
                  Your risk score is <span className="font-medium">{results.benchmarkData.peerComparison.toLowerCase()}</span> compared 
                  to industry average of {results.benchmarkData.industryAverage}%.
                </p>
              </div>

              <div className="relative">
                {/* Custom Radar Chart using SVG */}
                <div className="w-full max-w-md mx-auto">
                  <svg viewBox="0 0 300 300" className="w-full h-auto">
                    {/* Background circles */}
                    <circle cx="150" cy="150" r="120" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                    <circle cx="150" cy="150" r="90" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                    <circle cx="150" cy="150" r="60" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                    <circle cx="150" cy="150" r="30" fill="none" stroke="#f3f4f6" strokeWidth="1" />
                    
                    {/* Axis lines */}
                    <line x1="150" y1="30" x2="150" y2="270" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="30" y1="150" x2="270" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="63.4" y1="63.4" x2="236.6" y2="236.6" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="236.6" y1="63.4" x2="63.4" y2="236.6" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* Data polygon */}
                    <polygon
                      points={`
                        150,${150 - (results.riskScore.breakdown.technical * 1.2)}
                        ${150 + (results.riskScore.breakdown.operational * 1.2)},150
                        150,${150 + (results.riskScore.breakdown.compliance * 1.2)}
                        ${150 - (results.riskScore.breakdown.financial * 1.2)},150
                      `}
                      fill="rgba(239, 68, 68, 0.2)"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    
                    {/* Data points */}
                    <circle cx="150" cy={150 - (results.riskScore.breakdown.technical * 1.2)} r="4" fill="#ef4444" />
                    <circle cx={150 + (results.riskScore.breakdown.operational * 1.2)} cy="150" r="4" fill="#ef4444" />
                    <circle cx="150" cy={150 + (results.riskScore.breakdown.compliance * 1.2)} r="4" fill="#ef4444" />
                    <circle cx={150 - (results.riskScore.breakdown.financial * 1.2)} cy="150" r="4" fill="#ef4444" />
                    
                    {/* Labels */}
                    <text x="150" y="20" textAnchor="middle" className="text-xs fill-gray-600">Technical</text>
                    <text x="280" y="155" textAnchor="middle" className="text-xs fill-gray-600">Operational</text>
                    <text x="150" y="290" textAnchor="middle" className="text-xs fill-gray-600">Compliance</text>
                    <text x="20" y="155" textAnchor="middle" className="text-xs fill-gray-600">Financial</text>
                  </svg>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Your organisation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                    <span>Industry benchmark</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Service Recommendations */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-6 h-6 mr-2 flex items-center justify-center">
                  <Image
                    src="/HancoCyber-White-landscape 375.png"
                    alt="Hanco Cyber"
                    width={24}
                    height={6}
                    className="h-3 w-auto"
                  />
                </div>
                Recommended security services
              </h2>

              <div className="space-y-6">
                {results.serviceRecommendations.map((service, index) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-gray-600">{service.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={
                            service.priority === 'Essential' ? 'bg-red-100 text-red-800' :
                            service.priority === 'Recommended' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {service.priority}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300">
                          <Clock className="h-3 w-3 mr-1" />
                          {service.timeframe}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key benefits:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {service.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Flexible delivery options:</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.scalingOptions.map((option, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Hanco cyber advantage</h4>
                <p className="text-sm text-red-700">
                  All services are scoped collaboratively to match your needs, no rigid pricing. 
                  We build deep understanding first to deliver scoped, high-impact outcomes with 98% client retention.
                </p>
              </div>
            </Card>

            {/* Compliance Gaps */}
            {results.complianceGaps.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Award className="h-6 w-6 text-red-600 mr-2" />
                  Compliance gap analysis
                </h2>

                <div className="space-y-4">
                  {results.complianceGaps.map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{gap.framework}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              gap.priority === 'High' ? 'bg-red-100 text-red-800' :
                              gap.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }
                          >
                            {gap.priority} Priority
                          </Badge>
                          <span className="text-sm text-gray-600">{gap.coverage}% Coverage</span>
                        </div>
                      </div>
                      
                      <Progress value={gap.coverage} className="mb-3" />
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Areas requiring attention:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {gap.missing.map((item, idx) => (
                            <li key={idx} className="flex items-center">
                              <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8 sticky-sidebar">
            {/* ROI Analysis */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 text-red-600 mr-2" />
                Investment Analysis
              </h2>

              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    £{results.roiModel.estimatedLossPrevention.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">Estimated loss prevention</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{results.roiModel.paybackPeriod}</div>
                    <div className="text-xs text-gray-600">Payback period</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{results.roiModel.riskReduction}%</div>
                    <div className="text-xs text-gray-600">Risk reduction</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Investment range</div>
                  <div className="text-lg font-semibold text-gray-900">{results.roiModel.investmentRange}</div>
                  <div className="text-xs text-gray-500 mt-1">Annual estimated range</div>
                </div>

                {/* Compliance Complexity Warning */}
                {results.roiModel.complianceComplexityPenalty?.isApplicable && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800 mb-2">
                          ⚠️ Compliance complexity impact
                        </h4>
                        <p className="text-sm text-amber-700 mb-2">
                          {results.roiModel.complianceComplexityPenalty.description}
                        </p>
                        <div className="text-xs text-amber-600 space-y-1">
                          <div>• Additional cost: £{results.roiModel.complianceComplexityPenalty.additionalCost.toLocaleString()}</div>
                          <div>• Efficiency loss: {results.roiModel.complianceComplexityPenalty.efficiencyLoss}%</div>
                        </div>
                        <div className="mt-2 p-2 bg-amber-100 rounded text-xs text-amber-800">
                          <strong>💡 Recommendation:</strong> Focus on 1-2 primary frameworks for better ROI
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="font-medium text-sm text-gray-700 cursor-pointer">
                    📋 ROI assumptions & disclaimer
                  </summary>
                  <p className="text-xs text-gray-500 mt-2">
                    • Based on industry breach data from IBM & Ponemon (2024–25).  
                    • Estimated Loss Prevention = probability of breach × average breach cost.  
                    • Payback period & Risk Reduction are modelled; actual results may vary.  
                    • Compliance complexity penalties reflect real-world operational impacts.
                    • Hanco Cyber provides no guarantee of specific financial outcomes.
                  </p>
                </details>
              </div>
            </Card>

            {/* Contact Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Next Steps</h2>
              
              <div className="space-y-4">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleScheduleConsultation}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule free consultation
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  onClick={handleEmailContact}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email results & discussion
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = 'tel:+441908881811'}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now: +44 1908 881 811
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="text-center">
                <h3 className="font-medium text-gray-900 mb-2">Intelligence reports</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Stay ahead of threats with our monthly intelligence reports
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Subscribe - £49/month (First month free)
                </Button>
                <p className="text-xs text-gray-500 mt-2">No need to subscribe to get your results</p>
              </div>
            </Card>

            {/* Trust Indicators */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Why choose Hanco Cyber</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>95% client retention rate</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 text-blue-500 mr-2" />
                  <span>50+ organisations protected</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    <Image
                      src="/HancoCyber-White-landscape 375.png"
                      alt="Hanco Cyber"
                      width={16}
                      height={4}
                      className="h-2 w-auto"
                    />
                  </div>
                  <span>24/7 emergency response</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Global operations capability</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12">
          <Card className="p-8 bg-gradient-to-r from-red-600 to-red-700 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to strengthen your cyber posture?</h2>
              <p className="text-red-100 mb-6 max-w-2xl mx-auto">
                Our cybersecurity experts are ready to help you implement these recommendations 
                and build a robust security programme tailored to your organisation's needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="bg-white text-red-600 hover:bg-gray-50"
                  onClick={handleScheduleConsultation}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book your strategy session
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-red-600"
                  onClick={handleEmailContact}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Discuss via email
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}