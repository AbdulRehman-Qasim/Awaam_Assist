import React from 'react';
import MarketingLayout from '@/layouts/MarketingLayout';

const PrivacyPage = () => {
  return (
    <MarketingLayout>
      <div className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Privacy Policy</h1>
          <p className="text-gray-700 mb-4">
            At Awam Assist, your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information you provide, such as your name, email, company details, and any other data you enter during the hiring process.
            We also collect analytics data about how you use our platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use your information to provide and improve our AI-powered interviewing platform, communicate with you, and fulfill legal obligations.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Data Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal data. We may share data with trusted vendors or service providers who help us operate our services.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            Interview recordings and related data are retained according to your plan. You may request deletion of your data at any time.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You may request access to, update, or delete your personal data by contacting us. Depending on your jurisdiction, you may have additional rights under laws like GDPR or CCPA.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Security</h2>
          <p className="text-gray-700 mb-4">
            We use industry-standard security measures to protect your data, including encryption, secure hosting, and access controls.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this policy periodically. If we make significant changes, we’ll notify you via the platform or email.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Contact</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this policy, please contact us at <a href="mailto:426mohsinali@gmail.com" className="text-primary-600 underline">privacy@AwamAssist.com</a>.
          </p>
        </div>
      </div>
    </MarketingLayout>
  );
};

export default PrivacyPage;
