import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import orderService, { Order } from "../services/orderService";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
} from "lucide-react";

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "paid" || statusLower === "completed") {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (statusLower === "processing" || statusLower === "pending") {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
    if (statusLower === "shipped" || statusLower === "in_transit") {
      return <Truck className="h-5 w-5 text-blue-600" />;
    }
    if (statusLower === "cancelled" || statusLower === "failed") {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return <Package className="h-5 w-5 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "paid" || statusLower === "completed") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (statusLower === "processing" || statusLower === "pending") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    if (statusLower === "shipped" || statusLower === "in_transit") {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (statusLower === "cancelled" || statusLower === "failed") {
      return "bg-red-100 text-red-800 border-red-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Order History | AI Tees</title>
        <meta
          name="description"
          content="View your order history and track shipments"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Order History
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Track your orders and view purchase history
            </p>
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Loader className="h-8 w-8 mx-auto animate-spin text-indigo-600" />
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start shopping to see your orders here
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                Browse Shop
              </button>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id || order.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {order.printify_order_id && (
                          <div className="text-xs text-gray-500">
                            Printify: {order.printify_order_id}
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(
                            order.printify_status || order.status
                          )}`}
                        >
                          {getStatusIcon(order.printify_status || order.status)}
                          <span className="capitalize">
                            {order.printify_status || order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          {item.design_data?.imageUrl && (
                            <div className="flex-shrink-0">
                              <img
                                src={item.design_data.imageUrl}
                                alt={item.product_name}
                                className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.product_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Size: {item.size} • Color: {item.color}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Ship to:</span>{" "}
                          {order.shipping_address.full_name}
                        </p>
                        <p className="text-xs">
                          {order.shipping_address.address_line1},{" "}
                          {order.shipping_address.city},{" "}
                          {order.shipping_address.state}{" "}
                          {order.shipping_address.postal_code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
