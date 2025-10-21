import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Shirt, Search } from "lucide-react";
import { useCart } from "../context/CartContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useCart();

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
  }, [location]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button type="submit" className="sr-only">
                Submit search
              </button>
            </form>

            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-indigo-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button type="submit" className="sr-only">
                Submit search
              </button>
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
