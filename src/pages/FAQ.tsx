import React from "react";
import { Helmet } from "react-helmet-async";
import { Sparkles, Bot, Palette, Shirt } from "lucide-react";

const faqs = [
  {
    icon: Sparkles,
    question: "How do AI Tees designs get created?",
    answer:
      "We prompt Stable Diffusion 3.5 with your description plus our curated style guides. Every prompt generates a one-off design that we upscale for printing.",
  },
  {
    icon: Palette,
    question: "Can I tweak colors or placement?",
    answer:
      "Yes—use the Custom Design studio to pick shirt colors, remove backgrounds, and drag the artwork exactly where you want it before checkout.",
  },
  {
    icon: Shirt,
    question: "What garments do you print on?",
    answer:
      "We use premium combed cotton tees (4.3 oz). Sizes range from XS to 3XL and we offer relaxed or fitted cuts depending on the design.",
  },
  {
    icon: Bot,
    question: "Will you release my prompt publicly?",
    answer:
      "Never. Your prompts and generated designs stay private unless you opt into our community gallery.",
  },
];

function FAQ() {
  return (
    <>
      <Helmet>
        <title>FAQ | AI Tees</title>
        <meta
          name="description"
          content="Answers to common questions about AI Tees ordering, design customization, and printing."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header>
          <h1 className="text-4xl font-bold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Quick answers so you can get back to designing. Still curious? Email
            us at support@aitees.com.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map(({ icon: Icon, question, answer }) => (
            <article
              key={question}
              className="bg-white rounded-lg shadow-sm p-6 space-y-3"
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {question}
                </h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

export default FAQ;
