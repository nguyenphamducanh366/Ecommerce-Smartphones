import React, { useEffect, useState } from "react";
import { fetchProducts, deleteProducts, updateProductStatus } from "../../../service/api";
import {
  message,
  Table,
  Button,
  Popconfirm,
  Input,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Spin,
  Tooltip,
  Modal,
  Checkbox,
} from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import queryString from "query-string";
import { PlusOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import Socket from "../../(website)/socket/Socket";

const { Option } = Select;
const { Title } = Typography;

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reloadTimer, setReloadTimer] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    search = "",
    memory = "",
    status = "",
    brand = "",
  } = queryString.parse(location.search);

  const setupReloadTimer = () => {
    if (reloadTimer) {
      clearTimeout(reloadTimer);
    }
    const timer = setTimeout(() => {
      window.location.reload();
    }, 200); // 200 giây
    setReloadTimer(timer);
  };

  useEffect(() => {
    getProducts();

    Socket.on("inventoryUpdated", ({ productId, quantityField, newQuantity }) => {
      setProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((product) =>
          product._id === productId
            ? { ...product, [quantityField]: newQuantity }
            : product
        );

        setupReloadTimer();
        return updatedProducts.map((product) => checkAndUpdateProductStatus(product));
      });
    });

    return () => {
      Socket.off("inventoryUpdated");
      if (reloadTimer) {
        clearTimeout(reloadTimer);
      }
    };
  }, []);

  useEffect(() => {
    filterProducts(search, memory, status, brand);
  }, [search, memory, status, brand, products]);

  const checkAndUpdateProductStatus = async (product) => {
    const totalQuantity =
      (product.SoLuong1 || 0) +
      (product.SoLuong2 || 0) +
      (product.SoLuong3 || 0) +
      (product.SoLuong4 || 0) +
      (product.SoLuong5 || 0) +
      (product.SoLuong6 || 0);

    let newStatus = product.TrangThai;

    if (totalQuantity === 0 && product.TrangThai !== "Hết hàng") {
      newStatus = "Hết hàng";
      try {
        await updateProductStatus(product._id, { TrangThai: newStatus });
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái sản phẩm:", error);
        return product;
      }

      if (product.TrangThai === "Còn hàng" && newStatus === "Hết hàng") {
        setupReloadTimer();
      }

      return { ...product, TrangThai: newStatus };
    } else if (totalQuantity > 0 && product.TrangThai === "Hết hàng") {
      newStatus = "Còn hàng";
      try {
        await updateProductStatus(product._id, { TrangThai: newStatus });
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái sản phẩm:", error);
        return product;
      }
      return { ...product, TrangThai: newStatus };
    }

    return product;
  };

  const normalizeBrandName = (name) => {
    // Loại bỏ khoảng trắng thừa, chuyển về chữ thường và chuẩn hóa
    const cleanName = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ") // Chuẩn hóa khoảng trắng
      .replace(/điện thoại/gi, "") // Loại bỏ "điện thoại"
      .replace(/[^a-z0-9\s]/g, "") // Loại bỏ ký tự đặc biệt
      .trim();

    // Danh sách các thương hiệu cần nhận diện
    const knownBrands = ["iphone", "samsung", "xiaomi", "oppo", "vivo", "realme", "huawei", "nokia"];
    
    // Tìm thương hiệu khớp trong tên sản phẩm
    for (const brand of knownBrands) {
      if (cleanName.includes(brand)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1); // Viết hoa chữ cái đầu
      }
    }

    // Nếu không tìm thấy thương hiệu nào, trả về phần đầu tiên của tên
    return cleanName.split(" ")[0].charAt(0).toUpperCase() + cleanName.split(" ")[0].slice(1) || "Unknown";
  };

  const getProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      const updatedProducts = await Promise.all(
        data.map(async (product) => {
          return await checkAndUpdateProductStatus(product);
        })
      );

      const reversedData = [...updatedProducts].reverse();
      setProducts(reversedData);
      setFilteredProducts(reversedData);

      const uniqueBrands = [
        ...new Set(data.map((p) => normalizeBrandName(p.TenSP.split("|")[0].trim()))),
      ].sort();
      setBrands(uniqueBrands);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProducts(id);
      message.success("Xóa sản phẩm thành công!");
      window.dispatchEvent(
        new CustomEvent("cartUpdated", { detail: { deletedProductId: id } })
      );
      getProducts();
    } catch (error) {
      message.error("Lỗi khi xóa sản phẩm!");
    }
  };

  const handleFilter = (value) => {
    updateURL({ search: value, memory, status, brand });
  };

  const handleMemoryFilter = (value) => {
    updateURL({ search, memory: value, status, brand });
  };

  const handleStatusFilter = (value) => {
    updateURL({ search, memory, status: value, brand });
  };

  const handleBrandFilter = (value) => {
    updateURL({ search, memory, status, brand: value });
  };

  const updateURL = (params) => {
    const query = queryString.stringify(params);
    navigate(`?${query}`, { replace: true });
  };

  const filterProducts = (search, memory, status, brand) => {
    let filtered = [...products];

    if (search) {
      filtered = filtered.filter((p) =>
        p.TenSP.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (memory) {
      filtered = filtered.filter(
        (p) =>
          p.BoNhoTrong1 === memory ||
          p.BoNhoTrong2 === memory ||
          p.BoNhoTrong3 === memory ||
          p.BoNhoTrong4 === memory ||
          p.BoNhoTrong5 === memory ||
          p.BoNhoTrong6 === memory
      );
    }

    if (status) {
      filtered = filtered.filter((p) => p.TrangThai === status);
    }

    if (brand) {
      filtered = filtered.filter(
        (p) => normalizeBrandName(p.TenSP.split("|")[0].trim()).toLowerCase() === brand.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const showCompareModal = () => {
    if (selectedProducts.length < 2) {
      message.warning("Vui lòng chọn ít nhất 2 sản phẩm để so sánh!");
      return;
    }
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: <Checkbox disabled />,
      key: "select",
      render: (_, record) => (
        <Checkbox
          checked={selectedProducts.includes(record._id)}
          onChange={() => handleSelectProduct(record._id)}
        />
      ),
      width: 50,
    },
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: "Tên Sản Phẩm",
      dataIndex: "TenSP",
      key: "TenSP",
      width: 250,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
      sorter: (a, b) => a.TenSP.localeCompare(b.TenSP),
    },
    {
      title: "Trạng Thái",
      dataIndex: "TrangThai",
      key: "TrangThai",
      render: (status) => (
        <span
          style={{
            color:
              status === "Còn hàng"
                ? "#52c41a"
                : status === "Hết hàng"
                ? "#ff4d4f"
                : "#faad14",
          }}
        >
          {status}
        </span>
      ),
      width: 120,
    },
    {
      title: "Màu Sắc",
      dataIndex: "Mau1",
      key: "Mau1",
      render: (color) => (
        <div
          style={{
            width: 30,
            height: 30,
            backgroundColor: color,
            borderRadius: 5,
            border: "1px solid #ddd",
          }}
        />
      ),
      width: 80,
    },
    {
      title: "Hình Ảnh",
      dataIndex: "HinhAnh1",
      key: "HinhAnh1",
      render: (text) => (
        <img
          src={text}
          alt="Hình ảnh sản phẩm"
          style={{
            width: 50,
            height: 50,
            objectFit: "cover",
            borderRadius: 4,
          }}
        />
      ),
      width: 80,
    },
    {
      title: "Bộ Nhớ 1 / Số Lượng",
      key: "BoNhoTrong1_SoLuong1",
      width: 150,
      render: (_, record) => (
        <span
          style={
            record.BoNhoTrong1 === memory
              ? { fontWeight: "bold", color: "#1890ff" }
              : {}
          }
        >
          {record.BoNhoTrong1
            ? `${record.BoNhoTrong1}/${record.SoLuong1 || 0}`
            : "-"}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 2 / Số Lượng",
      key: "BoNhoTrong2_SoLuong2",
      width: 150,
      render: (_, record) => (
        <span
          style={
            record.BoNhoTrong2 === memory
              ? { fontWeight: "bold", color: "#1890ff" }
              : {}
          }
        >
          {record.BoNhoTrong2
            ? `${record.BoNhoTrong2}/${record.SoLuong2 || 0}`
            : "-"}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 3 / Số Lượng",
      key: "BoNhoTrong3_SoLuong3",
      width: 150,
      render: (_, record) => (
        <span
          style={
            record.BoNhoTrong3 === memory
              ? { fontWeight: "bold", color: "#1890ff" }
              : {}
          }
        >
          {record.BoNhoTrong3
            ? `${record.BoNhoTrong3}/${record.SoLuong3 || 0}`
            : "-"}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 4 / Số Lượng",
      key: "BoNhoTrong4_SoLuong4",
      width: 150,
      render: (_, record) => (
        <span
          style={
            record.BoNhoTrong4 === memory
              ? { fontWeight: "bold", color: "#1890ff" }
              : {}
          }
        >
          {record.BoNhoTrong4
            ? `${record.BoNhoTrong4}/${record.SoLuong4 || 0}`
            : "-"}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 5 / Số Lượng",
      key: "BoNhoTrong5_SoLuong5",
      width: 150,
      render: (_, record) => (
        <span
          style={
            record.BoNhoTrong5 === memory
              ? { fontWeight: "bold", color: "#1890ff" }
              : {}
          }
        >
          {record.BoNhoTrong5
            ? `${record.BoNhoTrong5}/${record.SoLuong5 || 0}`
            : "-"}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 6 / Số Lượng",
      key: "BoNhoTrong6_SoLuong6",
      width: 150,
      render: (_, record) => (
        <span
          style={
            record.BoNhoTrong6 === memory
              ? { fontWeight: "bold", color: "#1890ff" }
              : {}
          }
        >
          {record.BoNhoTrong6
            ? `${record.BoNhoTrong6}/${record.SoLuong6 || 0}`
            : "-"}
        </span>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Link to={`/admin/products/${record._id}`}>
            <Button type="primary" icon={<EyeOutlined />} size="small">
              Xem
            </Button>
          </Link>
          {["Hết hàng", "Ngừng kinh doanh"].includes(record.TrangThai) && (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa sản phẩm này không?"
              onConfirm={() => handleDelete(record._id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
      width: 150,
      fixed: "right",
    },
  ];

  const compareColumns = [
    { title: "Tên Sản Phẩm", dataIndex: "TenSP", key: "TenSP" },
    { title: "Màu 1", dataIndex: "Mau1", key: "Mau1" },
    { title: "Cam Trước", dataIndex: "CamTruoc", key: "CamTruoc" },
    { title: "Cam Sau", dataIndex: "CamSau", key: "CamSau" },
    { title: "CPU", dataIndex: "CPU", key: "CPU" },
    { title: "Hệ Điều Hành", dataIndex: "HDH", key: "HDH" },
    { title: "Màn Hình", dataIndex: "ManHinh", key: "ManHinh" },
    {
      title: "Bộ Nhớ 1 / Giá / Số Lượng",
      key: "BoNhoTrong1_GiaSP1_SoLuong1",
      render: (_, record) => (
        <span>
          {`${record.BoNhoTrong1 || "-"} / ${
            record.GiaSP1 ? record.GiaSP1 + "đ" : "-"
          } / ${record.SoLuong1 || 0}`}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 2 / Giá / Số Lượng",
      key: "BoNhoTrong2_GiaSP2_SoLuong2",
      render: (_, record) => (
        <span>
          {`${record.BoNhoTrong2 || "-"} / ${
            record.GiaSP2 ? record.GiaSP2 + "đ" : "-"
          } / ${record.SoLuong2 || 0}`}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 3 / Giá / Số Lượng",
      key: "BoNhoTrong3_GiaSP3_SoLuong3",
      render: (_, record) => (
        <span>
          {`${record.BoNhoTrong3 || "-"} / ${
            record.GiaSP3 ? record.GiaSP3 + "đ" : "-"
          } / ${record.SoLuong3 || 0}`}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 4 / Giá / Số Lượng",
      key: "BoNhoTrong4_GiaSP4_SoLuong4",
      render: (_, record) => (
        <span>
          {`${record.BoNhoTrong4 || "-"} / ${
            record.GiaSP4 ? record.GiaSP4 + "đ" : "-"
          } / ${record.SoLuong4 || 0}`}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 5 / Giá / Số Lượng",
      key: "BoNhoTrong5_GiaSP5_SoLuong5",
      render: (_, record) => (
        <span>
          {`${record.BoNhoTrong5 || "-"} / ${
            record.GiaSP5 ? record.GiaSP5 + "đ" : "-"
          } / ${record.SoLuong5 || 0}`}
        </span>
      ),
    },
    {
      title: "Bộ Nhớ 6 / Giá / Số Lượng",
      key: "BoNhoTrong6_GiaSP6_SoLuong6",
      render: (_, record) => (
        <span>
          {`${record.BoNhoTrong6 || "-"} / ${
            record.GiaSP6 ? record.GiaSP6 + "đ" : "-"
          } / ${record.SoLuong6 || 0}`}
        </span>
      ),
    },
  ];

  const compareData = selectedProducts.map((id) =>
    products.find((p) => p._id === id)
  );

  return (
    <div style={{ padding: "24px", background: "#f0f2f5" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Danh Sách Sản Phẩm
          </Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              onClick={showCompareModal}
              disabled={selectedProducts.length < 2}
            >
              So Sánh Sản Phẩm
            </Button>
            <Link to="/admin/products/add">
              <Button type="primary" icon={<PlusOutlined />}>
                Thêm Sản Phẩm
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Nhập tên sản phẩm..."
              value={search}
              onChange={(e) => handleFilter(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc theo thương hiệu"
              value={brand || undefined}
              onChange={handleBrandFilter}
              allowClear
              style={{ width: "100%" }}
            >
              {brands.map((b) => (
                <Option key={b} value={b}>
                  {b}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc theo bộ nhớ"
              value={memory || undefined}
              onChange={handleMemoryFilter}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="32GB">32GB</Option>
              <Option value="64GB">64GB</Option>
              <Option value="128GB">128GB</Option>
              <Option value="256GB">256GB</Option>
              <Option value="512GB">512GB</Option>
              <Option value="1TB">1TB</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              value={status || undefined}
              onChange={handleStatusFilter}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="Còn hàng">Còn hàng</Option>
              <Option value="Hết hàng">Hết hàng</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Table
        dataSource={filteredProducts}
        columns={columns}
        rowKey="_id"
        loading={{
          spinning: loading,
          indicator: <Spin size="large" />,
        }}
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 2000 }}
      />

      <Modal
        title="So Sánh Sản Phẩm"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1200}
      >
        <Table
          dataSource={compareData}
          columns={compareColumns}
          rowKey="_id"
          pagination={false}
          bordered
          scroll={{ x: 1000 }}
        />
      </Modal>
    </div>
  );
};

export default ProductsList;