import React from "react";
import { Helmet } from "react-helmet-async";

function About() {
  return (
    <>
      <Helmet>
        <title>About Us | AI Tees</title>
        <meta
          name="description"
          content="Learn about our mission to revolutionize fashion with AI-generated t-shirt designs. Discover how we blend technology and creativity."
        />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>
        <section className="grid gap-10 lg:grid-cols-3 lg:gap-16">
          <article className="lg:col-span-2 space-y-6">
            <p className="text-lg text-gray-700">
              AI Tees is a collective of designers, engineers, and storytellers
              who believe style should be playful, personal, and planet
              friendly. We build tools that allow anyone to co-create garments
              with generative AI, moving ideas from prompt to fabric in minutes
              rather than months.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">What Guides Us</h2>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span className="font-medium text-slate-900">
                    Creativity without gatekeepers.
                  </span>{" "}
                  Every feature is designed so emerging artists and first-time
                  creators can prototype confidently.
                </li>
                <li>
                  <span className="font-medium text-slate-900">
                    Responsible AI.
                  </span>{" "}
                  We curate training data, document model changes, and keep
                  humans in the loop before anything ships to production.
                </li>
                <li>
                  <span className="font-medium text-slate-900">
                    Climate-conscious manufacturing.
                  </span>{" "}
                  Designs are routed to low-waste on-demand printers and we
                  publish lifecycle data for every drop.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">
                How the Platform Works
              </h2>
              <ol className="space-y-3 text-gray-700 list-decimal list-inside">
                <li>
                  Describe your idea with natural language prompts or remix an
                  existing concept.
                </li>
                <li>
                  Fine-tune colors, placement, transparency, and fabric previews
                  in the live editor.
                </li>
                <li>
                  Send the final design to our verified production partners and
                  track fulfillment in real time.
                </li>
              </ol>
            </div>
          </article>
          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Fast Facts</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="uppercase tracking-wide text-slate-300">
                    Founded
                  </dt>
                  <dd className="font-medium">2023</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="uppercase tracking-wide text-slate-300">
                    Designs Generated
                  </dt>
                  <dd className="font-medium">48k+</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="uppercase tracking-wide text-slate-300">
                    Manufacturing Partners
                  </dt>
                  <dd className="font-medium">12</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="uppercase tracking-wide text-slate-300">
                    Offset per Tee
                  </dt>
                  <dd className="font-medium">2.4 kg CO₂</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Leadership</h2>
              <ul className="space-y-4 text-sm text-gray-700">
                <li>
                  <p className="font-medium text-slate-900">
                    Mira Patel — CEO &amp; Co-founder
                  </p>
                  <p>
                    Former creative technologist at interactive studios;
                    advocates for equitable AI access.
                  </p>
                </li>
                <li>
                  <p className="font-medium text-slate-900">
                    Darius Holt — CTO
                  </p>
                  <p>
                    Built large-scale diffusion systems for digital fashion
                    houses before joining AI Tees.
                  </p>
                </li>
                <li>
                  <p className="font-medium text-slate-900">
                    Helena Cruz — Head of Sustainability
                  </p>
                  <p>
                    Leads supplier audits and circularity initiatives to meet
                    our zero-inventory pledge.
                  </p>
                </li>
              </ul>
            </div>
          </aside>
        </section>
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Where We Are Headed</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Q4 2024
              </p>
              <p className="mt-2 text-lg font-medium text-slate-900">
                Creator Revenue Splits
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Launching transparent analytics so collaborators can track
                royalties in real time.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Q1 2025
              </p>
              <p className="mt-2 text-lg font-medium text-slate-900">
                Material Experimentation Lab
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Partnering with textile innovators to test algae-based dyes and
                recyclable thread blends.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Q2 2025
              </p>
              <p className="mt-2 text-lg font-medium text-slate-900">
                Open Design Residency
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Welcoming artists, educators, and nonprofits to co-build
                responsibly sourced capsule collections.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default About;
