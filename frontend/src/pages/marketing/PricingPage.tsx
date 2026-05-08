import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import MarketingLayout from '@/layouts/MarketingLayout';

interface FAQ {
  question: string;
  answer: string;
}

export default function PricingPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback FAQs in case the API call fails
  const fallbackFaqs: FAQ[] = [
    {
      question: "How do I search for universities?",
      answer: "Use the search bar at the top of the page to find universities by name, location, or program. You can also use our advanced filters to narrow down your search."
    },
    {
      question: "Can I compare universities?",
      answer: "Yes, you can compare up to 3 universities at once. Simply click the 'Compare' button on any university card to add it to your comparison list."
    },
    {
      question: "How do I save my favorite universities?",
      answer: "Click the heart icon on any university card to save it to your favorites. You can view all your saved universities in the 'Favorites' section of your account."
    },
    {
      question: "Is Awam Assist free to use?",
      answer: "Yes, Awam Assist is completely free for citizens. There are no hidden fees or charges for using our platform to search and compare universities."
    },
    {
      question: "How often is the university data updated?",
      answer: "We update our university data regularly to ensure you have access to the most current information. Our team works to verify and update all listings at least once per academic term."
    }
  ];

  useEffect(() => {
    // Directly use the fallback FAQs without any API calls
    setFaqs(fallbackFaqs);
    setLoading(false);
  }, []);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <MarketingLayout>
      <div className="bg-white py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about Awam Assist
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-3xl mx-auto mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="max-w-3xl mx-auto py-12 flex justify-center">
              <div className="animate-pulse flex flex-col items-center space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-64 bg-gray-100 rounded"></div>
                <div className="h-4 w-56 bg-gray-100 rounded mt-4"></div>
                <div className="h-4 w-52 bg-gray-100 rounded"></div>
              </div>
            </div>
          ) : (
            /* FAQ List */
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm"
                >
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex justify-between items-center p-4 text-left text-gray-900 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
                    aria-expanded={openIndex === index}
                  >
                    <span>{faq.question}</span>
                    <svg 
                      className={`h-5 w-5 text-gray-500 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openIndex === index && (
                    <div className="px-4 pb-4 pt-2 text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Contact Support */}
          {/* <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for?
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Contact Support
            </a>
          </div> */}
        </div>
      </div>
    </MarketingLayout>
  );
}
