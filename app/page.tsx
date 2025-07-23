'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Users, Award, Globe, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const stats = [
  { label: 'Assessments Completed', value: 2847, prefix: '', suffix: '+' },
  { label: 'Average Risk Score', value: 72, prefix: '', suffix: '%' },
  { label: 'Client Retention Rate', value: 95, prefix: '', suffix: '%' },
  { label: 'Countries Served', value: 23, prefix: '', suffix: '' },
];

export default function Home() {
  const [currentStats, setCurrentStats] = useState(stats);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStats(prev => prev.map(stat => ({
        ...stat,
        value: stat.value + Math.floor(Math.random() * 3) - 1
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleScheduleConsultation = () => {
    window.open('https://calendly.com/goureshkamble/cyber-security-consultation1?back=1&month=2025-06', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/HancoCyber-White-landscape-375.png"
                alt="Hanco Cyber"
                width={180}
                height={45}
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <a href="tel:+441908881811" className="text-red-600 hover:text-red-700 font-medium">
                +44 1908 881 811
              </a>
              <Button 
                variant="outline" 
                className="border-red-200 text-red-700 hover:bg-red-50"
                onClick={handleScheduleConsultation}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Consultation
              </Button>
              <a
                href="https://hancocyber.com/contact-us/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                  Contact Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

  {/* Hero Section */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
  <div className="text-center">
    {/* 1️⃣ Title up top */}
    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
      Build your
      <span className="text-red-600 block">cyber strategy</span>
      roadmap
    </h1>

    {/* 2️⃣ Badge below the title */}
    <div className="flex justify-center items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mt-6 mb-12">
      <Award className="h-4 w-4 mr-2" />
      Trusted by organisations worldwide – recommendations on request
    </div>

    {/* 3️⃣ Sub-heading / description */}
    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
      Executive-level cyber security assessment designed for C-suite decision makers. 
      Understand your risk exposure, identify compliance gaps, and develop a strategic 
      roadmap with bespoke solutions that match your organisation's unique requirements.
    </p>

    {/* 4️⃣ Primary CTA + micro-copy */}
    <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center items-center mb-16">
      <p className="order-2 sm:order-1 text-sm text-gray-500">
        Understand your risk • Build your roadmap • Stay compliant
      </p>
      <Link href="/assessment" className="order-1 sm:order-2">
        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
          Begin your cyber strategy assessment
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>

    {/* 5️⃣ Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {currentStats.map((stat, index) => (
        <Card
          key={index}
          className="p-6 text-center border-red-100 hover:border-red-200 transition-colors"
        >
          <div className="text-3xl font-bold text-red-600 mb-2">
            {stat.prefix}{stat.value}{stat.suffix}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </Card>
      ))}
    </div>
  </div>
</section>


      {/* Value Proposition */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Executive Leaders Choose Hanco Cyber
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our strategic approach combines deep technical expertise with business acumen, 
              delivering solutions that protect your organisation whilst enabling growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center border-red-100 hover:border-red-200 transition-colors">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Strategic risk management</h3>
              <p className="text-gray-600">
                Board-level risk assessments that align cyber security investments with business objectives 
                and regulatory requirements.
              </p>
            </Card>

            <Card className="p-8 text-center border-red-100 hover:border-red-200 transition-colors">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Bespoke Solutions</h3>
              <p className="text-gray-600">
                All services are scoped collaboratively to match your needs—no rigid pricing. 
                From £900 SOC Lite to enterprise-grade 24/7 operations.
              </p>
            </Card>

            <Card className="p-8 text-center border-red-100 hover:border-red-200 transition-colors">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Expertise</h3>
              <p className="text-gray-600">
                95% client retention rate with the ability to operate globally. Deep understanding 
                of international compliance frameworks and threat landscapes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to strengthen your cyber posture?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join a number of organisations that trust Hanco Cyber for strategic cyber security leadership.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment">
              <Button size="lg" variant="secondary" className="bg-white text-red-600 hover:bg-gray-50 px-8 py-4">
                Start Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-red-100 hover:bg-white hover:text-red-600 px-8 py-4"
              onClick={handleScheduleConsultation}
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/HancoCyber-White-landscape-375.png"
                  alt="Hanco Cyber"
                  width={150}
                  height={38}
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-400">
                Executive-level cybersecurity advisory and managed services for organisations 
                that demand excellence in digital risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>Phone: +44 1908 881 811</p>
                <p>Email: gouresh@hancoglobal.com</p>
                <p>Available 24/7 for emergencies</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <div className="space-y-2 text-gray-400">
                <p>Managed SOC Services</p>
                <p>Vulnerability Management</p>
                <p>Incident Response</p>
                <p>Compliance Advisory</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Hanco Cyber. All rights reserved. Building secure digital futures.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
