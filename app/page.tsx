'use client'
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  currentQuantity: number;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stockInForm, setStockInForm] = useState({ productId: "", name: "", quantity: "" });
  const [saleForms, setSaleForms] = useState<{ [key: string]: string }>({});
  const [removalForms, setRemovalForms] = useState<{ [key: string]: string }>({});

  // Fetch products from the API
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Error fetching products. Please try again later.");
      console.error(err);
    }
  };

  // Initial fetch of products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle stock-in form submission
  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { productId, name, quantity } = stockInForm;
    if (!productId || !name || !quantity) {
      setError("All fields are required for adding stock.");
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    try {
      const res = await fetch("/api/stock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, quantity: quantityNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add stock");
      setSuccess("Stock added successfully!");
      setStockInForm({ productId: "", name: "", quantity: "" });
      await fetchProducts(); // Refresh the product list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding stock.");
      console.error(err);
    }
  };

  // Handle sale form submission for a specific product
  const handleSaleSubmit = async (productId: string, e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const quantity = saleForms[productId];
    if (!quantity) {
      setError("Quantity is required for recording a sale.");
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    try {
      const res = await fetch("/api/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: quantityNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record sale");
      setSuccess("Sale recorded successfully!");
      setSaleForms((prev) => ({ ...prev, [productId]: "" }));
      await fetchProducts(); // Refresh the product list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error recording sale.");
      console.error(err);
    }
  };

  // Handle manual removal form submission for a specific product
  const handleRemovalSubmit = async (productId: string, e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const quantity = removalForms[productId];
    if (!quantity) {
      setError("Quantity is required for manual removal.");
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    try {
      const res = await fetch("/api/manual-removal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: quantityNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove stock");
      setSuccess("Stock removed successfully!");
      setRemovalForms((prev) => ({ ...prev, [productId]: "" }));
      await fetchProducts(); // Refresh the product list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing stock.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Inventory Dashboard</h1>

      {/* Stock-In Form */}
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Product / Stock-In</h2>
        <form onSubmit={handleStockInSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Product ID</label>
            <input
              type="text"
              value={stockInForm.productId}
              onChange={(e) => setStockInForm({ ...stockInForm, productId: e.target.value })}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., prod1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Product Name</label>
            <input
              type="text"
              value={stockInForm.name}
              onChange={(e) => setStockInForm({ ...stockInForm, name: e.target.value })}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Rice"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Quantity</label>
            <input
              type="number"
              value={stockInForm.quantity}
              onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50"
              min="1"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Add Stock
          </button>
        </form>
      </div>

      {/* Feedback Messages */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Product List */}
      {products.length === 0 ? (
        <p className="text-gray-600">No products available.</p>
      ) : (
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record Sale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manual Removal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.currentQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <form onSubmit={(e) => handleSaleSubmit(product.id, e)} className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={saleForms[product.id] || ""}
                        onChange={(e) =>
                          setSaleForms((prev) => ({ ...prev, [product.id]: e.target.value }))
                        }
                        className="p-1 w-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Qty"
                        min="1"
                      />
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200"
                      >
                        Sell
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <form onSubmit={(e) => handleRemovalSubmit(product.id, e)} className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={removalForms[product.id] || ""}
                        onChange={(e) =>
                          setRemovalForms((prev) => ({ ...prev, [product.id]: e.target.value }))
                        }
                        className="p-1 w-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Qty"
                        min="1"
                      />
                      <button
                        type="submit"
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                      >
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}