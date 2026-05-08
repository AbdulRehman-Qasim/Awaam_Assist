
import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '@/layouts/MarketingLayout';
import { Button } from '@/components/ui/button';
import CreateJobPicture from '../../assets/postjob.png'
import InterviewLinkSent from '../../assets/InterviewLinkSent.png'
import AITakingInterview from '../../assets/AITakingInterview.png'
import InterviewResults from '../../assets/InterviewResults.png'

const HomePage = () => {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <div className="gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in">
              Comprehensive Citizen Assistance
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-10 animate-fade-in">
              Awam Assist helps you discover and compare universities, government schemes, and hospitals in Pakistan based on your needs and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              {/* <Link to="/request-demo">
                <Button size="lg" className="bg-white text-black hover:text-[rgb(0,140,178)] hover:bg-gray-50">
                  Request Demo
                </Button>
              </Link> */}
              <Link to="/how-it-works">
                <Button size="lg" className="bg-white text-black hover:text-[rgb(0,140,178)] hover:bg-gray-50">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Awam Assist?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Pakistan's leading platform to discover, compare, and shortlist universities with comprehensive data and insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm card-hover">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Search and filter universities by merit requirements, fees, location, programs, and rankings to find your best match.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm card-hover">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Compare Universities</h3>
              <p className="text-gray-600">
                Compare up to 3 universities side-by-side to analyze merit trends, fees, programs, and other key factors.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm card-hover">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Save Favorites</h3>
              <p className="text-gray-600">
                Save your favorite universities and create a personalized list for easy access and future reference.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Access essential services in just a few simple steps.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="mb-6 md:mb-0 md:mr-8 md:w-1/2">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <img 
                    src={CreateJobPicture}
                    alt="Post a job" 
                    className="rounded-lg object-inherit h-60 w-full"
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="flex items-center mb-3">
                  <div className="bg-[#0097b2] text-white rounded-full w-8 h-8 flex items-center justify-center font-medium mr-3">1</div>
                  <h3 className="text-xl font-medium text-gray-900">Check Your Eligibility</h3>
                </div>
                <p className="text-gray-600">
                  Use our eligibility checker to find universities that match your academic marks, budget, location preferences, and desired programs.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center mb-12">
              <div className="mb-6 md:mb-0 md:ml-8 md:w-1/2">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <img 
                    src={InterviewLinkSent}
                    alt="Invite candidates" 
                    className="rounded-lg object-inherit h-60 w-full"
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="flex items-center mb-3">
                  <div className="bg-[#0097b2] text-white rounded-full w-8 h-8 flex items-center justify-center font-medium mr-3">2</div>
                  <h3 className="text-xl font-medium text-gray-900">Explore Universities</h3>
                </div>
                <p className="text-gray-600">
                  Browse through our comprehensive database of Pakistani universities with detailed information about programs, fees, merit requirements, and rankings.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="mb-6 md:mb-0 md:mr-8 md:w-1/2">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <img 
                    src={AITakingInterview} 
                    alt="AI interviews" 
                    className="rounded-lg object-inherit h-60 w-full"
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="flex items-center mb-3">
                  <div className="bg-[#0097b2] text-white rounded-full w-8 h-8 flex items-center justify-center font-medium mr-3">3</div>
                  <h3 className="text-xl font-medium text-gray-900">Compare & Save</h3>
                </div>
                <p className="text-gray-600">
                  Compare up to 3 universities side-by-side to analyze merit trends and key metrics. Save your favorites for later reference.
                </p>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center">
              <div className="mb-6 md:mb-0 md:ml-8 md:w-1/2">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <img 
                    src={InterviewResults}
                    alt="Review results" 
                    className="rounded-lg object-inherit h-60 w-full"
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="flex items-center mb-3">
                  <div className="bg-[#0097b2] text-white rounded-full w-8 h-8 flex items-center justify-center font-medium mr-3">4</div>
                  <h3 className="text-xl font-medium text-gray-900">Make Your Decision</h3>
                </div>
                <p className="text-gray-600">
                  Review detailed university information, contact details, and admission requirements to make your final decision.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
     
      {/* CTA Section */}
      <div className="py-16 lg:py-24 gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to access Awam Assist?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-black hover:text-[rgb(0,140,178)] hover:bg-gray-50">
                Start Exploring
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="bg-white text-black hover:text-[rgb(0,140,178)] hover:bg-gray-50">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
};

export default HomePage;
