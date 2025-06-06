import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducts } from "../../../service/api";
import {
  Card,
  Row,
  Col,
  Button,
  Spin,
  Alert,
  Typography,
  Space,
  Tag,
  Image,
} from "antd";
import {
  LeftOutlined,
  EditOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const ProductsDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState({
    memory: "",
    price: 0,
    quantity: 0,
  });

  useEffect(() => {
    setLoading(true);
    getProducts(id)
      .then((response) => {
        const productData = response.data.data;
        console.log("Dữ liệu sản phẩm:", productData); // Debug
        setProduct(productData);

        if (productData.BoNhoTrong1) {
          setSelectedMemory({
            memory: productData.BoNhoTrong1,
            price: productData.GiaSP1,
            quantity: productData.SoLuong1,
          });
        }

        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải chi tiết sản phẩm.");
        setLoading(false);
      });
  }, [id]);

  const handleMemorySelection = (memoryKey) => {
    const memory = product[memoryKey];
    const memoryIndex = memoryKey.slice(-1);

    setSelectedMemory({
      memory: memory,
      price: product[`GiaSP${memoryIndex}`],
      quantity: product[`SoLuong${memoryIndex}`],
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <Text style={{ marginTop: 16, display: "block" }}>Đang tải dữ liệu...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: "20px auto", maxWidth: 600 }}
      />
    );
  }

  if (!product) {
    return (
      <Alert
        message="Cảnh báo"
        description="Không tìm thấy sản phẩm."
        type="warning"
        showIcon
        style={{ margin: "20px auto", maxWidth: 600 }}
      />
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f0f2f5" }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Chi Tiết Sản Phẩm
          </Title>
        </Col>
        <Col>
          <Space>
            <Link to="/admin/products">
              <Button type="default" icon={<LeftOutlined />}>
                Quay lại
              </Button>
            </Link>
            <Link to={`/admin/products/edit/${id}`}>
              <Button type="primary" icon={<EditOutlined />}>
                Chỉnh sửa
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>

      {/* Thông Tin Cơ Bản và Phiên Bản Sản Phẩm nằm ngang */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Thông Tin Cơ Bản */}
        <Col xs={24} lg={12}>
          <Card
            title={<Text strong>Thông Tin Cơ Bản</Text>}
            headStyle={{ background: "#1890ff", color: "#fff" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text strong>Mã Sản Phẩm: </Text>
                <Text>{product.MaSP}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Tên Sản Phẩm: </Text>
                <Text>{product.TenSP}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Tên Thương Hiệu: </Text>
                <Text>{product.TenTH}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Màn Hình: </Text>
                <Text>{product.ManHinh || "Chưa có thông tin"}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Pin: </Text>
                <Text>{product.LoaiPin}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Hệ Điều Hành: </Text>
                <Text>{product.HDH}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Camera Sau: </Text>
                <Text>{product.CamSau}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Camera Trước: </Text>
                <Text>{product.CamTruoc}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>CPU: </Text>
                <Text>{product.CPU || "Chưa có thông tin"}</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Trạng Thái: </Text>
                <Tag color={product.TrangThai === "Còn hàng" ? "green" : "red"}>
                  {product.TrangThai}
                </Tag>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Phiên Bản Sản Phẩm */}
        <Col xs={24} lg={12}>
          <Card
            title={<Text strong>Phiên Bản Sản Phẩm</Text>}
            headStyle={{ background: "#13c2c2", color: "#fff" }}
          >
            <Row gutter={[16, 16]}>
              {/* Bộ Nhớ Trong */}
              <Col xs={24} md={12}>
                <Text strong>Bộ Nhớ Trong:</Text>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    {[
                      "BoNhoTrong1",
                      "BoNhoTrong2",
                      "BoNhoTrong3",
                      "BoNhoTrong4",
                      "BoNhoTrong5",
                      "BoNhoTrong6",
                    ].map((key, index) =>
                      product[key] && product[key] !== "Không có" ? (
                        <Button
                          key={index}
                          type={
                            selectedMemory.memory === product[key]
                              ? "primary"
                              : "default"
                          }
                          onClick={() => handleMemorySelection(key)}
                        >
                          {product[key]}
                        </Button>
                      ) : null
                    )}
                  </Space>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Text strong>Số Lượng: </Text>
                  <Text>{selectedMemory.quantity}</Text>
                </div>
                <div>
                  <Text strong>Giá: </Text>
                  <Text type="danger">{formatCurrency(selectedMemory.price)}</Text>
                </div>
              </Col>

              {/* Màu Sắc */}
              <Col xs={24} md={12}>
                <Text strong>Màu Sắc:</Text>
                <div style={{ marginTop: 8 }}>
                  <Space direction="vertical">
                    {product.Mau1 && (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            backgroundColor: product.Mau1,
                            borderRadius: 5,
                            border: "1px solid #d9d9d9",
                            marginRight: 8,
                            transition: "all 0.3s",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.transform = "scale(1.1)")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.transform = "scale(1)")
                          }
                        />
                        <Text>{product.Mau1}</Text>
                      </div>
                    )}
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Hình Ảnh Sản Phẩm */}
      <Card
        title={<Text strong>Hình Ảnh Sản Phẩm</Text>}
        style={{ marginBottom: 24 }}
        headStyle={{ background: "#52c41a", color: "#fff" }}
      >
        <Space wrap>
          {[1, 2, 3, 4, 5, 6].map(
            (index) =>
              product[`HinhAnh${index}`] && (
                <Image
                  key={index}
                  src={product[`HinhAnh${index}`]}
                  alt={product.TenSP}
                  width={150}
                  height={150}
                  style={{
                    objectFit: "cover",
                    borderRadius: 8,
                    transition: "all 0.3s",
                  }}
                  preview
                />
              )
          )}
        </Space>
      </Card>

      {/* Mô Tả Sản Phẩm */}
      <Card
        title={<Text strong>Mô Tả Sản Phẩm</Text>}
        style={{ marginBottom: 24 }}
        headStyle={{ background: "#faad14", color: "#fff" }}
      >
        <Paragraph>{product.MoTa}</Paragraph>
      </Card>
    </div>
  );
};

export default ProductsDetail;