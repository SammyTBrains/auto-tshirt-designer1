import React from "react";
import { Helmet } from "react-helmet-async";

function GDPR() {
  return (
    <>
      <Helmet>
        <title>GDPR Compliance | AI Tees</title>
        <meta
          name="description"
          content="Learn how AI Tees complies with GDPR and supports EU residents' data rights."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-4xl font-bold mb-3">GDPR Compliance</h1>
        <p className="text-gray-600">
          AI Tees is committed to protecting the personal data of EU and UK
          residents. We process data in line with Articles 6 and 28 of the GDPR.
        </p>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold">Your rights</h2>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
            <li>Access: request a summary of the data we hold about you.</li>
            <li>
              Rectification: update incorrect account or shipping information.
            </li>
            <li>Erasure: request deletion of your account and prompts.</li>
            <li>
              Portability: receive a portable export of your design history.
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold">Data processing</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Orders are processed in the United States. We use EU-based print
            partners for faster delivery in the region. Sub-processors are
            listed in our privacy policy and contractually bound by
            GDPR-standard clauses.
          </p>
        </section>

        <section className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 text-sm text-gray-700">
          <p>
            To exercise any data rights, contact gdpr@aitees.com. We respond
            within 30 days as required by regulation.
          </p>
        </section>
      </div>
    </>
  );
}

export default GDPR;
