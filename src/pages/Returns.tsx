import React from "react";
import { Helmet } from "react-helmet-async";
import { Undo2, ShieldCheck } from "lucide-react";

function Returns() {
  return (
    <>
      <Helmet>
        <title>Returns & Exchanges | AI Tees</title>
        <meta
          name="description"
          content="Review the AI Tees return policy and learn how to request an exchange or refund for your order."
        />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-3">Returns & Exchanges</h1>
          <p className="text-lg text-gray-600">
            If your tee prints differently than expected, we’ll make it right.
            The policy below applies to all apparel and poster orders.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <Undo2 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Easy exchange window</h2>
          </div>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Request an exchange within 30 days of delivery.</li>
            <li>Items must be unworn and unwashed—try-ons are perfect.</li>
            <li>Defective prints qualify for free replacements.</li>
            <li>Digital design purchases are non-refundable once delivered.</li>
          </ul>
        </section>

        <section className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 space-y-3">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">How to start a return</h2>
          </div>
          <ol className="list-decimal pl-6 text-gray-600 space-y-2">
            <li>Email support@aitees.com with your order number and photos.</li>
            <li>
              Choose whether you’d like a reprint, store credit, or refund.
            </li>
            <li>We’ll send a prepaid label and next-step instructions.</li>
          </ol>
        </section>
      </div>
    </>
  );
}

export default Returns;
