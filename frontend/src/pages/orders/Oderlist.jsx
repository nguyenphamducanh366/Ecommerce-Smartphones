import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { message, Select, DatePicker, Pagination } from "antd";
import { fetchOrders } from "../../../service/api";
import Socket from "../../(website)/socket/Socket";

const { Option } = Select;

// Hàm định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "Không có";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

// Hàm chuẩn hóa chuỗi trạng thái
const normalizeString = (str) => {
  if (!str) return "";
  return str.trim().normalize("NFC").replace(/\s+/g, " ").toLowerCase();
};

const OrderList = () => {
  const [hoaDons, setHoaDons] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [hiddenOrders, setHiddenOrders] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortTotal, setSortTotal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const location = useLocation();

  // Lấy danh sách hóa đơn
  useEffect(() => {
    const getHoaDons = async () => {
      try {
        const response = await fetchOrders();
        const storedHiddenOrders = JSON.parse(localStorage.getItem("hiddenOrders")) || [];
        setHiddenOrders(storedHiddenOrders);

        const sortedOrders = (response.data.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setAllOrders(sortedOrders);
        applyFilters(sortedOrders, storedHiddenOrders);
      } catch (error) {
        console.error("Lỗi khi tải danh sách hóa đơn:", error);
        message.error("Lỗi khi tải danh sách hóa đơn!");
      }
    };

    getHoaDons();
  }, [location.key]);

  // Lắng nghe sự kiện từ Socket.IO
  useEffect(() => {
    Socket.on("orderCreated", (newOrder) => {
      console.log("OrderList nhận đơn hàng mới:", newOrder);
      setAllOrders((prevOrders) => {
        if (prevOrders.some((order) => order._id === newOrder._id)) {
          return prevOrders;
        }
        return [newOrder, ...prevOrders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    });

    Socket.on("orderStatusUpdated", (data) => {
      setAllOrders((prevOrders) =>
        prevOrders
          .map((order) =>
            order._id === data.orderId
              ? {
                  ...order,
                  paymentStatus: data.paymentStatus,
                  cancelledBy: data.cancelledBy,
                  cancellationDate: data.cancellationDate,
                  FeedBack: data.FeedBack,
                }
              : order
          )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    });

    return () => {
      Socket.off("orderCreated");
      Socket.off("orderStatusUpdated");
    };
  }, []);

  // Hàm áp dụng bộ lọc
  const applyFilters = (orders, hiddenOrders) => {
    let filtered = [...orders];

    filtered = showHidden
      ? filtered.filter((order) => hiddenOrders.includes(order._id))
      : filtered.filter((order) => !hiddenOrders.includes(order._id));

    if (statusFilter) {
      const normalizedStatusFilter = normalizeString(statusFilter);
      filtered = filtered.filter((order) => {
        const normalizedOrderStatus = normalizeString(order.paymentStatus);
        if (normalizedStatusFilter === "đã xác nhận" || normalizedStatusFilter === "xác nhận") {
          return normalizedOrderStatus === "đã xác nhận" || normalizedOrderStatus === "xác nhận";
        }
        return normalizedOrderStatus === normalizedStatusFilter;
      });
    }

    if (dateFilter) {
      filtered = filtered.filter((order) => formatDate(order.createdAt) === dateFilter);
    }

    if (sortTotal === "low-to-high") {
      filtered.sort((a, b) => (a.total || 0) - (b.total || 0));
    } else if (sortTotal === "high-to-low") {
      filtered.sort((a, b) => (b.total || 0) - (a.total || 0));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setHoaDons(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters(allOrders, hiddenOrders);
  }, [statusFilter, dateFilter, sortTotal, allOrders, hiddenOrders, showHidden]);

  const handleHideOrder = (id) => {
    const updatedHiddenOrders = [...hiddenOrders, id];
    setHiddenOrders(updatedHiddenOrders);
    localStorage.setItem("hiddenOrders", JSON.stringify(updatedHiddenOrders));
    applyFilters(allOrders, updatedHiddenOrders);
    message.success("Đã ẩn đơn hàng thành công");
  };

  const handleRestoreOrder = (id) => {
    const updatedHiddenOrders = hiddenOrders.filter((item) => item !== id);
    setHiddenOrders(updatedHiddenOrders);
    localStorage.setItem("hiddenOrders", JSON.stringify(updatedHiddenOrders));
    applyFilters(allOrders, updatedHiddenOrders);
    message.success("Đã khôi phục đơn hàng");
  };

  const paginatedOrders = hoaDons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <h1 className="h3 mb-2 text-gray-800">Danh sách hóa đơn</h1>
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Database hóa đơn</h6>
          <button
            className="btn btn-secondary"
            onClick={() => setShowHidden(!showHidden)}
          >
            {showHidden ? "🔙 Quay lại danh sách chính" : "👻 Xem đơn hàng đã ẩn"}
          </button>
        </div>

        <div className="card-body">
          <div className="mb-4 d-flex gap-4">
            <div>
              <label className="mr-2">Lọc theo trạng thái:</label>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
                placeholder="Chọn trạng thái"
                allowClear
              >
                <Option value="">Tất cả</Option>
                <Option value="Chờ xử lý">Chờ xử lý</Option>
                <Option value="Đã xác nhận">Đã xác nhận</Option>
                <Option value="Đang giao">Đang giao</Option>
                <Option value="Hoàn thành">Hoàn thành</Option>
                <Option value="Huỷ Đơn">Huỷ Đơn</Option>
                <Option value="Giao Hàng Thành Công">Giao Hàng Thành Công</Option>
                <Option value="Giao Hàng Thất Bại">Giao Hàng Thất Bại</Option>
                <Option value="Giao Hàng Lại">Giao Hàng Lại</Option>
              </Select>
            </div>

            <div>
              <label className="mr-2">Lọc theo ngày:</label>
              <DatePicker
                format="DD/MM/YYYY"
                onChange={(date, dateString) => setDateFilter(dateString)}
                style={{ width: 200 }}
                placeholder="Chọn ngày"
                allowClear
              />
            </div>

            <div>
              <label className="mr-2">Sắp xếp tổng tiền:</label>
              <Select
                value={sortTotal}
                onChange={setSortTotal}
                style={{ width: 200 }}
                placeholder="Chọn sắp xếp"
                allowClear
              >
                <Option value="">Mặc định</Option>
                <Option value="low-to-high">Thấp đến cao</Option>
                <Option value="high-to-low">Cao đến thấp</Option>
              </Select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-bordered">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Ngày tạo</th>
                  <th>Người nhận</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((hoaDon, i) => (
                    <tr key={hoaDon._id}>
                      <td>{(currentPage - 1) * pageSize + i + 1}</td>
                      <td>{formatDate(hoaDon.createdAt)}</td>
                      <td>{hoaDon.shippingInfo?.name || "Không có"}</td>
                      <td>{hoaDon.shippingInfo?.phone || "Không có"}</td>
                      <td>{hoaDon.shippingInfo?.address || "Không có"}</td>
                      <td>
                        {hoaDon.total
                          ? `${hoaDon.total.toLocaleString()} VND`
                          : "Không có"}
                      </td>
                      <td>{hoaDon.paymentStatus || "Không có"}</td>
                      <td>
                        <Link
                          to={`/admin/orders/${hoaDon._id}`}
                          className="btn btn-info ml-2"
                        >
                          👁️ Xem chi tiết
                        </Link>
                        {!showHidden && hoaDon.paymentStatus === "Hoàn thành" && (
                          <button
                            onClick={() => handleHideOrder(hoaDon._id)}
                            className="btn btn-warning ml-2"
                          >
                            🚫 Ẩn đơn hàng
                          </button>
                        )}
                        {showHidden && (
                          <button
                            onClick={() => handleRestoreOrder(hoaDon._id)}
                            className="btn btn-success ml-2"
                          >
                            ♻️ Khôi phục
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      Không có dữ liệu hóa đơn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {hoaDons.length > 0 && (
            <div className="mt-4 d-flex justify-content-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={hoaDons.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;