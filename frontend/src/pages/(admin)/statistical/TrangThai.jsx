import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const TrangThai = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/hoadons`);
        setOrders(data.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const countOrdersByStatus = (status) => {
    return orders.filter((order) => order.paymentStatus === status).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="spinner-border text-blue-600" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-blue-800">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Trạng thái</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thống kê đơn hàng chờ xử lý */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
          <h2 className="text-xl font-semibold mb-2 text-yellow-800">Chờ xử lý</h2>
          <p className="text-4xl font-bold text-yellow-800">
            {countOrdersByStatus("Chờ xử lý")}
          </p>
        </div>

        {/* Thống kê đơn hàng đã xác nhận */}
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <h2 className="text-xl font-semibold mb-2 text-purple-800">Đã Xác Nhận</h2>
          <p className="text-4xl font-bold text-purple-800">
            {countOrdersByStatus("Đã Xác Nhận")}
          </p>
        </div>

        {/* Thống kê đơn hàng đang giao */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">Đang Giao</h2>
          <p className="text-4xl font-bold text-blue-800">
            {countOrdersByStatus("Đang Giao")}
          </p>
        </div>

        {/* Thống kê đơn hàng giao hàng thất bại */}
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
          <h2 className="text-xl font-semibold mb-2 text-orange-800">Giao Hàng Thất Bại</h2>
          <p className="text-4xl font-bold text-orange-800">
            {countOrdersByStatus("Giao Hàng Thất Bại")}
          </p>
        </div>

        {/* Thống kê đơn hàng giao hàng lại */}
        <div className="bg-pink-50 p-6 rounded-lg border border-pink-100">
          <h2 className="text-xl font-semibold mb-2 text-pink-800">Giao Hàng Lại</h2>
          <p className="text-4xl font-bold text-pink-800">
            {countOrdersByStatus("Giao Hàng Lại")}
          </p>
        </div>

        {/* Thống kê đơn hàng giao hàng thành công */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h2 className="text-xl font-semibold mb-2 text-green-800">Giao Hàng Thành Công</h2>
          <p className="text-4xl font-bold text-green-800">
            {countOrdersByStatus("Giao Hàng Thành Công")}
          </p>
        </div>

        {/* Thống kê đơn hàng hoàn thành */}
        <div className="bg-teal-50 p-6 rounded-lg border border-teal-100">
          <h2 className="text-xl font-semibold mb-2 text-teal-800">Hoàn Thành</h2>
          <p className="text-4xl font-bold text-teal-800">
            {countOrdersByStatus("Hoàn thành")}
          </p>
        </div>

        {/* Thống kê đơn hàng bị huỷ */}
        <div className="bg-red-50 p-6 rounded-lg border border-red-100">
          <h2 className="text-xl font-semibold mb-2 text-red-800">Huỷ Đơn</h2>
          <p className="text-4xl font-bold text-red-800">
            {countOrdersByStatus("Huỷ Đơn")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrangThai;