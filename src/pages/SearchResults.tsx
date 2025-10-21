import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import designs, { DesignPreview } from "../data/designs";

function matchesDesign(design: DesignPreview, query: string) {
  const lowerQuery = query.toLowerCase();
  return (
    design.title.toLowerCase().includes(lowerQuery) ||
    design.description.toLowerCase().includes(lowerQuery) ||
    design.category.toLowerCase().includes(lowerQuery) ||
    design.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
    design.prompt.toLowerCase().includes(lowerQuery)
  );
}

const SearchResults: React.FC = () => {
  const [params] = useSearchParams();
  const rawQuery = params.get("q") ?? "";
  const query = rawQuery.trim();

  const productMatches = useMemo(() => {
    if (!query) {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    return products.filter((product) => {
      const targetFields = [
        product.name,
        product.description,
        product.category,
        ...product.tags,
      ];
      return targetFields.some((field) =>
        field.toLowerCase().includes(lowerQuery)
      );
    });
  }, [query]);

  const designMatches = useMemo(() => {
    if (!query) {
      return [];
    }
    return designs.filter((design) => matchesDesign(design, query));
  }, [query]);

  const resultCount = productMatches.length + designMatches.length;

  return (
    <>
      <Helmet>
        <title>
          {query ? `Search "${query}" | AI Tees` : "Search | AI Tees"}
        </title>
        <meta
          name="description"
          content="Discover AI-generated t-shirts and design templates tailored to your search."
        />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Search</h1>
            {query ? (
              <p className="text-gray-600">
                Showing {resultCount} result{resultCount === 1 ? "" : "s"} for
                <span className="font-medium text-slate-900"> "{query}"</span>
              </p>
            ) : (
              <p className="text-gray-600">
                Start typing in the search bar to explore products and design
                templates.
              </p>
            )}
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:border-indigo-400 hover:text-indigo-500"
          >
            Back to shop
          </Link>
        </div>

        {!query && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-gray-600">
            Try keywords like "nebula", "retro", or "biotech" to see matching
            apparel and prompts.
          </div>
        )}

        {query && resultCount === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              No matches yet
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Adjust your wording or browse the{" "}
              <Link
                className="text-indigo-600 hover:text-indigo-500"
                to="/shop"
              >
                full catalog
              </Link>{" "}
              to discover something new.
            </p>
          </div>
        )}

        {productMatches.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                Products
              </h2>
              <span className="text-sm text-gray-500">
                {productMatches.length} result
                {productMatches.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productMatches.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {designMatches.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                Design Templates
              </h2>
              <span className="text-sm text-gray-500">
                {designMatches.length} result
                {designMatches.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {designMatches.map((design) => (
                <DesignSnippet key={design.id} design={design} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

function DesignSnippet({ design }: { design: DesignPreview }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img
          src={design.imageUrl}
          alt={design.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
          <span>{design.category}</span>
          <span>{design.releaseDate}</span>
        </div>
        <h3 className="mt-3 text-xl font-semibold text-slate-900">
          {design.title}
        </h3>
        <p className="mt-2 text-sm text-gray-600">{design.description}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-indigo-600">
          {design.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-3 py-1 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-4 text-sm text-gray-500">
          Prompt preview: <span className="italic">{design.prompt}</span>
        </div>
        <Link
          to="/custom-design"
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Open in Custom Studio
        </Link>
      </div>
    </article>
  );
}

export default SearchResults;
