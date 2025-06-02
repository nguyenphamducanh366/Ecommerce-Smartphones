"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Row,
  Divider,
  Typography,
  Image,
  Input,
  Modal,
  Space,
  Tag,
  Descriptions,
  List,
  message,
  Radio,
  Form,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  getUserById,
  createOrder,
  createVNPayPayment,
  fetchPromotion,
  updateVoucherStatus,
} from "../../../service/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

const Checkcart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cart: initialCart,
    total: initialTotal = 0,
    finalTotal: initialFinalTotal = 0,
    discount: initialDiscount = 0,
    additionalDiscount: initialAdditionalDiscount = 0,
  } = location.state || {};

  const [userInfo, setUserInfo] = useState({});
  const [cart, setCart] = useState(initialCart || []);
  const [total, setTotal] = useState(initialTotal);
  const [finalTotal, setFinalTotal] = useState(initialFinalTotal);
  const [discount, setDiscount] = useState(initialDiscount);
  const [additionalDiscount, setAdditionalDiscount] = useState(
    initialAdditionalDiscount
  );
  const [orderNote, setOrderNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [addressOption, setAddressOption] = useState("existing");
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Giới hạn số lượng sản phẩm
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isOverFiveProducts = totalQuantity > 4;

  const formatCurrency = (value) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0 VND";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.id) {
        try {
          const response = await getUserById(userData.id);
          setUserInfo(response.data);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
          message.error("Lỗi khi lấy thông tin người dùng");
        }
      } else {
        console.error("Không có dữ liệu người dùng");
        message.warning("Vui lòng đăng nhập để tiếp tục");
        navigate("/login");
      }
    };
    fetchUserData();
  }, [navigate]);

  // Trên 5 sản phẩm thì thanh toán VNPay
  useEffect(() => {
    if (isOverFiveProducts) {
      setPaymentMethod("VNPay");
    }
  }, [isOverFiveProducts]);

  const handleAddressOptionChange = (e) => {
    setAddressOption(e.target.value);
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateNewAddress = () => {
    if (addressOption === "new") {
      if (!newAddress.name || !newAddress.phone || !newAddress.address) {
        message.error("Vui lòng điền đầy đủ thông tin địa chỉ mới!");
        return false;
      }

      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(newAddress.phone)) {
        message.error("Số điện thoại bắt đầu bằng 0 và đủ 10 chữ số.");
        return false;
      }
    }
    return true;
  };

  const getShippingInfo = () => {
    if (addressOption === "existing") {
      return {
        name: userInfo.HoVaTen || "",
        phone: userInfo.SDT || "",
        address: userInfo.DiaChi || "",
      };
    }
    return {
      name: newAddress.name,
      phone: newAddress.phone,
      address: newAddress.address,
    };
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!cart || cart.length === 0) {
      message.error("Giỏ hàng trống!");
      return;
    }

    if (addressOption === "existing") {
      if (
        !userInfo._id ||
        !userInfo.HoVaTen ||
        !userInfo.SDT ||
        !userInfo.DiaChi
      ) {
        message.error("Thông tin địa chỉ tài khoản không đầy đủ!");
        return;
      }
    }

    if (!validateNewAddress()) {
      return;
    }

    Modal.confirm({
      title: "Xác nhận đặt hàng",
      content: "Bạn có chắc chắn muốn đặt hàng không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      icon: <CheckOutlined />,
      onOk: async () => {
        setIsSubmitting(true);

        const shippingInfo = getShippingInfo();

        const orderData = {
          userId: userInfo._id,
          products: cart.map((item) => ({
            productId: item.id,
            image: item.image,
            name: item.name,
            memory: item.memory,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
          })),
          total: finalTotal,
          discount,
          additionalDiscount,
          shippingInfo,
          orderNote,
          paymentMethod: "COD",
        };

        try {
          const response = await createOrder(orderData);
          if (response.data) {
            const userData = JSON.parse(localStorage.getItem("userData"));
            const userId = userData?.id;

            if (userId) {
              // Lấy giỏ hàng từ localStorage
              const storedCart =
                JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

              // Lọc ra các sản phẩm không được chọn để thanh toán
              const remainingCart = storedCart.filter((storedItem) => {
                return !cart.some(
                  (selectedItem) =>
                    selectedItem.id === storedItem.id &&
                    selectedItem.memory === storedItem.memory
                );
              });

              // Cập nhật lại localStorage với các sản phẩm còn lại
              localStorage.setItem(
                `cart_${userId}`,
                JSON.stringify(remainingCart)
              );

              // Xử lý voucher nếu có
              const storedVoucher = JSON.parse(
                localStorage.getItem(`voucher_${userId}`)
              );
              if (storedVoucher && storedVoucher.code) {
                const promotionResponse = await fetchPromotion();
                const promotion = promotionResponse.data.data.find(
                  (promo) => promo.MaKM === storedVoucher.code
                );
                if (promotion) {
                  await updateVoucherStatus(promotion._id, 1);
                  localStorage.removeItem(`voucher_${userId}`);
                }
              }
            }

            window.dispatchEvent(new Event("cartUpdated"));
            message.success("Đặt hàng thành công!");
            navigate(
              `/profile-receipt/${response.data.data?._id || response.data._id}`
            );
          }
        } catch (error) {
          console.error("Lỗi khi tạo đơn hàng:", error);
          message.error("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleVNPayPayment = async () => {
    if (!cart || cart.length === 0) {
      message.error("Giỏ hàng trống!");
      return;
    }

    if (addressOption === "existing") {
      if (
        !userInfo._id ||
        !userInfo.HoVaTen ||
        !userInfo.SDT ||
        !userInfo.DiaChi
      ) {
        message.error("Thông tin địa chỉ tài khoản không đầy đủ!");
        return;
      }
    }

    if (!validateNewAddress()) {
      return;
    }

    if (!finalTotal || finalTotal <= 0) {
      message.error("Tổng tiền thanh toán không hợp lệ!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận thanh toán VNPay",
      content: "Bạn có chắc chắn muốn thanh toán qua VNPay không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      icon: <CheckOutlined />,
      onOk: async () => {
        setIsSubmitting(true);
        try {
          const shippingInfo = getShippingInfo();

          const orderData = {
            userId: userInfo._id,
            products: cart.map((item) => ({
              productId: item.id,
              image: item.image,
              name: item.name,
              memory: item.memory,
              color: item.color,
              quantity: item.quantity,
              price: item.price,
            })),
            total: finalTotal,
            discount,
            additionalDiscount,
            shippingInfo,
            orderNote,
            paymentMethod: "VNPay",
          };

          const response = await createOrder(orderData);
          const orderId = response.data.data?._id || response.data._id;
          if (!orderId) {
            throw new Error("Không lấy được ID đơn hàng");
          }

          const vnpayData = {
            amount: finalTotal,
            orderId: orderId,
            orderInfo: `Thanh toan don hang ${orderId}`,
            returnUrl: `${window.location.origin}/order-return`,
          };

          if (
            !vnpayData.amount ||
            !vnpayData.orderId ||
            !vnpayData.orderInfo ||
            !vnpayData.returnUrl
          ) {
            throw new Error("Dữ liệu thanh toán VNPay không hợp lệ");
          }

          const vnpayResponse = await createVNPayPayment(vnpayData);

          if (!vnpayResponse.data.paymentUrl) {
            throw new Error("Không nhận được URL thanh toán từ VNPay");
          }

          const userData = JSON.parse(localStorage.getItem("userData"));
          const userId = userData?.id;
          if (userId) {
            // Lấy giỏ hàng từ localStorage
            const storedCart =
              JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

            // Lọc ra các sản phẩm không được chọn để thanh toán
            const remainingCart = storedCart.filter((storedItem) => {
              return !cart.some(
                (selectedItem) =>
                  selectedItem.id === storedItem.id &&
                  selectedItem.memory === storedItem.memory
              );
            });

            // Cập nhật lại localStorage với các sản phẩm còn lại
            localStorage.setItem(
              `cart_${userId}`,
              JSON.stringify(remainingCart)
            );

            // Xử lý voucher nếu có
            const storedVoucher = JSON.parse(
              localStorage.getItem(`voucher_${userId}`)
            );
            if (storedVoucher && storedVoucher.code) {
              const promotionResponse = await fetchPromotion();
              const promotion = promotionResponse.data.data.find(
                (promo) => promo.MaKM === storedVoucher.code
              );
              if (promotion) {
                await updateVoucherStatus(promotion._id, 1);
                localStorage.removeItem(`voucher_${userId}`);
              }
            }
          }

          window.dispatchEvent(new Event("cartUpdated"));
          window.location.href = vnpayResponse.data.paymentUrl;
        } catch (error) {
          console.error("Lỗi xử lý thanh toán VNPay:", error);
          message.error(
            "Có lỗi xảy ra khi tạo thanh toán VNPay. Vui lòng thử lại!"
          );
          setIsSubmitting(false);
        }
      },
    });
  };

  if (!cart || cart.length === 0) {
    return (
      <Card className="mt-4">
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
          <ShoppingCartOutlined style={{ fontSize: "48px", color: "#ccc" }} />
          <Text type="secondary">Không có sản phẩm nào trong giỏ hàng</Text>
          <Button type="primary" onClick={() => navigate("/")}>
            Tiếp tục mua sắm
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <div className="container mt-4">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/cart")}
          >
            Quay lại giỏ hàng
          </Button>
        </Col>

        <Col xs={24} lg={16}>
          <Card title={<Title level={3}>Thông tin giao hàng</Title>}>
            <Radio.Group
              onChange={handleAddressOptionChange}
              value={addressOption}
              style={{ marginBottom: 16 }}
            >
              <Radio value="existing">Sử dụng địa chỉ tài khoản</Radio>
              <Radio value="new">Nhập địa chỉ mới</Radio>
            </Radio.Group>

            {addressOption === "existing" && userInfo.HoVaTen ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Họ và tên">
                  {userInfo.HoVaTen}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {userInfo.SDT}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {userInfo.DiaChi}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Form layout="vertical">
                <Form.Item
                  label="Họ và tên"
                  required
                  validateStatus={
                    newAddress.name || addressOption === "existing"
                      ? ""
                      : "error"
                  }
                  help={
                    newAddress.name || addressOption === "existing"
                      ? ""
                      : "Vui lòng nhập họ và tên"
                  }
                >
                  <Input
                    name="name"
                    value={newAddress.name}
                    onChange={handleNewAddressChange}
                    placeholder="Nhập họ và tên"
                  />
                </Form.Item>
                <Form.Item
                  label="Số điện thoại"
                  required
                  validateStatus={
                    newAddress.phone || addressOption === "existing"
                      ? ""
                      : "error"
                  }
                  help={
                    newAddress.phone || addressOption === "existing"
                      ? ""
                      : "Vui lòng nhập số điện thoại"
                  }
                >
                  <Input
                    name="phone"
                    value={newAddress.phone}
                    onChange={handleNewAddressChange}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Item>
                <Form.Item
                  label="Địa chỉ"
                  required
                  validateStatus={
                    newAddress.address || addressOption === "existing"
                      ? ""
                      : "error"
                  }
                  help={
                    newAddress.address || addressOption === "existing"
                      ? ""
                      : "Vui lòng nhập địa chỉ"
                  }
                >
                  <Input
                    name="address"
                    value={newAddress.address}
                    onChange={handleNewAddressChange}
                    placeholder="Nhập địa chỉ"
                  />
                </Form.Item>
              </Form>
            )}
          </Card>

          <Card
            title={<Title level={3}>Danh sách sản phẩm</Title>}
            className="mt-3"
          >
            <List
              itemLayout="horizontal"
              dataSource={cart}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  <List.Item.Meta
                    avatar={
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={100}
                        height={100}
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                        preview={false}
                      />
                    }
                    title={<Text strong>{item.name}</Text>}
                    description={
                      <Space direction="vertical" size="small">
                        <div>
                          <Text>Bộ nhớ: </Text>
                          <Tag color="blue">{item.memory}</Tag>
                        </div>
                        <div>
                          <Text>Màu sắc: </Text>
                          <Tag
                            color={item.color.toLowerCase()}
                            style={{
                              width: "20px",
                              height: "20px",
                              border: "1px solid #d9d9d9",
                            }}
                          />
                        </div>
                        <div>
                          <Text>Số lượng: </Text>
                          <Text strong>{item.quantity}</Text>
                        </div>
                      </Space>
                    }
                  />
                  <div>
                    <Text strong type="danger">
                      {formatCurrency(item.price || 0)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          <Card
            title={<Title level={3}>Ghi chú đơn hàng</Title>}
            className="mt-3"
          >
            <TextArea
              rows={4}
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Nhập ghi chú cho đơn hàng (nếu có)..."
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<Title level={3}>Tổng thanh toán</Title>}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Descriptions column={1}>
                <Descriptions.Item label="Tổng tiền">
                  <Text>{formatCurrency(total)}</Text>
                </Descriptions.Item>
                {(discount > 0 || additionalDiscount > 0) && (
                  <Descriptions.Item label="Giảm giá">
                    <Text type="success">
                      -{formatCurrency(discount + additionalDiscount)}
                    </Text>
                  </Descriptions.Item>
                )}
                <Divider />
                <Descriptions.Item label="Tổng thanh toán">
                  <Title level={4} type="success">
                    {formatCurrency(finalTotal)}
                  </Title>
                </Descriptions.Item>
              </Descriptions>

              {isOverFiveProducts && (
                <Text type="warning">
                  Đối với những đơn hàng có hơn 5 sản phẩm, vui lòng thanh toán
                  trước qua VNPay. Xin cảm ơn!
                </Text>
              )}

              <Button
                type={paymentMethod === "COD" ? "primary" : "default"}
                size="large"
                block
                onClick={() => setPaymentMethod("COD")}
                style={{ marginBottom: 8 }}
                disabled={isOverFiveProducts}
              >
                Thanh toán khi nhận hàng (COD)
              </Button>

              <Button
                type={paymentMethod === "VNPay" ? "primary" : "default"}
                size="large"
                block
                onClick={() => setPaymentMethod("VNPay")}
                style={{ marginBottom: 16 }}
              >
                Thanh toán online với VNPay
              </Button>

              <Button
                type="primary"
                size="large"
                block
                onClick={
                  paymentMethod === "COD"
                    ? handleSubmitOrder
                    : handleVNPayPayment
                }
                loading={isSubmitting}
                icon={<CheckOutlined />}
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : paymentMethod === "COD"
                  ? "Xác nhận đặt hàng"
                  : "Thanh toán với VNPay"}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkcart;
