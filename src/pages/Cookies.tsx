import React from "react";
import { Helmet } from "react-helmet-async";

function Cookies() {
  return (
    <>
      <Helmet>
        <title>Cookie Policy | AI Tees</title>
        <meta
          name="description"
          content="Understand how AI Tees uses cookies and tracking technologies."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-4xl font-bold mb-3">Cookie Policy</h1>
        <p className="text-gray-600">
          Cookies help us provide a smoother design experience. This policy
          outlines what cookies we use and how you can manage them.
        </p>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold">Essential cookies</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Required for account authentication, cart persistence, and security
            protections. You cannot opt out of these cookies.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold">Analytics cookies</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Used to understand which prompts and categories attract the most
            interest. Analytics cookies are anonymized and optional—you can
            disable them in the banner.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-3">
          <h2 className="text-xl font-semibold">Managing preferences</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Update your cookie settings anytime through the “Cookie Preferences”
            link in the footer. Clearing cookies may sign you out or empty your
            cart.
          </p>
        </section>
      </div>
    </>
  );
}

export default Cookies;
