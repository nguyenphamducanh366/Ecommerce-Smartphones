import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createComment,
  fetchComments,
  getProducts,
  fetchProducts,
} from "../../../service/api";
import {
  FaShoppingCart,
  FaExchangeAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Table,
  Card,
  Row,
  Col,
  Descriptions,
  Space,
  Divider,
  Typography,
  Badge,
  Flex,
  Tag,
} from "antd";
import io from "socket.io-client";

const { Title, Text, Paragraph } = Typography;

const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
});

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState({
    memory: "",
    price: 0,
    quantity: 0,
  });
  const [selectedImage, setSelectedImage] = useState("");
  const [zoomStyle, setZoomStyle] = useState({});
  const [comments, setComments] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [form] = Form.useForm();
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [compareProducts, setCompareProducts] = useState([]);
  const [filteredCompareProducts, setFilteredCompareProducts] = useState([]);
  const [selectedCompareProducts, setSelectedCompareProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userData = JSON.parse(localStorage.getItem("userData"));
  const email = userData?.Email;
  const checkvar = ["cháy nổ", "độc hại"];
  const [displayedComments, setDisplayedComments] = useState(5);
  const timeoutRef = useRef(null);

  const normalizeProductName = (name) => {
    const mainName = name.split("|")[0].trim();
    return mainName.replace(/\s+/g, "").toLowerCase();
  };

  const handleShowMore = () => {
    setDisplayedComments(comments.length);
  };

  const productListRef = useRef(null);
  const relatedProductsRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showRelatedLeftArrow, setShowRelatedLeftArrow] = useState(false);
  const [showRelatedRightArrow, setShowRelatedRightArrow] = useState(false);

  const scrollProducts = (direction) => {
    const container = productListRef.current;
    const scrollAmount = 300;
    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
    updateArrowVisibility();
  };

  const scrollRelatedProducts = (direction) => {
    const container = relatedProductsRef.current;
    const scrollAmount = 200;
    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
    updateRelatedArrowVisibility();
  };

  const updateArrowVisibility = () => {
    const container = productListRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const updateRelatedArrowVisibility = () => {
    const container = relatedProductsRef.current;
    if (container) {
      const isOverflowing = container.scrollWidth > container.clientWidth;
      setShowRelatedLeftArrow(isOverflowing && container.scrollLeft > 0);
      setShowRelatedRightArrow(
        isOverflowing &&
          container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    const container = productListRef.current;
    const handleScroll = () => updateArrowVisibility();
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = relatedProductsRef.current;
    const handleScroll = () => updateRelatedArrowVisibility();

    const checkOverflow = () => {
      if (container) {
        const isOverflowing = container.scrollWidth > container.clientWidth;
        setShowRelatedLeftArrow(isOverflowing && container.scrollLeft > 0);
        setShowRelatedRightArrow(
          isOverflowing &&
            container.scrollLeft < container.scrollWidth - container.clientWidth
        );
      }
    };

    container?.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkOverflow);
    checkOverflow();

    return () => {
      container?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [relatedProducts]);

  useEffect(() => {
    socket.on("productUpdated", (updatedProduct) => {
      if (updatedProduct._id === id) {
        setProduct(updatedProduct);

        const allMemoriesNone = [
          updatedProduct.BoNhoTrong1,
          updatedProduct.BoNhoTrong2,
          updatedProduct.BoNhoTrong3,
          updatedProduct.BoNhoTrong4,
          updatedProduct.BoNhoTrong5,
          updatedProduct.BoNhoTrong6,
        ].every((memory) => memory === "Không có");

        if (allMemoriesNone) {
          setSelectedMemory({ memory: "", price: 0, quantity: 0 });
        } else if (selectedMemory.memory) {
          const memoryKey =
            selectedMemory.memory === updatedProduct.BoNhoTrong1
              ? "BoNhoTrong1"
              : selectedMemory.memory === updatedProduct.BoNhoTrong2
              ? "BoNhoTrong2"
              : selectedMemory.memory === updatedProduct.BoNhoTrong3
              ? "BoNhoTrong3"
              : selectedMemory.memory === updatedProduct.BoNhoTrong4
              ? "BoNhoTrong4"
              : selectedMemory.memory === updatedProduct.BoNhoTrong5
              ? "BoNhoTrong5"
              : "BoNhoTrong6";
          const memoryIndex = memoryKey.slice(-1);
          const newQuantity = updatedProduct[`SoLuong${memoryIndex}`] || 0;

          setSelectedMemory({
            memory: updatedProduct[memoryKey] || selectedMemory.memory,
            price:
              updatedProduct[`GiaSP${memoryIndex}`] || selectedMemory.price,
            quantity: newQuantity,
          });

          if (newQuantity <= 0) {
            message.warning(`Bộ nhớ ${selectedMemory.memory} đã hết hàng!`);
          }
        }

        if (updatedProduct.HinhAnh1) {
          setSelectedImage(updatedProduct.HinhAnh1);
        }
      }

      // Cập nhật allProducts
      setAllProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === updatedProduct._id ? updatedProduct : p
        )
      );

      // Cập nhật relatedProducts
      setRelatedProducts((prevRelated) =>
        prevRelated.map((p) =>
          p._id === updatedProduct._id ? updatedProduct : p
        )
      );
    });

    return () => {
      socket.off("productUpdated");
    };
  }, [id, selectedMemory.memory]);

  const autoSelectMemory = (productData) => {
    const allMemoriesNone = [
      productData.BoNhoTrong1,
      productData.BoNhoTrong2,
      productData.BoNhoTrong3,
      productData.BoNhoTrong4,
      productData.BoNhoTrong5,
      productData.BoNhoTrong6,
    ].every((memory) => memory === "Không có");

    if (allMemoriesNone) {
      setSelectedMemory({ memory: "", price: 0, quantity: 0 });
      return;
    }

    const availableMemories = [
      productData.BoNhoTrong1,
      productData.BoNhoTrong2,
      productData.BoNhoTrong3,
      productData.BoNhoTrong4,
      productData.BoNhoTrong5,
      productData.BoNhoTrong6,
    ].filter((memory) => memory !== "Không có");

    if (availableMemories.length === 1) {
      const memoryKey =
        availableMemories[0] === productData.BoNhoTrong1
          ? "BoNhoTrong1"
          : availableMemories[0] === productData.BoNhoTrong2
          ? "BoNhoTrong2"
          : availableMemories[0] === productData.BoNhoTrong3
          ? "BoNhoTrong3"
          : availableMemories[0] === productData.BoNhoTrong4
          ? "BoNhoTrong4"
          : availableMemories[0] === productData.BoNhoTrong5
          ? "BoNhoTrong5"
          : "BoNhoTrong6";
      const memoryIndex = memoryKey.slice(-1);
      timeoutRef.current = setTimeout(() => {
        setSelectedMemory({
          memory: productData[memoryKey],
          price: productData[`GiaSP${memoryIndex}`],
          quantity: productData[`SoLuong${memoryIndex}`],
        });
      }, 200);
    } else {
      if (
        productData.BoNhoTrong1 &&
        productData.BoNhoTrong1 !== "Không có"
      ) {
        timeoutRef.current = setTimeout(() => {
          setSelectedMemory({
            memory: productData.BoNhoTrong1,
            price: productData.GiaSP1,
            quantity: productData.SoLuong1,
          });
        }, 200);
      } else if (
        productData.BoNhoTrong2 &&
        productData.BoNhoTrong2 !== "Không có"
      ) {
        timeoutRef.current = setTimeout(() => {
          setSelectedMemory({
            memory: productData.BoNhoTrong2,
            price: productData.GiaSP2,
            quantity: productData.SoLuong2,
          });
        }, 200);
      } else if (
        productData.BoNhoTrong3 &&
        productData.BoNhoTrong3 !== "Không có"
      ) {
        timeoutRef.current = setTimeout(() => {
          setSelectedMemory({
            memory: productData.BoNhoTrong3,
            price: productData.GiaSP3,
            quantity: productData.SoLuong3,
          });
        }, 200);
      } else if (
        productData.BoNhoTrong4 &&
        productData.BoNhoTrong4 !== "Không có"
      ) {
        timeoutRef.current = setTimeout(() => {
          setSelectedMemory({
            memory: productData.BoNhoTrong4,
            price: productData.GiaSP4,
            quantity: productData.SoLuong4,
          });
        }, 200);
      } else if (
        productData.BoNhoTrong5 &&
        productData.BoNhoTrong5 !== "Không có"
      ) {
        timeoutRef.current = setTimeout(() => {
          setSelectedMemory({
            memory: productData.BoNhoTrong5,
            price: productData.GiaSP5,
            quantity: productData.SoLuong5,
          });
        }, 200);
      } else if (
        productData.BoNhoTrong6 &&
        productData.BoNhoTrong6 !== "Không có"
      ) {
        timeoutRef.current = setTimeout(() => {
          setSelectedMemory({
            memory: productData.BoNhoTrong6,
            price: productData.GiaSP6,
            quantity: productData.SoLuong6,
          });
        }, 200);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    getProducts(id)
      .then((response) => {
        const productData = response.data.data;
        let updatedProduct = { ...productData };
        setProduct(updatedProduct);
        if (updatedProduct.HinhAnh1) setSelectedImage(updatedProduct.HinhAnh1);

        autoSelectMemory(updatedProduct);

        setLoading(false);

        fetchProducts().then((response) => {
          const allProducts = response.data.data || [];
          setAllProducts(allProducts);

          const normalizedProductName = normalizeProductName(productData.TenSP);

          const related = allProducts
            .filter((p) => {
              const normalizedRelatedName = normalizeProductName(p.TenSP);
              return (
                normalizedRelatedName === normalizedProductName &&
                p._id !== productData._id
              );
            })
            .slice(0, 4);
          setRelatedProducts(related);
        });
      })
      .catch(() => {
        setError("Không thể tải chi tiết sản phẩm.");
        setLoading(false);
      });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    const fetchProductComments = async () => {
      try {
        const response = await fetchComments();
        const productComments = response.data
          .filter((comment) => comment.MaSP === id && comment.isApproved)
          .sort((a, b) => new Date(b.NgayBL) - new Date(a.NgayBL));
        setComments(productComments);
      } catch (error) {
        console.error("Lỗi khi tải bình luận:", error);
      }
    };
    fetchProductComments();

    const handleCommentUpdate = () => fetchProductComments();
    window.addEventListener("commentUpdated", handleCommentUpdate);
    return () =>
      window.removeEventListener("commentUpdated", handleCommentUpdate);
  }, [id]);

  const openCompareModal = () => {
    setCompareModalVisible(true);
    const availableProducts = allProducts.filter((p) => p._id !== id);
    setCompareProducts(availableProducts);
    setFilteredCompareProducts(availableProducts);
    setSearchTerm("");
  };

  const toggleCompareProduct = (productId) => {
    setSelectedCompareProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = compareProducts.filter((product) =>
      product.TenSP.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompareProducts(filtered);
  };

  const handleCompare = () => {
    if (selectedCompareProducts.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 sản phẩm để so sánh");
      return;
    }

    const updatedProduct = {
      ...product,
      BoNhoTrong1: selectedMemory.memory || product.BoNhoTrong1,
      GiaSP1: selectedMemory.price || product.GiaSP1,
    };

    const productsToCompare = [
      updatedProduct,
      ...compareProducts.filter((p) => selectedCompareProducts.includes(p._id)),
    ];

    Modal.info({
      title: "Kết quả so sánh sản phẩm",
      width: "90%",
      content: (
        <div className="compare-table-container">
          <Table
            dataSource={productsToCompare}
            columns={[
              {
                title: "Sản phẩm",
                dataIndex: "TenSP",
                key: "name",
                render: (text, record) => (
                  <Space direction="vertical" align="center">
                    <img
                      src={record.HinhAnh1}
                      alt={text}
                      style={{ width: 100, height: 100, objectFit: "contain" }}
                    />
                    <Text strong>{text}</Text>
                    <Text type="danger">{formatCurrency(record.GiaSP1)}</Text>
                  </Space>
                ),
                fixed: "left",
                width: 200,
              },
              {
                title: "Hệ điều hành",
                dataIndex: "HDH",
                key: "os",
                render: (text) => text || "--",
              },
              {
                title: "Chip xử lý",
                dataIndex: "CPU",
                key: "cpu",
                render: (text) => text || "--",
              },
              {
                title: "Bộ nhớ trong",
                key: "storage",
                render: (text, record) => record.BoNhoTrong1 || "--",
              },
              {
                title: "Camera sau",
                dataIndex: "CamSau",
                key: "rearCamera",
                render: (text) => text || "--",
              },
              {
                title: "Camera trước",
                dataIndex: "CamTruoc",
                key: "frontCamera",
                render: (text) => text || "--",
              },
              {
                title: "Cổng sạc",
                dataIndex: "CapSac",
                key: "charging",
                render: (text) => text || "--",
              },
              {
                title: "Mô tả",
                dataIndex: "MoTa",
                key: "description",
                render: (text) => text || "--",
              },
            ]}
            bordered
            size="middle"
            scroll={{ x: true }}
            pagination={false}
          />
        </div>
      ),
      onOk() {},
    });

    setCompareModalVisible(false);
    setSelectedCompareProducts([]);
  };

  const onFinish = async (values) => {
    const containsForbiddenWords = checkvar.some((word) =>
      new RegExp(`\\b${word}\\b`, "i").test(values.NoiDung)
    );

    if (containsForbiddenWords) {
      message.error("Bình luận của bạn có chứa từ ngữ không phù hợp!");
      return;
    }
    try {
      setLoading(true);
      const commentData = { ...values, MaSP: id, Email: email, DanhGia: 0 };
      await createComment(commentData);
      message.success("Bình luận đã được gửi, đang chờ duyệt!");
      form.resetFields();

      const response = await fetchComments();
      const productComments = response.data
        .filter((comment) => comment.MaSP === id && comment.isApproved)
        .sort((a, b) => new Date(b.NgayBL) - new Date(a.NgayBL));
      setComments(productComments);
    } catch (error) {
      message.error(
        "Thêm bình luận thất bại! Bạn vui lòng đăng nhập để sử dụng tính năng này."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMemorySelection = (memoryKey) => {
    const memory = product[memoryKey];
    const memoryIndex = memoryKey.slice(-1);
    const newQuantity = product[`SoLuong${memoryIndex}`] || 0;
    setSelectedMemory({
      memory,
      price: product[`GiaSP${memoryIndex}`],
      quantity: newQuantity,
    });
    if (newQuantity <= 0) {
      message.warning(`Bộ nhớ ${memory} đã hết hàng!`);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const addToCart = () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      message.warning("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/login");
      return;
    }

    if (!product || !selectedMemory.memory) {
      message.warning("Vui lòng chọn bộ nhớ!");
      return;
    }

    if (selectedMemory.quantity <= 0) {
      message.warning("Sản phẩm đã hết hàng!");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.id;
    const cartItems = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.id === product._id &&
        item.memory === selectedMemory.memory &&
        item.color === product.Mau1
    );

    if (existingItemIndex !== -1) {
      const newQuantity = cartItems[existingItemIndex].quantity + 1;
      if (newQuantity > selectedMemory.quantity) {
        message.warning("Đã đạt giới hạn sản phẩm trong giỏ hàng!");
        return;
      }
      cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      cartItems.push({
        id: product._id,
        name: product.TenSP,
        memory: selectedMemory.memory,
        color: product.Mau1,
        image: selectedImage,
        quantity: 1,
        price: selectedMemory.price,
        maxQuantity: selectedMemory.quantity,
      });
    }

    localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
    message.success("Sản phẩm đã được thêm vào giỏ hàng!");
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/cart");
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  const getDisplayMemoryAndPrice = (product) => {
    // Kiểm tra nếu sản phẩm ngừng kinh doanh hoặc hết hàng với tất cả số lượng bằng 0
    const allQuantitiesZero = [
      product.SoLuong1,
      product.SoLuong2,
      product.SoLuong3,
      product.SoLuong4,
      product.SoLuong5,
      product.SoLuong6,
    ].every((quantity) => quantity === 0 || quantity === undefined);

    if (
      product.TrangThai === "Ngừng kinh doanh" ||
      (product.TrangThai === "Hết hàng" && allQuantitiesZero)
    ) {
      return { memory: "Liên hệ", price: null };
    }

    const memories = [
      { memory: product.BoNhoTrong1, price: product.GiaSP1, quantity: product.SoLuong1, index: 1 },
      { memory: product.BoNhoTrong2, price: product.GiaSP2, quantity: product.SoLuong2, index: 2 },
      { memory: product.BoNhoTrong3, price: product.GiaSP3, quantity: product.SoLuong3, index: 3 },
      { memory: product.BoNhoTrong4, price: product.GiaSP4, quantity: product.SoLuong4, index: 4 },
      { memory: product.BoNhoTrong5, price: product.GiaSP5, quantity: product.SoLuong5, index: 5 },
      { memory: product.BoNhoTrong6, price: product.GiaSP6, quantity: product.SoLuong6, index: 6 },
    ].filter((item) => item.memory && item.memory !== "Không có");

    if (memories.length === 0) {
      return { memory: "Không có", price: 0 };
    }

    const availableMemory = memories.find((item) => item.quantity > 0);
    if (availableMemory) {
      return { memory: availableMemory.memory, price: availableMemory.price };
    }

    return { memory: memories[0].memory, price: memories[0].price };
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.5)",
    });
  };

  const handleMouseLeave = () => setZoomStyle({});

  const handleProductClick = (productId) => {
    setLoading(true);
    getProducts(productId)
      .then((response) => {
        const productData = response.data.data;
        setProduct(productData);
        setSelectedMemory({ memory: "", price: 0, quantity: 0 });
        if (productData.HinhAnh1) setSelectedImage(productData.HinhAnh1);
        autoSelectMemory(productData);
        setLoading(false);
        navigate(`/products/product_detail/${productId}`);
      })
      .catch(() => {
        setError("Không thể tải chi tiết sản phẩm.");
        setLoading(false);
      });
  };

  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product)
    return <div className="alert alert-warning">Không tìm thấy sản phẩm.</div>;

  const allMemoriesNone = [
    product.BoNhoTrong1,
    product.BoNhoTrong2,
    product.BoNhoTrong3,
    product.BoNhoTrong4,
    product.BoNhoTrong5,
    product.BoNhoTrong6,
  ].every((memory) => memory === "Không có");

  return (
    <div className="container mt-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            cover={
              <div
                style={{
                  height: 400,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={selectedImage}
                  alt={product.TenSP}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transition: "transform 0.2s ease-in-out",
                    ...zoomStyle,
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              </div>
            }
          >
            <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
              {[1, 2, 3, 4, 5, 6].map((index) =>
                product[`HinhAnh${index}`] ? (
                  <Col key={index} span={4}>
                    <img
                      src={product[`HinhAnh${index}`]}
                      alt={product.TenSP}
                      style={{
                        width: "100%",
                        height: 80,
                        objectFit: "contain",
                        cursor: "pointer",
                        border:
                          selectedImage === product[`HinhAnh${index}`]
                            ? "2px solid #1890ff"
                            : "1px solid #e8e8e8",
                        borderRadius: 4,
                      }}
                      onClick={() =>
                        setSelectedImage(product[`HinhAnh${index}`])
                      }
                    />
                  </Col>
                ) : null
              )}
            </Row>
          </Card>

          <Card
            title={<Title level={4}>Mô tả sản phẩm</Title>}
            style={{ marginTop: 24 }}
          >
            <Paragraph style={{ whiteSpace: "pre-line", textAlign: "justify" }}>
              {product.MoTa || "Không có thông tin"}
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card style={{ padding: 16 }}>
            <Flex vertical>
              <Title level={2}>{product.TenSP}</Title>
              <Text type="secondary">Mã sản phẩm: {product.MaSP}</Text>
              <Text type="secondary">Thương hiệu: {product.TenTH}</Text>
              {allMemoriesNone ? (
                <>
                  <Title level={4}>Sản phẩm ngừng kinh doanh</Title>
                  <Badge status="error" text="Hết hàng" />
                </>
              ) : selectedMemory.memory ? (
                <>
                  <Title level={3} type="danger">
                    {formatCurrency(selectedMemory.price)}
                  </Title>
                  <Badge
                    status={selectedMemory.quantity > 0 ? "success" : "error"}
                    text={selectedMemory.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                  />
                </>
              ) : (
                <Title level={4}>Vui lòng chọn bộ nhớ để xem giá</Title>
              )}

              <Space align="center">
                <Divider orientation="left" plain style={{ margin: 0 }}>
                  Màu sắc
                </Divider>
                {product.Mau1 && (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor:
                        product.Mau1 !== "Hết Hàng" ? product.Mau1 : "gray",
                      border: "2px solid #1890ff",
                    }}
                  />
                )}
              </Space>

              {!allMemoriesNone && (
                <>
                  <Divider orientation="left">Bộ nhớ trong</Divider>
                  <Space wrap justify="center">
                    {[
                      "BoNhoTrong1",
                      "BoNhoTrong2",
                      "BoNhoTrong3",
                      "BoNhoTrong4",
                      "BoNhoTrong5",
                      "BoNhoTrong6",
                    ].map((memoryKey, index) =>
                      product[memoryKey] &&
                      product[memoryKey] !== "Không có" ? (
                        <div
                          key={index}
                          style={{ position: "relative", textAlign: "center" }}
                        >
                          <Button
                            type={
                              selectedMemory.memory === product[memoryKey]
                                ? "primary"
                                : "default"
                            }
                            onClick={() => handleMemorySelection(memoryKey)}
                          >
                            {product[memoryKey]}
                            {selectedMemory.memory === product[memoryKey] && (
                              <span>
                                {" "}
                                ({product[`SoLuong${memoryKey.slice(-1)}`]})
                              </span>
                            )}
                          </Button>
                          {product[`SoLuong${memoryKey.slice(-1)}`] <= 0 && (
                            <Text
                              type="danger"
                              style={{
                                display: "block",
                                fontSize: 12,
                                marginTop: 4,
                              }}
                            >
                              Hết hàng
                            </Text>
                          )}
                        </div>
                      ) : null
                    )}
                  </Space>
                </>
              )}

              <Space style={{ marginTop: 16 }} size="large">
                <Button
                  type="primary"
                  icon={<FaShoppingCart />}
                  onClick={addToCart}
                  disabled={
                    allMemoriesNone ||
                    !selectedMemory.memory ||
                    selectedMemory.quantity <= 0 ||
                    product.Mau1 === "Hết Hàng"
                  }
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button icon={<FaExchangeAlt />} onClick={openCompareModal}>
                  So sánh sản phẩm
                </Button>
              </Space>

              {relatedProducts.length > 0 && (
                <>
                  <Divider orientation="left">Phiên bản màu khác</Divider>
                  <div style={{ position: "relative", width: "100%" }}>
                    {showRelatedLeftArrow && (
                      <Button
                        shape="circle"
                        icon={<FaChevronLeft />}
                        onClick={() => scrollRelatedProducts("left")}
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translate(-100%, -50%)",
                          zIndex: 2,
                        }}
                      />
                    )}

                    <div
                      ref={relatedProductsRef}
                      style={{
                        display: "flex",
                        gap: "16px",
                        overflowX: "auto",
                        scrollBehavior: "smooth",
                        padding: "0 40px 16px",
                      }}
                      className="scrollbar-hidden"
                    >
                      {relatedProducts.map((relatedProduct) => (
                        <Card
                          key={relatedProduct._id}
                          hoverable
                          style={{
                            minWidth: 200,
                            width: 200,
                            borderRadius: 8,
                            flexShrink: 0,
                            transition:
                              "transform 0.3s ease, box-shadow 0.3s ease",
                          }}
                          cover={
                            <div
                              style={{
                                height: 150,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f5f5f5",
                              }}
                            >
                              <img
                                alt={relatedProduct.TenSP}
                                src={relatedProduct.HinhAnh1}
                                style={{
                                  maxHeight: "100%",
                                  maxWidth: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          }
                          onClick={() => handleProductClick(relatedProduct._id)}
                        >
                          <Card.Meta
                            title={
                              <Text
                                strong
                                style={{
                                  fontSize: "14px",
                                  whiteSpace: "normal",
                                  lineHeight: "1.4",
                                }}
                              >
                                {relatedProduct.TenSP}
                              </Text>
                            }
                            description={
                              <Space direction="vertical" size={4}>
                                <div
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    backgroundColor:
                                      relatedProduct.Mau1 !== "Hết Hàng"
                                        ? relatedProduct.Mau1
                                        : "gray",
                                    border: "2px solid #1890ff",
                                  }}
                                />
                              </Space>
                            }
                          />
                        </Card>
                      ))}
                    </div>

                    {showRelatedRightArrow && (
                      <Button
                        shape="circle"
                        icon={<FaChevronRight />}
                        onClick={() => scrollRelatedProducts("right")}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "50%",
                          transform: "translate(100%, -50%)",
                          zIndex: 2,
                        }}
                      />
                    )}
                  </div>
                </>
              )}
            </Flex>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title={<Title level={4}>Thông tin chi tiết sản phẩm</Title>}>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
              labelStyle={{
                width: "220px",
                whiteSpace: "nowrap",
                padding: "8px",
                textAlign: "left",
              }}
              contentStyle={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                padding: "8px",
              }}
            >
              <Descriptions.Item label="Hệ điều hành">
                {product.HDH || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Chip xử lý">
                {product.CPU || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Camera sau">
                {product.CamSau || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Camera trước">
                {product.CamTruoc || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Màn hình">
                {product.ManHinh || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Cổng sạc">
                {product.CapSac || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Loại pin">
                {product.LoaiPin || "Không có thông tin"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Chọn sản phẩm để so sánh"
        open={compareModalVisible}
        footer={null}
        width={800}
        onCancel={() => setCompareModalVisible(false)}
      >
        <Flex justify="flex-end" style={{ marginBottom: 16 }}>
          <Space>
            <Button onClick={() => setCompareModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" onClick={handleCompare}>
              So sánh
            </Button>
          </Space>
        </Flex>
        {selectedCompareProducts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Sản phẩm đã chọn: </Text>
            <Space wrap>
              {selectedCompareProducts.map((productId) => {
                const selectedProduct = compareProducts.find(
                  (p) => p._id === productId
                );
                return (
                  <Tag
                    key={productId}
                    closable
                    onClose={() => toggleCompareProduct(productId)}
                    color="blue"
                  >
                    {selectedProduct?.TenSP}
                  </Tag>
                );
              })}
            </Space>
          </div>
        )}

        <Input
          placeholder="Tìm kiếm sản phẩm theo tên"
          value={searchTerm}
          onChange={handleSearch}
          style={{ marginBottom: 16 }}
        />
        <Row gutter={[16, 16]}>
          {filteredCompareProducts.length > 0 ? (
            filteredCompareProducts.map((product) => (
              <Col key={product._id} xs={12} sm={8}>
                <Card
                  hoverable
                  onClick={() => toggleCompareProduct(product._id)}
                  style={{
                    border: selectedCompareProducts.includes(product._id)
                      ? "2px solid #1890ff"
                      : "1px solid #e8e8e8",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  cover={
                    <div
                      style={{
                        height: 150,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        alt={product.TenSP}
                        src={product.HinhAnh1}
                        style={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={product.TenSP}
                    description={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Text type="danger">
                          {formatCurrency(product.GiaSP1)}
                        </Text>
                        <Text>{product.BoNhoTrong1}</Text>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Text type="secondary">Không tìm thấy sản phẩm nào.</Text>
            </Col>
          )}
        </Row>
      </Modal>

      {allProducts.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title={<Title level={4}>Tất cả sản phẩm</Title>}>
              <div style={{ position: "relative" }}>
                {showLeftArrow && (
                  <Button
                    shape="circle"
                    icon={<FaChevronLeft />}
                    onClick={() => scrollProducts("left")}
                    style={{ position: "absolute", left: -20, top: "50%" }}
                  />
                )}
                <div
                  ref={productListRef}
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    paddingBottom: 16,
                  }}
                  className="scrollbar-hidden"
                >
                  {allProducts.map((product) => {
                    const { memory, price } = getDisplayMemoryAndPrice(product);
                    return (
                      <Card
                        key={product._id}
                        hoverable
                        style={{ minWidth: 250, marginRight: 16 }}
                        cover={
                          <img alt={product.TenSP} src={product.HinhAnh1} />
                        }
                        onClick={() => handleProductClick(product._id)}
                      >
                        <Card.Meta
                          title={product.TenSP}
                          description={
                            <>
                              {memory === "Liên hệ" ? (
                                <Text type="danger">Liên hệ</Text>
                              ) : (
                                <>
                                  <Text type="danger">
                                    {formatCurrency(price)}
                                  </Text>
                                  <br />
                                  <Text>{memory}</Text>
                                </>
                              )}
                            </>
                          }
                        />
                      </Card>
                    );
                  })}
                </div>
                {showRightArrow && (
                  <Button
                    shape="circle"
                    icon={<FaChevronRight />}
                    onClick={() => scrollProducts("right")}
                    style={{ position: "absolute", right: -20, top: "50%" }}
                  />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title={<Title level={4}>Bình Luận</Title>}>
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item
                name="NoiDung"
                label="Nội dung bình luận"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập nội dung bình luận",
                  },
                ]}
              >
                <Input.TextArea rows={4} placeholder="Viết nội dung" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Gửi bình luận
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={24}>
          <Card title={<Title level={4}>Đánh giá từ khách hàng</Title>}>
            {comments.length > 0 ? (
              comments.slice(0, displayedComments).map((comment, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Space>
                      <Text strong>{comment.Email}</Text>
                      <Text type="secondary">
                        {new Date(comment.NgayBL).toLocaleDateString("vi-VN")}
                      </Text>
                    </Space>
                    <Paragraph>{comment.NoiDung}</Paragraph>
                    {comment.Reply && (
                      <div
                        style={{
                          backgroundColor: "#f5f5f5",
                          padding: "8px",
                          borderRadius: "4px",
                          marginTop: "8px",
                        }}
                      >
                        <Space direction="vertical">
                          <Space>
                            <Text strong style={{ color: "#1890ff" }}>
                              {comment.Reply.AdminEmail} (Admin)
                            </Text>
                            <Text type="secondary">
                              {new Date(comment.Reply.Date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Text>
                          </Space>
                          <Paragraph>{comment.Reply.Content}</Paragraph>
                        </Space>
                      </div>
                    )}
                  </Space>
                  <Divider />
                </div>
              ))
            ) : (
              <Text type="secondary">Chưa có đánh giá nào được duyệt.</Text>
            )}
            {comments.length > displayedComments && (
              <Button type="link" onClick={handleShowMore}>
                Xem thêm đánh giá
              </Button>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const style = document.createElement("style");
style.innerHTML = `
  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hidden {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .ant-card-hoverable:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;
document.head.appendChild(style);

export default ProductDetail;