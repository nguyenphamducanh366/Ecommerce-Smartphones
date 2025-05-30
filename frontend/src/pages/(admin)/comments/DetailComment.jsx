import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { message, Card, Descriptions, Typography, Button, Space, Image, Row, Col } from "antd";
import { fetchCommentById, getProducts } from "../../../service/api";

const { Title, Text } = Typography;

const AdminDetailComment = () => {
  const { id } = useParams();
  const [comment, setComment] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const commentResponse = await fetchCommentById(id);
        setComment(commentResponse.data.data);

        if (commentResponse.data.data.MaSP) {
          const productResponse = await getProducts(commentResponse.data.data.MaSP);
          setProduct(productResponse.data.data);
        }
      } catch (error) {
        console.log(error);
        message.error("Lỗi khi lấy dữ liệu");
      }
    })();
  }, [id]);

  if (!comment) return <div style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</div>;

  const images = product
    ? [1, 2, 3, 4, 5, 6]
        .map((index) => product[`HinhAnh${index}`])
        .filter(Boolean)
    : [];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>Chi tiết bình luận</Title>
      <Card
        title={<Text strong style={{ color: "#1890ff", fontSize: "18px" }}>Thông tin chi tiết bình luận</Text>}
        bordered={false}
        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}
      >
        <Descriptions
          bordered
          column={1}
          labelStyle={{ width: "200px", fontWeight: "bold", background: "#fafafa", padding: "12px" }}
          contentStyle={{ padding: "12px" }}
        >
          <Descriptions.Item label="Mã bình luận">
            <Text>{comment._id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mã sản phẩm">
            <Text>{comment.MaSP}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Tên sản phẩm">
            <Text>{product ? product.TenSP : "Đang tải..."}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Text>{comment.Email}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Nội dung">
            <Text>{comment.NoiDung}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bình luận">
            <Text>{new Date(comment.NgayBL).toLocaleDateString("vi-VN")}</Text>
          </Descriptions.Item>
        </Descriptions>

        {images.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <Text strong style={{ fontSize: "16px", display: "block", marginBottom: "16px" }}>
              Hình ảnh sản phẩm
            </Text>
            <Row gutter={[16, 16]}>
              {images.map((image, index) => (
                <Col xs={12} sm={8} md={4} key={index}>
                  <Image
                    src={image}
                    alt={`Hình ảnh ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    preview
                  />
                </Col>
              ))}
            </Row>
          </div>
        )}

        <Space style={{ marginTop: "24px" }}>
          <Link to="/admin/comments">
            <Button type="primary" style={{ borderRadius: "4px", padding: "6px 16px" }}>
              Quay lại danh sách
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default AdminDetailComment;