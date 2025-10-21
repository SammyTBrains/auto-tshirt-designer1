import React from "react";
import { Helmet } from "react-helmet-async";

function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | AI Tees</title>
        <meta
          name="description"
          content="Review the AI Tees terms of service that govern your use of the platform and AI-generated designs."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <header>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-gray-600">
            These terms keep the AI Tees marketplace fair for artists,
            customers, and our team.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold">1. Accounts</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            You are responsible for safeguarding your password and prompt
            history. Notify us immediately if you detect unauthorized access.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold">2. Generated artwork</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Designs generated through AI Tees are licensed for personal and
            commercial apparel sales under our standard usage terms. We prohibit
            hateful or infringing prompts.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold">3. Billing</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Charges are processed at the time of order. Refunds follow our
            published return policy. Prices may change with notice.
          </p>
        </section>
      </div>
    </>
  );
}

export default Terms;
