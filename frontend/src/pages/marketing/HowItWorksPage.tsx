
import React from 'react';
import MarketingLayout from '@/layouts/MarketingLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AccountSignup from '../../assets/AccountSignup.png'
import CreateJobPicture from '../../assets/postjob.png'
import InterviewLinkSent from '../../assets/InterviewLinkSent.png'
import AITakingInterview from '../../assets/AITakingInterview.png'
import InterviewResults from '../../assets/InterviewResults.png'

const HowItWorksPage = () => {
  return (
    <MarketingLayout>
      <div className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How Awam Assist Works</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access essential services in just a few simple steps using our comprehensive platform.
            </p>
          </div>

          {/* Process Steps */}
          <div className="max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center mb-20">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                <div className="bg-primary-50 rounded-full w-12 h-12 flex items-center justify-center text-primary-600 font-bold text-xl mb-4">1</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Account</h2>
                <p className="text-gray-600 mb-4">
                  Sign up for Awam Assist and create your citizen profile. Enter your preferences and goals to get personalized recommendations.
                </p>
                <ul className="list-disc pl-5 text-gray-600 mb-4">
                  <li>Quick registration process</li>
                  <li>Secure student profile</li>
                  <li>Personalized preferences</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white p-2 rounded-xl shadow-lg">
                  <img 
                    src={AccountSignup} 
                    alt="Create account" 
                    className="rounded-lg w-full h-64 object-inherit"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center mb-20">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
                <div className="bg-primary-50 rounded-full w-12 h-12 flex items-center justify-center text-primary-600 font-bold text-xl mb-4">2</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Eligibility</h2>
                <p className="text-gray-600 mb-4">
                  Use our eligibility checker to instantly see which universities match your academic marks, budget, location preferences, and desired programs.
                </p>
                {/* <ul className="list-disc pl-5 text-gray-600 mb-4">
                  <li>Customizable job templates</li>
                  <li>Skill priority settings</li>
                  <li>Automated job distribution</li>
                </ul> */}
              </div>
              <div className="md:w-1/2">
                <div className="bg-white p-2 rounded-xl shadow-lg">
                  <img 
                    src={CreateJobPicture}
                    alt="Post job" 
                    className="rounded-lg w-full h-64 object-inherit"
                  />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center mb-20">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                <div className="bg-primary-50 rounded-full w-12 h-12 flex items-center justify-center text-primary-600 font-bold text-xl mb-4">3</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore Universities</h2>
                <p className="text-gray-600 mb-4">
                  Browse through our comprehensive database of Pakistani universities with detailed information about programs, fees, merit requirements, rankings, and admission details.
                </p>
                {/* <ul className="list-disc pl-5 text-gray-600 mb-4">
                  <li>Bulk candidate invitation</li>
                  <li>Automated reminders</li>
                  <li>Custom email templates</li>
                </ul> */}
              </div>
              <div className="md:w-1/2">
                <div className="bg-white p-2 rounded-xl shadow-lg">
                  <img 
                    src={InterviewLinkSent}
                    alt="Invite candidates" 
                    className="rounded-lg w-full h-64 object-inherit"
                  />
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center mb-20">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
                <div className="bg-primary-50 rounded-full w-12 h-12 flex items-center justify-center text-primary-600 font-bold text-xl mb-4">4</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Compare & Save</h2>
                <p className="text-gray-600 mb-4">
                  Compare up to 3 universities side-by-side to analyze merit trends, fees, programs, and other key factors. Save your favorite universities for easy access.
                </p>
                <ul className="list-disc pl-5 text-gray-600 mb-4">
                  <li>Side-by-side comparison</li>
                  <li>Merit trend analysis</li>
                  <li>Save favorites feature</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white p-2 rounded-xl shadow-lg">
                  <img 
                    src={AITakingInterview}
                    alt="AI interview" 
                    className="rounded-lg w-full h-64 object-inherit"
                  />
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                <div className="bg-primary-50 rounded-full w-12 h-12 flex items-center justify-center text-primary-600 font-bold text-xl mb-4">5</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Make Your Decision</h2>
                <p className="text-gray-600 mb-4">
                  Review detailed university information, contact details, admission requirements, and deadlines to make your final decision and apply to your chosen universities.
                </p>
                <ul className="list-disc pl-5 text-gray-600 mb-4">
                  <li>Complete university details</li>
                  <li>Admission information</li>
                  <li>Contact & application links</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-white p-2 rounded-xl shadow-lg">
                  <img 
                    src={InterviewResults}
                    alt="Review results" 
                    className="rounded-lg w-full h-64 object-inherit"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to get started?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg">Start Exploring</Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
};

export default HowItWorksPage;
