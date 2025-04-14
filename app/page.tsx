'use client'
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Product, Store, StockMovement } from "@/app/lib/types";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stockInForm, setStockInForm] = useState({ productId: "", name: "", quantity: "" });
  const [saleForms, setSaleForms] = useState<{ [key: string]: string }>({});
  const [removalForms, setRemovalForms] = useState<{ [key: string]: string }>({});
  const [newStoreName, setNewStoreName] = useState<string>("");

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });

  // Fetch stores for the authenticated user
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchStores = async () => {
      try {
        const res = await fetch("/api/stores");
        if (!res.ok) throw new Error("Failed to fetch stores");
        const data = await res.json();
        setStores(data);
        if (data.length > 0) {
          setSelectedStoreId(data[0].id); // Select the first store by default
        }
      } catch (err) {
        setError("Error fetching stores. Please try again later.");
        console.error(err);
      }
    };

    fetchStores();
  }, [status, router]);

  // Fetch products for the selected store
  useEffect(() => {
    if (!selectedStoreId) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?storeId=${selectedStoreId}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError("Error fetching products. Please try again later.");
        console.error(err);
      }
    };

    fetchProducts();
  }, [selectedStoreId]);

  // fetch stock movements when store or date range changes
  useEffect(() => {
    if (!selectedStoreId) return;

    const fetchStockMovements = async () => {
      try {
        const params = new URLSearchParams();
        params.append("storeId", selectedStoreId);
        if (dateRange.startDate) params.append("startDate", dateRange.startDate);
        if (dateRange.endDate) params.append("endDate", dateRange.endDate);

        const res = await fetch(`/api/reports/stock-movements?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch stock movements");
        const data = await res.json();
        setStockMovements(data);
      } catch (err) {
        setError("Error fetching stock movements. Please try again later.");
        console.error(err);
      }
    };

    fetchStockMovements();
  }, [selectedStoreId, dateRange]);

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) {
      setError("Please select a store.");
      return;
    }

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
        body: JSON.stringify({ productId, name, quantity: quantityNum, storeId: selectedStoreId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add stock");
      setSuccess("Stock added successfully!");
      setStockInForm({ productId: "", name: "", quantity: "" });
      const updatedProducts = await fetch(`/api/products?storeId=${selectedStoreId}`).then((res) =>
        res.json()
      );
      setProducts(updatedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding stock.");
      console.error(err);
    }
  };

  const handleSaleSubmit = async (productId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) {
      setError("Please select a store.");
      return;
    }

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
        body: JSON.stringify({ productId, quantity: quantityNum, storeId: selectedStoreId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to record sale");
      setSuccess("Sale recorded successfully!");
      setSaleForms((prev) => ({ ...prev, [productId]: "" }));
      const updatedProducts = await fetch(`/api/products?storeId=${selectedStoreId}`).then((res) =>
        res.json()
      );
      setProducts(updatedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error recording sale.");
      console.error(err);
    }
  };

  const handleRemovalSubmit = async (productId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) {
      setError("Please select a store.");
      return;
    }

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
        body: JSON.stringify({ productId, quantity: quantityNum, storeId: selectedStoreId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove stock");
      setSuccess("Stock removed successfully!");
      setRemovalForms((prev) => ({ ...prev, [productId]: "" }));
      const updatedProducts = await fetch(`/api/products?storeId=${selectedStoreId}`).then((res) =>
        res.json()
      );
      setProducts(updatedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing stock.");
      console.error(err);
    }
  };

  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setDateRange({
      startDate: start ? new Date(start).toISOString() : null,
      endDate: end ? new Date(end).toISOString() : null,
    });
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      setError("Store name is required.");
      return;
    }
  
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStoreName }),
      });
      if (!res.ok) throw new Error("Failed to create store");
      setSuccess("Store created successfully!");
      setNewStoreName("");
      // Refetch stores after creation
      const storesRes = await fetch("/api/stores");
      if (!storesRes.ok) throw new Error("Failed to fetch stores");
      const updatedStores = await storesRes.json();
      setStores(updatedStores);
      if (updatedStores.length > 0) {
        setSelectedStoreId(updatedStores[0].id);
      }
    } catch (err) {
      setError("Error creating store. Please try again later.");
      console.error(err);
    }
  };

  if (status === "loading") {
    return <div className="flex min-h-screen justify-center items-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
        {session && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {session.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Store Selection */}
      {stores.length > 0 ? (
        <div className="w-full max-w-2xl mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Select Store</label>
          <select
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="w-full max-w-2xl mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Add a New Store</h2>
          <form onSubmit={handleAddStore} className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">Store Name</label>
              <input
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Main Store"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Create Store
            </button>
          </form>
        </div>
      )}

      {/* Stock-In Form */}
      {selectedStoreId && (
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
                placeholder="e.g., 10"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Add Stock
            </button>
          </form>
          {error && <p className="mt-4 text-red-500">{error}</p>}
          {success && <p className="mt-4 text-green-500">{success}</p>}
        </div>
      )}

      {/* Product List */}
      {selectedStoreId && products.length > 0 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Products</h2>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Product ID</th>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-center">Quantity</th>
                  <th className="py-3 px-6 text-center">Record Sale</th>
                  <th className="py-3 px-6 text-center">Manual Removal</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{product.id}</td>
                    <td className="py-3 px-6 text-left">{product.name}</td>
                    <td className="py-3 px-6 text-center">
                      <span
                        className={
                          product.currentQuantity < 10 ? "text-red-500 font-bold" : ""
                        }
                      >
                        {product.currentQuantity}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <form onSubmit={(e) => handleSaleSubmit(product.id, e)}>
                        <input
                          type="number"
                          value={saleForms[product.id] || ""}
                          onChange={(e) =>
                            setSaleForms({ ...saleForms, [product.id]: e.target.value })
                          }
                          className="p-1 border rounded-md w-20 mr-2"
                          placeholder="Qty"
                        />
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                        >
                          Sell
                        </button>
                      </form>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <form onSubmit={(e) => handleRemovalSubmit(product.id, e)}>
                        <input
                          type="number"
                          value={removalForms[product.id] || ""}
                          onChange={(e) =>
                            setRemovalForms({
                              ...removalForms,
                              [product.id]: e.target.value,
                            })
                          }
                          className="p-1 border rounded-md w-20 mr-2"
                          placeholder="Qty"
                        />
                        <button
                          type="submit"
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
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
        </div>
      )}

      {/* Stock Movement Report */}
      {selectedStoreId && (
        <div className="w-full max-w-4xl mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Stock Movement Report</h2>
          <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <div className="flex space-x-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  onChange={(e) =>
                    handleDateRangeChange(e.target.value, dateRange.endDate)
                  }
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  onChange={(e) =>
                    handleDateRangeChange(dateRange.startDate, e.target.value)
                  }
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          {stockMovements.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Product</th>
                    <th className="py-3 px-6 text-left">Type</th>
                    <th className="py-3 px-6 text-center">Quantity</th>
                    <th className="py-3 px-6 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {stockMovements.map((movement) => (
                    <tr
                      key={movement.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-6 text-left">{movement.product.name}</td>
                      <td className="py-3 px-6 text-left">{movement.type}</td>
                      <td className="py-3 px-6 text-center">{movement.quantity}</td>
                      <td className="py-3 px-6 text-left">
                        {new Date(movement.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No stock movements found for this store.</p>
          )}
        </div>
      )}
    </div>
  );
}