import React from "react";
import { Helmet } from "react-helmet-async";

function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | AI Tees</title>
        <meta
          name="description"
          content="Understand how AI Tees collects and protects your personal information."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <header>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-gray-600">
            We respect the privacy of designers and shoppers alike. This policy
            explains what data we collect and how we keep it safe.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            1. Information we collect
          </h2>
          <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
            <li>Account details: name, email, shipping address.</li>
            <li>Order history and prompts used to generate designs.</li>
            <li>Website analytics to improve our storefront experience.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            2. How we use your data
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Data is used to fulfill orders, support your account, improve the
            product, and—when you opt in—send updates about new AI prompt packs.
            We never sell your personal data.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            3. Your choices
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            You can request data exports or deletion anytime by emailing
            privacy@aitees.com. Opt out of marketing emails using the
            unsubscribe link in any message.
          </p>
        </section>
      </div>
    </>
  );
}

export default Privacy;
