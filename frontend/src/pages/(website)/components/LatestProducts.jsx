import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../../service/api";
import { Spin, message, Card, Typography, Empty } from "antd";
import { FireOutlined } from "@ant-design/icons";
import Socket from "../socket/Socket";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const { Title, Text } = Typography;
const { Meta } = Card;

const LatestProducts = ({ onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getLatestProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      const filteredProducts = data.filter(
        (product) =>
          product.TenSP.toLowerCase().includes("iphone") &&
          !(
            product.SoLuong1 === 0 &&
            product.SoLuong2 === 0 &&
            product.SoLuong3 === 0 &&
            product.SoLuong4 === 0 &&
            product.SoLuong5 === 0 &&
            product.SoLuong6 === 0
          )
      );

      const sortedProducts = filteredProducts
        .sort((a, b) => b._id.localeCompare(a._id))
        .slice(0, 8);

      setProducts(sortedProducts);
    } catch (error) {
      message.error("Lỗi khi lấy sản phẩm mới nhất!");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLatestProducts();

    Socket.on("productCreated", (newProduct) => {
      setProducts((prevProducts) => {
        const isIphone = newProduct.TenSP.toLowerCase().includes("iphone");
        const isInStock = !(
          newProduct.SoLuong1 === 0 &&
          newProduct.SoLuong2 === 0 &&
          newProduct.SoLuong3 === 0 &&
          newProduct.SoLuong4 === 0 &&
          newProduct.SoLuong5 === 0 &&
          newProduct.SoLuong6 === 0
        );

        if (isIphone && isInStock) {
          const updatedProducts = [newProduct, ...prevProducts];
          return updatedProducts
            .sort((a, b) => b._id.localeCompare(a._id))
            .slice(0, 8);
        }

        return prevProducts;
      });
    });

    Socket.on("productUpdated", (updatedProduct) => {
      setProducts((prevProducts) => {
        let updatedProducts = [...prevProducts];
        const isIphone = updatedProduct.TenSP.toLowerCase().includes("iphone");
        const isInStock = !(
          updatedProduct.SoLuong1 === 0 &&
          updatedProduct.SoLuong2 === 0 &&
          updatedProduct.SoLuong3 === 0 &&
          updatedProduct.SoLuong4 === 0 &&
          updatedProduct.SoLuong5 === 0 &&
          updatedProduct.SoLuong6 === 0
        );
        const productIndex = updatedProducts.findIndex(
          (p) => p._id === updatedProduct._id
        );

        if (productIndex !== -1) {
          if (isIphone && isInStock) {
            updatedProducts[productIndex] = updatedProduct;
          } else {
            updatedProducts.splice(productIndex, 1);
          }
        } else if (isIphone && isInStock && updatedProducts.length < 8) {
          updatedProducts.unshift(updatedProduct);
        }

        return updatedProducts
          .sort((a, b) => b._id.localeCompare(a._id))
          .slice(0, 8);
      });
    });

    return () => {
      Socket.off("productCreated");
      Socket.off("productUpdated");
    };
  }, []);

  const swiperConfig = {
    slidesPerView: Math.min(products.length || 1, 4),
    slidesPerGroup: 1,
    spaceBetween: 20,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    loop: products.length >= 5,
    autoplay: { delay: 2500, disableOnInteraction: false },
    modules: [Navigation, Autoplay],
    breakpoints: {
      640: { slidesPerView: Math.min(products.length || 1, 2) },
      768: { slidesPerView: Math.min(products.length || 1, 3) },
      1024: { slidesPerView: Math.min(products.length || 1, 4) },
    },
  };

  const getFirstValidMemoryAndPrice = (product) => {
    const memories = [
      product.BoNhoTrong1,
      product.BoNhoTrong2,
      product.BoNhoTrong3,
      product.BoNhoTrong4,
      product.BoNhoTrong5,
      product.BoNhoTrong6,
    ];
    const prices = [
      product.GiaSP1,
      product.GiaSP2,
      product.GiaSP3,
      product.GiaSP4,
      product.GiaSP5,
      product.GiaSP6,
    ];

    for (let i = 0; i < memories.length; i++) {
      if (memories[i] && memories[i].toLowerCase() !== "không có") {
        return { memory: memories[i], price: prices[i] };
      }
    }
    return { memory: null, price: null };
  };

  return (
    <div className="w-full py-12 bg-gradient-to-b from-gray-50 to-gray-100">
      <style jsx>{`
        .custom-swiper-button {
          width: 40px;
          height: 40px;
          background-color: #2563eb;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          opacity: 0.9;
          z-index: 10;
        }

        .custom-swiper-button:hover {
          background-color: #1e40af;
          opacity: 1;
          transform: scale(1.1);
        }

        .custom-swiper-button::after {
          font-size: 20px;
          font-weight: bold;
        }

        .swiper-button-prev.custom-swiper-button {
          left: 10px;
        }

        .swiper-button-next.custom-swiper-button {
          right: 10px;
        }

        .swiper-container-custom {
          position: relative;
          padding-left: 60px;
          padding-right: 60px;
        }

        @media (max-width: 768px) {
          .custom-swiper-button {
            width: 32px;
            height: 32px;
          }

          .custom-swiper-button::after {
            font-size: 16px;
          }

          .swiper-button-prev.custom-swiper-button {
            left: 5px;
          }

          .swiper-button-next.custom-swiper-button {
            right: 5px;
          }

          .swiper-container-custom {
            padding-left: 40px;
            padding-right: 40px;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4">
        <Title level={2} className="text-center mb-8 text-blue-600">
          <FireOutlined className="text-red-500 mr-2" />
          Sản phẩm iPhone mới
          <FireOutlined className="text-red-500 ml-2" />
        </Title>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="large" tip="Đang tải sản phẩm..." />
          </div>
        ) : products.length > 0 ? (
          <div className="swiper-container-custom">
            <Swiper {...swiperConfig}>
              {products.map((product) => {
                const { memory, price } = getFirstValidMemoryAndPrice(product);
                return (
                  <SwiperSlide key={product._id}>
                    {onProductClick ? (
                      <Card
                        hoverable
                        cover={
                          <div className="h-48 flex items-center justify-center bg-gray-50 p-4">
                            <img
                              alt={product.TenSP}
                              src={product.HinhAnh1}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        }
                        className="h-full border border-gray-200 hover:border-blue-300 transition-all"
                        onClick={() => onProductClick(product._id)}
                      >
                        <Meta
                          title={
                            <div className="text-center">
                              <Text
                                ellipsis={{ tooltip: product.TenSP }}
                                className="font-semibold text-blue-600"
                              >
                                {product.TenSP}
                              </Text>
                            </div>
                          }
                          description={
                            <div className="text-center">
                              <div className="mb-2">
                                <Text type="secondary" className="text-gray-600">
                                  {memory}
                                </Text>
                              </div>
                              <Text strong className="text-blue-600 text-lg">
                                {price
                                  ? new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(price)
                                  : "Liên hệ"}
                              </Text>
                            </div>
                          }
                        />
                      </Card>
                    ) : (
                      <Link
                        to={`/products/product_detail/${product._id}`}
                        className="block h-full"
                      >
                        <Card
                          hoverable
                          cover={
                            <div className="h-48 flex items-center justify-center bg-gray-50 p-4">
                              <img
                                alt={product.TenSP}
                                src={product.HinhAnh1}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          }
                          className="h-full border border-gray-200 hover:border-blue-300 transition-all"
                        >
                          <Meta
                            title={
                              <div className="text-center">
                                <Text
                                  ellipsis={{ tooltip: product.TenSP }}
                                  className="font-semibold text-blue-600"
                                >
                                  {product.TenSP}
                                </Text>
                              </div>
                            }
                            description={
                              <div className="text-center">
                                <div className="mb-2">
                                  <Text
                                    type="secondary"
                                    className="text-gray-600"
                                  >
                                    {memory}
                                  </Text>
                                </div>
                                <Text strong className="text-blue-600 text-lg">
                                  {price
                                    ? new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(price)
                                    : "Liên hệ"}
                                </Text>
                              </div>
                            }
                          />
                        </Card>
                      </Link>
                    )}
                  </SwiperSlide>
                );
              })}
              {/* Nút điều hướng tùy chỉnh */}
              <div className="swiper-button-prev custom-swiper-button"></div>
              <div className="swiper-button-next custom-swiper-button"></div>
            </Swiper>
          </div>
        ) : (
          <div className="col-span-full py-8">
            <Empty
              description={
                <Text type="secondary">Không có sản phẩm iPhone nào hiện có</Text>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestProducts;