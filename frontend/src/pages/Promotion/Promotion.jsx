import React, { useEffect, useState, forwardRef } from "react";
import { Table, Select, Button, Popconfirm, message } from "antd";
import { fetchPromotion, deletePromotion } from "../../../service/api";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const statusMap = {
  1: "🔴 Đã sử dụng",
  2: "🔵 Đang diễn ra",
};

const formatDate = (dateString) => {
  if (!dateString) return "Không xác định";
  return moment(dateString).format("DD/MM/YYYY");
};

const Promotion = forwardRef((props, ref) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const navigate = useNavigate();

  const getPromotions = async () => {
    try {
      setLoading(true);
      const response = await fetchPromotion();
      setPromotions(response.data?.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  React.useImperativeHandle(ref, () => ({ getPromotions }));

  useEffect(() => {
    getPromotions();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletePromotion(id);
      message.success("Xóa khuyến mãi thành công!");
      getPromotions();
    } catch (error) {
      message.error("Xóa thất bại, thử lại sau!");
    }
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(
      value !== undefined && value !== null ? Number(value) : null
    );
  };

  const handleSortChange = (value) => setSortOrder(value);

  let filteredPromotions =
    selectedStatus !== null
      ? promotions.filter(
          (km) => Number(km.TrangThai) === Number(selectedStatus)
        )
      : promotions;

  if (sortOrder === "newest") {
    filteredPromotions.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (sortOrder === "oldest") {
    filteredPromotions.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  const columns = [
    { title: "Mã KM", dataIndex: "MaKM", key: "MaKM", align: "center" },
    { title: "Tên KM", dataIndex: "TenKM", key: "TenKM", align: "center" },
    {
      title: "Loại KM",
      dataIndex: "LoaiKM",
      key: "LoaiKM",
      align: "center",
      render: (value) =>
        value === "percentage" ? "Giảm theo %" : "Giảm số tiền cố định",
    },
    {
      title: "Giá trị KM",
      dataIndex: "GiaTriKM",
      key: "GiaTriKM",
      align: "center",
      render: (value, record) =>
        record.LoaiKM === "percentage"
          ? `${value}%`
          : `${value.toLocaleString()} VND`,
    },
    {
      title: "Giá trị tối thiểu",
      dataIndex: "GiaTriToiThieu",
      key: "GiaTriToiThieu",
      align: "center",
      render: (value) => `${value?.toLocaleString()} VND`,
    },
    {
      title: "Giảm tối đa",
      dataIndex: "GiamToiDa",
      key: "GiamToiDa",
      align: "center",
      render: (value, record) =>
        record.LoaiKM === "percentage"
          ? value
            ? `${value.toLocaleString()} VND`
            : "Không giới hạn"
          : "Không áp dụng",
    },
    {
      title: "Ngày Bắt Đầu",
      dataIndex: "NgayBD",
      key: "NgayBD",
      align: "center",
      render: formatDate,
    },
    {
      title: "Ngày Kết Thúc",
      dataIndex: "NgayKT",
      key: "NgayKT",
      align: "center",
      render: formatDate,
    },
    {
      title: "Trạng Thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      align: "center",
      render: (value) => statusMap[value] || "⚪ Không xác định",
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (record) => (
        <div>
          {record.TrangThai === 1 ? (
            <Popconfirm
              title="Bạn có chắc muốn xóa khuyến mãi này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Có"
              cancelText="Hủy"
            >
              <Button type="primary" danger>
                Xóa
              </Button>
            </Popconfirm>
          ) : null}
          <Button
            type="primary"
            onClick={() => navigate(`/admin/vouchers/edit/${record._id}`)}
          >
            Sửa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, width: "100%", height: "100vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Danh sách khuyến mãi
      </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <span style={{ marginRight: 10 }}>Lọc theo trạng thái:</span>
            <Select
              placeholder="Chọn trạng thái"
              style={{ width: 200 }}
              onChange={handleStatusChange}
              allowClear
            >
              <Option value={1}>🔴Đã sử dụng</Option>
              <Option value={2}>🔵Đang diễn ra</Option>
            </Select>
          </div>
          <div>
            <span style={{ marginRight: 10 }}>Sắp xếp:</span>
            <Select
              placeholder="Chọn kiểu sắp xếp"
              style={{ width: 150 }}
              onChange={handleSortChange}
              allowClear
            >
              <Option value="newest">Gần nhất</Option>
              <Option value="oldest">Lâu nhất</Option>
            </Select>
          </div>
        </div>
        <Button type="primary" onClick={() => navigate("/admin/vouchers/add")}>
          + Thêm Khuyến Mãi
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredPromotions}
        rowKey={(record) => record._id}
        bordered
        pagination={{ pageSize: 10 }}
        loading={loading}
      />
    </div>
  );
});
Promotion.displayName = "Promotion";

export default Promotion;
