import React from "react";
import { Helmet } from "react-helmet-async";
import { Truck, Compass, AlertTriangle } from "lucide-react";

function Shipping() {
  return (
    <>
      <Helmet>
        <title>Shipping Information | AI Tees</title>
        <meta
          name="description"
          content="Learn about AI Tees shipping timelines, fulfillment process, and international delivery options."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-3">Shipping Information</h1>
          <p className="text-lg text-gray-600">
            Every AI Tees order is printed on-demand so you always receive a
            fresh design. Here’s how your tee travels from prompt to doorstep.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Truck className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Fulfillment timeline</h2>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Design generation & proof: 0–1 business day</li>
            <li>Printing & quality check: 2–3 business days</li>
            <li>Domestic shipping (US/Canada): 3–5 business days</li>
            <li>
              International shipping: 7–14 business days depending on customs
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Compass className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Delivery options</h2>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>
              Standard: tracked shipping with carrier-estimated delivery windows
            </li>
            <li>
              Express: accelerated production & 2–3 day delivery in major US
              metros
            </li>
            <li>
              Eco: consolidated shipments for reduced packaging and carbon
              impact
            </li>
          </ul>
        </section>

        <section className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-indigo-600 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold">Customs & duties</p>
            <p>
              International customers are responsible for duties and taxes
              assessed by their local customs office. We include the correct HS
              codes to keep clearance smooth.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default Shipping;
