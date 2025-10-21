import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { SlidersHorizontal } from "lucide-react";
import FilterSidebar from "../components/FilterSidebar";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

const categoryOptions = Array.from(
  new Set(products.map((product) => product.category))
).sort();
const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL"];
const sizeOptions = Array.from(
  new Set(products.flatMap((product) => product.sizes))
).sort((a, b) => {
  const aIndex = sizeOrder.indexOf(a);
  const bIndex = sizeOrder.indexOf(b);

  if (aIndex === -1 && bIndex === -1) {
    return a.localeCompare(b);
  }

  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  return aIndex - bIndex;
});
const colorOptions = Array.from(
  new Set(products.flatMap((product) => product.colors))
).sort((a, b) => a.localeCompare(b));

function Shop() {
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter((product) => {
    const inPriceRange = priceRange
      ? product.price >= priceRange[0] && product.price <= priceRange[1]
      : true;

    const matchesSize =
      selectedSizes.length === 0 ||
      selectedSizes.some((size) => product.sizes.includes(size));

    const matchesColor =
      selectedColors.length === 0 ||
      selectedColors.some((color) => product.colors.includes(color));

    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;

    return inPriceRange && matchesSize && matchesColor && matchesCategory;
  });

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((item) => item !== color)
        : [...prev, color]
    );
  };

  const handleResetFilters = () => {
    setPriceRange(null);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedCategory(null);
  };

  return (
    <>
      <Helmet>
        <title>Shop AI-Generated T-Shirts | AI Tees</title>
        <meta
          name="description"
          content="Browse our collection of unique AI-generated t-shirt designs. Find the perfect blend of art and technology in our comfortable, high-quality apparel."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Button */}
        <button
          className="md:hidden flex items-center space-x-2 mb-4 text-gray-600 hover:text-indigo-600"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-5 w-5" />
          <span>Filters</span>
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} md:block`}>
            <FilterSidebar
              selectedPriceRange={priceRange}
              onPriceChange={setPriceRange}
              selectedSizes={selectedSizes}
              onSizeToggle={handleSizeToggle}
              sizeOptions={sizeOptions}
              selectedColors={selectedColors}
              onColorToggle={handleColorToggle}
              colorOptions={colorOptions}
              selectedCategory={selectedCategory}
              categories={categoryOptions}
              onCategoryChange={setSelectedCategory}
              onReset={handleResetFilters}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No designs match those filters yet. Try adjusting your
                selection.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Shop;
