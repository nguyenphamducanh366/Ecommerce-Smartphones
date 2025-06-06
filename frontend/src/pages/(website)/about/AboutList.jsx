import React from "react";
import { Row, Col, Card, Typography, Timeline, Statistic, Divider } from "antd";
import {
  UserOutlined,
  ShopOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  RocketOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const AboutList = () => {
  // Data config để dễ quản lý
  const STATS_DATA = [
    { icon: <ShopOutlined />, number: "1,00,000 +", label: "Sản phẩm" },
    { icon: <UserOutlined />, number: "80,000 +", label: "Khách hàng" },
    { icon: <RiseOutlined />, number: "100 +", label: "Chi nhánh" },
  ];

  const MISSION_DATA = [
    {
      title: "Nhiệm vụ",
      content: "Mang đến sự dễ dàng và thuận tiện khi khách hàng mua sản phẩm.",
    },
    {
      title: "Tầm nhìn",
      content:
        "Mở rộng chuỗi cửa hàng ra cả nước, phục vụ cho tất cả khách hàng.",
    },
    {
      title: "Giá cả",
      content:
        "Giá cả phù hợp với từng sản phẩm. Có dịch vụ giảm giá và miễn phí vận chuyển.",
    },
  ];

  const TIMELINE_DATA = [
    {
      time: "2010 - 2012",
      content: "Xây dựng ý tưởng mở công ty Smartphone.",
    },
    {
      time: "2013 - 2014",
      content: "Công ty Smarphone được thành lập, tìm kiếm khách hàng.",
    },
    {
      time: "2014 - 2015",
      content: "Công ty đi vào thời kỳ ổn định.",
    },
    {
      time: "2017 - 2018",
      content: "Mở thêm nhiều chi nhánh và phát triển trang web Smarphone.",
    },
  ];

  const TESTIMONIALS_DATA = [
    {
      content:
        "“Công ty có nhiều loại sản phẩm khác nhau. Giá cả lại rất phù hợp. Tôi rất thích công ty này.”",
      author: "Henry Odom",
    },
    {
      content:
        "“Tôi thật sự thích công ty này, họ luôn mang đến sự thuận tiện khi tôi mua sản phẩm của họ.”",
      author: "George Walker",
    },
    {
      content: "“Công ty có một đội ngũ phục vụ rất tốt, tư vấn tận tình.”",
      author: "Nguyễn Văn A",
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      {/* Giới thiệu */}
      <section style={{ marginBottom: 48 }}>
        <Title level={2} className="text-center">
          <RocketOutlined /> Chào mừng đến với SmartPhone
        </Title>
        <Paragraph className="text-center" style={{ fontSize: 16 }}>
          SmartPhone là một trang web bán điện thoại trực tuyến do công ty
          SmartPhone tạo ra và chi phối...
        </Paragraph>
      </section>

      <Divider orientation="left">Thống kê ấn tượng</Divider>

      {/* Số liệu thống kê */}
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        {STATS_DATA.map((item, index) => (
          <Col key={index} xs={24} md={8}>
            <Card hoverable bordered={false} className="stats-card">
              <Statistic
                title={item.label}
                value={item.number}
                prefix={item.icon}
                valueStyle={{ color: "#1890ff", fontSize: 28 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Divider orientation="left">Giá trị cốt lõi</Divider>

      {/* Nhiệm vụ, tầm nhìn, giá cả */}
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        {MISSION_DATA.map((item, index) => (
          <Col key={index} xs={24} md={8}>
            <Card
              title={item.title}
              hoverable
              headStyle={{ backgroundColor: "#f0f5ff", borderBottom: 0 }}
            >
              <Text type="secondary">{item.content}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Divider orientation="left">Chặng đường phát triển</Divider>

      {/* Timeline */}
      <Timeline mode="alternate" style={{ marginBottom: 48 }}>
        {TIMELINE_DATA.map((item, index) => (
          <Timeline.Item
            key={index}
            color="blue"
            dot={
              <ClockCircleOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            }
          >
            <Card
              size="small"
              style={{ width: 300 }}
              headStyle={{ background: "#e6f7ff" }}
            >
              <Title level={5} style={{ color: "#1890ff" }}>
                {item.time}
              </Title>
              <Paragraph>{item.content}</Paragraph>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>

      <Divider orientation="left">Khách hàng nói về chúng tôi</Divider>

      {/* Đánh giá */}
      <Row gutter={[24, 24]}>
        {TESTIMONIALS_DATA.map((item, index) => (
          <Col key={index} xs={24} md={8}>
            <Card
              hoverable
              actions={[
                <MessageOutlined key="message" style={{ color: "#1890ff" }} />,
                <Text strong key="author">
                  {item.author}
                </Text>,
              ]}
            >
              <Paragraph italic style={{ fontSize: 16 }}>
                {item.content}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AboutList;
