import React from "react";
import { Helmet } from "react-helmet-async";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us | AI Tees</title>
        <meta
          name="description"
          content="Get in touch with the AI Tees team for questions about orders, custom designs, or partnership opportunities."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg text-gray-600 mb-8">
          We love hearing from fellow creators. Drop us a note and our support
          crew will respond within one business day.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-indigo-600 mt-1" />
              <div>
                <h2 className="font-semibold text-gray-900">Email</h2>
                <p className="text-gray-600">support@aitees.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-indigo-600 mt-1" />
              <div>
                <h2 className="font-semibold text-gray-900">Phone</h2>
                <p className="text-gray-600">+1 (555) 482-8842</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-indigo-600 mt-1" />
              <div>
                <h2 className="font-semibold text-gray-900">Studio</h2>
                <p className="text-gray-600">
                  221B Aurora Avenue, Suite 400
                  <br />
                  San Francisco, CA 94110
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Clock className="h-6 w-6 text-indigo-600 mt-1" />
              <div>
                <h2 className="font-semibold text-gray-900">Support Hours</h2>
                <p className="text-gray-600">Monday – Friday, 9am – 6pm PT</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Send a message</h2>
            <p className="text-sm text-gray-600">
              Tell us about your project or question and we’ll get back with
              next steps.
            </p>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="How can we help?"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;
