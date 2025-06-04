import React from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  message,
  Divider,
  Typography,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const ContactPage = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      console.log("Thông tin liên hệ:", values);
      message.success(
        "Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại trong 15 phút"
      );
      form.resetFields();
    } catch (error) {
      message.error("Gửi yêu cầu thất bại!");
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", color: "#1890ff" }}>
        <ShoppingOutlined /> LIÊN HỆ TƯ VẤN MUA ĐIỆN THOẠI
      </Title>

      <Row gutter={[32, 32]} style={{ marginTop: "40px" }}>
        {/* Form liên hệ */}
        <Col xs={24} md={12}>
          <Card
            title={
              <span style={{ fontSize: "20px" }}>
                <MessageOutlined /> Gửi yêu cầu tư vấn
              </span>
            }
            hoverable
            headStyle={{ backgroundColor: "#1890ff", color: "white" }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Họ tên"
                    name="name"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên của bạn" },
                    ]}
                  >
                    <Input placeholder="Nguyễn Văn A" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^(0|\+84)\d{9,10}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    ]}
                  >
                    <Input placeholder="0987 654 321" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>

              <Form.Item label="Sản phẩm quan tâm" name="product">
                <Input placeholder="Ví dụ: iPhone 15 Pro Max 256GB" />
              </Form.Item>

              <Form.Item
                label="Nội dung yêu cầu"
                name="message"
                rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Mô tả nhu cầu của bạn..."
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
              >
                GỬI YÊU CẦU TƯ VẤN
              </Button>
            </Form>
          </Card>

          <Divider />

          <Card title="Hỗ trợ nhanh" style={{ marginTop: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                size="large"
                href="tel:0987654321"
                icon={<PhoneOutlined />}
                style={{ margin: "8px", width: "200px" }}
              >
                Gọi ngay: 0987 654 321
              </Button>

              <Button
                type="primary"
                size="large"
                href="mailto:contact@phone-store.com"
                icon={<MailOutlined />}
                style={{ margin: "8px", width: "200px" }}
              >
                Email hỗ trợ
              </Button>
            </div>
          </Card>
        </Col>

        {/* Thông tin cửa hàng */}
        <Col xs={24} md={12}>
          <Card
            title={
              <span style={{ fontSize: "20px" }}>
                <EnvironmentOutlined /> Thông tin cửa hàng
              </span>
            }
            hoverable
            headStyle={{ backgroundColor: "#1890ff", color: "white" }}
          >
            <div style={{ fontSize: "16px" }}>
              <p>
                <EnvironmentOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                <strong>Địa chỉ:</strong> P. xuân phương, Q.nam từ liêm, TP.HN
              </p>

              <p>
                <PhoneOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                <strong>Hotline:</strong> 1900 1234
              </p>

              <p>
                <MailOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                <strong>Email:</strong> support@phone-store.com
              </p>

              <p>
                <ClockCircleOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                <strong>Giờ làm việc:</strong>
                <br />
                - Thứ 2 - Thứ 6: 8:00 - 21:00
                <br />- Thứ 7 - CN: 9:00 - 22:00
              </p>

              <Divider />

              <Title level={4}>Bản đồ cửa hàng</Title>
              <iframe
                title="store-map"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: "8px" }}
                loading="lazy"
                src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=123+Điện+Biên+Phủ,+Bình+Thạnh,+Hồ+Chí+Minh"
              ></iframe>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "40px", padding: "20px" }}>
        <Divider />
        <p>
          Kết nối với chúng tôi qua:
          <Button type="link" href="#facebook">
            Facebook
          </Button>{" "}
          |
          <Button type="link" href="#zalo">
            Zalo
          </Button>{" "}
          |
          <Button type="link" href="#tiktok">
            Tiktok
          </Button>
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
