import React from "react";
import { Helmet } from "react-helmet-async";

function Blog() {
  const posts = [
    {
      id: 1,
      title: "Behind the Prompt: Crafting Wearable AI Art",
      excerpt:
        "We break down three customer prompts and show how our design team balances AI generation with human curation to keep garments production-ready.",
      date: "August 14, 2024",
      readingTime: "6 min read",
      category: "Design Process",
    },
    {
      id: 2,
      title: "Cutting Carbon with On-Demand Manufacturing",
      excerpt:
        "A look at how distributed micro-factories, recycled cotton blends, and smart routing reduce the footprint of every tee that ships.",
      date: "July 29, 2024",
      readingTime: "5 min read",
      category: "Sustainability",
    },
    {
      id: 3,
      title: "Meet the Community: Capsule Collection x FlowState",
      excerpt:
        "FlowState Collective, a digital art community, collaborated with AI Tees to produce a limited run capsule. Here is how the residency unfolded.",
      date: "June 30, 2024",
      readingTime: "7 min read",
      category: "Community Spotlight",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Blog | AI Tees</title>
        <meta
          name="description"
          content="Read about the latest trends in AI fashion, sustainable clothing, and behind-the-scenes looks at our design process."
        />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <p className="text-lg text-gray-600 mb-10 max-w-3xl">
          Stories from inside the studio—featuring prompt strategies,
          responsible production updates, and the creative people shaping the
          future of generative fashion.
        </p>
        <div className="grid gap-8 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                {post.category}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                {post.title}
              </h2>
              <p className="mt-4 text-sm text-gray-700">{post.excerpt}</p>
              <div className="mt-auto pt-6 text-xs text-slate-500">
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.readingTime}</span>
              </div>
            </article>
          ))}
        </div>
        <section className="mt-16 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <h2 className="text-2xl font-semibold text-slate-900">
            Pitch Us a Story
          </h2>
          <p className="mt-3 text-sm text-gray-700">
            Have a workflow, residency, or sustainability breakthrough worth
            sharing? Drop us a line at{" "}
            <a
              className="font-medium text-indigo-600 hover:text-indigo-500"
              href="mailto:press@aitees.studio"
            >
              press@aitees.studio
            </a>{" "}
            and our editorial team will reach out.
          </p>
        </section>
      </div>
    </>
  );
}

export default Blog;
