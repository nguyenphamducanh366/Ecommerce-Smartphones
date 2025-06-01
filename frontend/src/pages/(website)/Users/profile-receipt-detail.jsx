import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchOrdersByUserId } from "../../../service/api";

const ProfileReceiptDetails = () => {
  const [order, setOrder] = useState(null); // Changed 'orders' to 'order' for clarity
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ Email: "", id: "" });
  const { id: orderId } = useParams();

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData.id) {
          const response = await fetchOrdersByUserId(userData.id);
          const orders = response.data.data; // Array of orders

          const foundOrder = orders.find((order) => order._id === orderId);

          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            console.error("Order not found in user's orders");
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData.id, orderId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-1/4 bg-white p-4 rounded-lg shadow-md mr-4">
            <div className="flex items-center mb-4">
              <span className="text-black font-semibold">{userData.Email}</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/account-details/${userData.id}`}
                  className="flex items-center gap-2"
                >
                  <i className="fa fa-user mr-2"></i>
                  <span>Thông tin tài khoản</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/account/${userData.id}`}
                  className="flex items-center gap-2"
                >
                  <i className="fa fa-edit mr-2"></i>
                  <span>Update tài khoản</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/profile-receipt/${userData.id}`}
                  className="flex items-center gap-2"
                >
                  <i className="fas fa-money-check mr-2"></i>
                  <span>Thông tin đơn hàng</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/profile-reset-password/${userData.id}`}
                  className="flex items-center gap-2"
                >
                  <i className="fas fa-lock mr-2"></i>
                  <span>Thay đổi mật khẩu</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Container */}
          <div className="w-3/4 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-light mb-6">Chi tiết đơn hàng</h3>
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Thông tin đơn hàng</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã đơn hàng:</p>
                  <p className="font-medium">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng:</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tình trạng:</p>
                  <p className="font-medium">{order.paymentStatus}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">
                Thông tin nhận hàng
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tên khách hàng:</p>
                  <p className="font-medium">{order.shippingInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại:</p>
                  <p className="font-medium">{order.shippingInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ:</p>
                  <p className="font-medium">{order.shippingInfo.address}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Sản phẩm</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border text-left">Sản phẩm</th>
                      <th className="py-2 px-4 border text-left">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products?.map((product, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border">
                          <div className="flex items-center">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 mr-4"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {product.memory} - {product.color}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border">
                          {product.quantity || 1}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Tổng thanh toán</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tổng tiền:</p>
                  <p className="font-medium">
                    {order.total.toLocaleString()}đ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Phương thức thanh toán:
                  </p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Trạng thái thanh toán:
                  </p>
                  <p className="font-medium">{order.checkPayment}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phí vận chuyển:</p>
                  <p className="font-medium">20,000đ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Ngày hoàn thành giao hàng:
                  </p>
                  <p className="font-medium">
                    {order.deliveryDate || "Chưa có"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày hoàn thành thanh toán:</p>
                  <p className="font-medium">
                    {order.transactionDate === '1999-12-31T17:00:00.000Z'
                      ? 'Chưa Có'
                      : order.transactionDate
                      ? new Date(order.transactionDate).toLocaleString()
                      : 'Chưa có'}
                  </p>
              </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng thanh toán:</p>
                  <p className="font-medium">
                    {(order.total + 20000).toLocaleString()}đ
                  </p>
                </div>
              </div>
            </div>
            {order.paymentStatus === "Huỷ Đơn" && (
              <div className="mb-8 p-4 bg-red-50 rounded-lg border border-red-100">
                <h2 className="text-xl font-semibold mb-2 text-red-700">
                  Thông tin hủy đơn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-red-600">Huỷ Bởi:</p>
                    <p className="font-medium text-red-800">
                      {order.cancelledBy?.name}-{order.cancelledBy?.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-600">Thời gian hủy:</p>
                    <p className="font-medium text-red-800">
                      {order.cancellationDate
                        ? new Date(order.cancellationDate).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-red-600">Lý do:</p>
                    <p className="font-medium text-red-800">
                      {order.FeedBack || "Không có lý do cụ thể"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Link
              to={`/profile-receipt/${userData.id}`}
              className="text-blue-500 hover:underline"
            >
              <i className="fas fa-long-arrow-alt-left mr-2"></i> Quay lại danh
              sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileReceiptDetails;