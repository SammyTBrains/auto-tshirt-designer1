import React from "react";
import { Sliders } from "lucide-react";

interface FilterSidebarProps {
  selectedPriceRange: [number, number] | null;
  onPriceChange: (range: [number, number] | null) => void;
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  sizeOptions: string[];
  selectedColors: string[];
  onColorToggle: (color: string) => void;
  colorOptions: string[];
  selectedCategory: string | null;
  categories: string[];
  onCategoryChange: (category: string | null) => void;
  onReset: () => void;
}

function FilterSidebar({
  selectedPriceRange,
  onPriceChange,
  selectedSizes,
  onSizeToggle,
  sizeOptions,
  selectedColors,
  onColorToggle,
  colorOptions,
  selectedCategory,
  categories,
  onCategoryChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <div className="w-64 bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-2 mb-6">
        <Sliders className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-sm text-indigo-600 hover:text-indigo-700 mb-6"
      >
        Reset filters
      </button>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Price Range</h3>
        <div>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              name="price"
              className="form-radio text-indigo-600"
              checked={selectedPriceRange === null}
              onChange={() => onPriceChange(null)}
            />
            <span className="ml-2">Any price</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              name="price"
              className="form-radio text-indigo-600"
              checked={
                selectedPriceRange?.[0] === 0 && selectedPriceRange?.[1] === 35
              }
              onChange={() => onPriceChange([0, 35])}
            />
            <span className="ml-2">Under $35</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              name="price"
              className="form-radio text-indigo-600"
              checked={
                selectedPriceRange?.[0] === 35 && selectedPriceRange?.[1] === 40
              }
              onChange={() => onPriceChange([35, 40])}
            />
            <span className="ml-2">$35 - $40</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              className="form-radio text-indigo-600"
              checked={
                selectedPriceRange?.[0] === 40 && selectedPriceRange?.[1] === 60
              }
              onChange={() => onPriceChange([40, 60])}
            />
            <span className="ml-2">$40 - $60</span>
          </label>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={`px-3 py-1 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 ${
              selectedCategory === null
                ? "border-indigo-600 text-indigo-600"
                : "border-gray-300 hover:border-indigo-600 hover:text-indigo-600"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 ${
                selectedCategory === category
                  ? "border-indigo-600 text-indigo-600"
                  : "border-gray-300 hover:border-indigo-600 hover:text-indigo-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => onSizeToggle(size)}
              className={`px-3 py-1 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 ${
                selectedSizes.includes(size)
                  ? "border-indigo-600 text-indigo-600"
                  : "border-gray-300 hover:border-indigo-600 hover:text-indigo-600"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="font-medium mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              type="button"
              key={color}
              onClick={() => onColorToggle(color)}
              className={`px-3 py-1 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 ${
                selectedColors.includes(color)
                  ? "border-indigo-600 text-indigo-600"
                  : "border-gray-300 hover:border-indigo-600 hover:text-indigo-600"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterSidebar;
