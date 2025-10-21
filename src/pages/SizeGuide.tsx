import React from "react";
import { Helmet } from "react-helmet-async";

const measurements = [
  { size: "XS", chest: '31" - 33"', length: '27"' },
  { size: "S", chest: '34" - 36"', length: '28"' },
  { size: "M", chest: '37" - 39"', length: '29"' },
  { size: "L", chest: '40" - 42"', length: '30"' },
  { size: "XL", chest: '43" - 45"', length: '31"' },
  { size: "2XL", chest: '46" - 48"', length: '32"' },
  { size: "3XL", chest: '49" - 51"', length: '33"' },
];

function SizeGuide() {
  return (
    <>
      <Helmet>
        <title>Size Guide | AI Tees</title>
        <meta
          name="description"
          content="Find your perfect fit with the AI Tees sizing chart and measurement tips."
        />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header>
          <h1 className="text-4xl font-bold mb-3">Size Guide</h1>
          <p className="text-lg text-gray-600">
            Our tees fit true-to-size with a modern, unisex cut. Use the chart
            below to match your measurements.
          </p>
        </header>

        <div className="overflow-x-auto bg-white shadow-sm rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Chest (inches)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Length (inches)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {measurements.map(({ size, chest, length }) => (
                <tr key={size}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {chest}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold text-indigo-900">Fit tips</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
            <li>Measure your favorite tee laid flat to compare accurately.</li>
            <li>
              Between sizes? Size up for a relaxed fit or down for fitted.
            </li>
            <li>
              Allow 5% shrinkage after the first wash—our tees are
              pre-laundered.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}

export default SizeGuide;
