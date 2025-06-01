import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../../service/api";
import { Spin, message, Card, Typography } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Socket from "../socket/Socket";

const { Text } = Typography;
const { Meta } = Card;

const SellerProducts = ({ onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSellerProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      const filteredProducts = data.filter((product) => {
        const nameCondition = !product.TenSP.toLowerCase().includes("iphone");
        const quantity1 = product.SoLuong1 || 0;
        const quantity2 = product.SoLuong2 || 0;
        const quantity3 = product.SoLuong3 || 0;
        const quantity4 = product.SoLuong4 || 0;
        const quantity5 = product.SoLuong5 || 0;
        const quantity6 = product.SoLuong6 || 0;
        const quantityCondition = !(
          quantity1 === 0 &&
          quantity2 === 0 &&
          quantity3 === 0 &&
          quantity4 === 0 &&
          quantity5 === 0 &&
          quantity6 === 0
        );

        return nameCondition && quantityCondition;
      });

      setProducts(filteredProducts.slice(-8));
    } catch (error) {
      message.error("Lỗi khi lấy danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSellerProducts();

    // Lắng nghe sự kiện productCreated từ server
    Socket.on("productCreated", (newProduct) => {
      setProducts((prevProducts) => {
        const isNotIphone = !newProduct.TenSP.toLowerCase().includes("iphone");
        const isInStock = !(
          newProduct.SoLuong1 === 0 &&
          newProduct.SoLuong2 === 0 &&
          newProduct.SoLuong3 === 0 &&
          newProduct.SoLuong4 === 0 &&
          newProduct.SoLuong5 === 0 &&
          newProduct.SoLuong6 === 0
        );

        if (isNotIphone && isInStock) {
          const updatedProducts = [...prevProducts, newProduct];
          return updatedProducts.slice(-8);
        }

        return prevProducts;
      });
    });

    // Lắng nghe sự kiện productUpdated từ server
    Socket.on("productUpdated", (updatedProduct) => {
      setProducts((prevProducts) => {
        let updatedProducts = [...prevProducts];
        const isNotIphone = !updatedProduct.TenSP.toLowerCase().includes(
          "iphone"
        );
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
          if (isNotIphone && isInStock) {
            updatedProducts[productIndex] = updatedProduct;
          } else {
            updatedProducts.splice(productIndex, 1);
          }
        } else if (
          isNotIphone &&
          isInStock &&
          updatedProducts.length < 8
        ) {
          updatedProducts.push(updatedProduct);
          updatedProducts = updatedProducts.slice(-8);
        }

        return updatedProducts;
      });
    });

    // Dọn dẹp listener khi component unmount
    return () => {
      Socket.off("productCreated");
      Socket.off("productUpdated");
    };
  }, []);

  // Hàm tìm bộ nhớ và giá hợp lệ đầu tiên
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
    return { memory: null, price: null }; // Không xảy ra theo giả định
  };

  return (
    <div className="w-full py-12 bg-gradient-to-b from-gray-100 to-gray-200">
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
          z-index: 10; /* Đảm bảo nút nằm trên các phần tử khác */
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
          left: 10px; /* Tăng khoảng cách để tránh bị che */
        }

        .swiper-button-next.custom-swiper-button {
          right: 10px; /* Tăng khoảng cách để tránh bị che */
        }

        /* Container của Swiper */
        .swiper-container-custom {
          position: relative;
          padding-left: 60px; /* Tạo không gian cho nút trái */
          padding-right: 60px; /* Tạo không gian cho nút phải */
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
            padding-left: 40px; /* Giảm padding trên mobile */
            padding-right: 40px;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-blue-600">
          💎 Các sản phẩm khác 💎
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="large" tip="Đang tải sản phẩm..." />
          </div>
        ) : (
          <div className="swiper-container-custom">
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={1}
              spaceBetween={24}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              loop={products.length >= 4}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              className="w-full"
            >
              {products.length > 0 ? (
                products.map((product) => {
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
                                  <Text
                                    type="secondary"
                                    className="text-gray-600"
                                  >
                                    {memory}
                                  </Text>
                                </div>
                                <Text
                                  strong
                                  className="text-blue-600 text-lg"
                                >
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
                                  <Text
                                    strong
                                    className="text-blue-600 text-lg"
                                  >
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
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-lg">Không có sản phẩm nào.</p>
                </div>
              )}
              {/* Nút điều hướng tùy chỉnh */}
              <div className="swiper-button-prev custom-swiper-button"></div>
              <div className="swiper-button-next custom-swiper-button"></div>
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;