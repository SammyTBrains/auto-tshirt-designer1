import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Shirt, Search, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { products } from "../data/products";
import designs, { DesignPreview } from "../data/designs";

type Suggestion = {
  id: string;
  label: string;
  description: string;
  badge: string;
  href: string;
  kind: "product" | "design";
};

const matchDesign = (design: DesignPreview, query: string) => {
  const lowerQuery = query.toLowerCase();
  return (
    design.title.toLowerCase().includes(lowerQuery) ||
    design.description.toLowerCase().includes(lowerQuery) ||
    design.category.toLowerCase().includes(lowerQuery) ||
    design.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
    design.prompt.toLowerCase().includes(lowerQuery)
  );
};

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionFocus, setSuggestionFocus] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useCart();
  const { user, isAuthenticated } = useAuth();

  const cartItemCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get("q") ?? "");
    } else {
      setSearchQuery("");
    }
    setSuggestionFocus(false);
  }, [location]);

  const suggestions = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      return [] as Suggestion[];
    }

    const lowerQuery = trimmed.toLowerCase();

    const productSuggestions: Suggestion[] = products
      .filter((product) => {
        const target = [
          product.name,
          product.description,
          product.category,
          ...product.tags,
        ];
        return target.some((field) => field.toLowerCase().includes(lowerQuery));
      })
      .slice(0, 4)
      .map((product) => ({
        id: `product-${product.id}`,
        label: product.name,
        description: product.category,
        badge: "Product",
        href: `/product/${product.id}`,
        kind: "product" as const,
      }));

    const designSuggestions: Suggestion[] = designs
      .filter((design) => matchDesign(design, trimmed))
      .slice(0, 3)
      .map((design) => ({
        id: `design-${design.id}`,
        label: design.title,
        description: design.category,
        badge: "Template",
        href: `/search?q=${encodeURIComponent(design.title)}`,
        kind: "design" as const,
      }));

    return [...productSuggestions, ...designSuggestions].slice(0, 6);
  }, [searchQuery]);

  const shouldShowSuggestions =
    suggestionFocus && suggestions.length > 0 && searchQuery.trim().length >= 2;

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    navigate(suggestion.href);
    setIsOpen(false);
    setSuggestionFocus(false);
    if (suggestion.kind === "product") {
      setSearchQuery("");
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
    setSuggestionFocus(false);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shirt className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900">AI Tees</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-gray-700 hover:text-indigo-600">
              Shop
            </Link>
            <Link
              to="/custom-design"
              className="text-gray-700 hover:text-indigo-600"
            >
              Custom Studio
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-indigo-600">
              Blog
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-indigo-600">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600">
              Contact
            </Link>

            <form className="relative" onSubmit={handleSearchSubmit}>
              <label htmlFor="global-search" className="sr-only">
                Search catalog
              </label>
              <input
                id="global-search"
                type="search"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setSuggestionFocus(true)}
                onBlur={() => setTimeout(() => setSuggestionFocus(false), 120)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button type="submit" className="sr-only">
                Submit search
              </button>
              {shouldShowSuggestions && (
                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
                  <ul className="divide-y divide-slate-100 text-sm">
                    {suggestions.map((suggestion) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleSuggestionSelect(suggestion);
                          }}
                          className="flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left hover:bg-indigo-50 focus:bg-indigo-50"
                        >
                          <span className="mt-0.5 inline-flex h-6 items-center justify-center rounded-full bg-indigo-100 px-2 text-xs font-semibold text-indigo-600">
                            {suggestion.badge}
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold text-slate-900">
                              {suggestion.label}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {suggestion.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-100 px-4 py-2 text-xs text-gray-500">
                    Press Enter to view all results
                  </div>
                </div>
              )}
            </form>

            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-indigo-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user?.username}</span>
                  {user && user.store_credits > 0 && (
                    <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                      {user.store_credits} credits
                    </span>
                  )}
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Admin
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative mr-4">
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-5 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <label htmlFor="mobile-search" className="sr-only">
                Search catalog
              </label>
              <input
                id="mobile-search"
                type="search"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setSuggestionFocus(true)}
                onBlur={() => setTimeout(() => setSuggestionFocus(false), 120)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button type="submit" className="sr-only">
                Submit search
              </button>
              {shouldShowSuggestions && (
                <div className="mt-2 rounded-2xl border border-slate-200 bg-white/95 shadow-md">
                  <ul className="divide-y divide-slate-100 text-sm">
                    {suggestions.map((suggestion) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleSuggestionSelect(suggestion);
                          }}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-indigo-50 focus:bg-indigo-50"
                        >
                          <span className="mt-0.5 inline-flex h-6 items-center justify-center rounded-full bg-indigo-100 px-2 text-xs font-semibold text-indigo-600">
                            {suggestion.badge}
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold text-slate-900">
                              {suggestion.label}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {suggestion.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-100 px-4 py-2 text-xs text-gray-500">
                    Press Enter to view all results
                  </div>
                </div>
              )}
            </form>
            <div className="space-y-1">
              <Link
                to="/shop"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600"
              >
                Shop
              </Link>
              <Link
                to="/custom-design"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600"
              >
                Custom Studio
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600"
              >
                Blog
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
