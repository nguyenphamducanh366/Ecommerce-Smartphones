import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../../service/api";
import { Spin, Card, Typography, Input, message } from "antd";
import { SearchOutlined, MobileOutlined } from "@ant-design/icons";
import Socket from "../socket/Socket";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const { Title, Text } = Typography;
const { Meta } = Card;

const List = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const getProducts = async () => {
    setLoading(true);
    try {
      const response = await fetchProducts();
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setProducts(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm!");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();

    Socket.on("productCreated", (newProduct) => {
      setProducts((prevProducts) => [newProduct, ...prevProducts]);
    });

    Socket.on("productUpdated", (updatedProduct) => {
      setProducts((prevProducts) => {
        const productIndex = prevProducts.findIndex((p) => p._id === updatedProduct._id);
        let updatedProducts = [...prevProducts];
        if (productIndex !== -1) {
          updatedProducts[productIndex] = updatedProduct;
        } else {
          updatedProducts = [updatedProduct, ...updatedProducts];
        }
        return updatedProducts;
      });
    });

    return () => {
      Socket.off("productCreated");
      Socket.off("productUpdated");
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getFirstValidMemoryAndPrice = (product) => {
    const memories = [
      product.BoNhoTrong1, product.BoNhoTrong2, product.BoNhoTrong3,
      product.BoNhoTrong4, product.BoNhoTrong5, product.BoNhoTrong6,
    ];
    const prices = [
      product.GiaSP1, product.GiaSP2, product.GiaSP3,
      product.GiaSP4, product.GiaSP5, product.GiaSP6,
    ];

    for (let i = 0; i < memories.length; i++) {
      if (memories[i] && memories[i].toLowerCase() !== "không có") {
        return { memory: memories[i], price: prices[i] };
      }
    }
    return { memory: null, price: null };
  };

  // Lọc sản phẩm dựa trên searchQuery
  const filteredProducts = products.filter((product) =>
    product.TenSP.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const swiperConfig = {
    slidesPerView: Math.min(filteredProducts.length || 1, 4),
    slidesPerGroup: 1,
    spaceBetween: 20,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    loop: filteredProducts.length >= 5,
    autoplay: { delay: 2500, disableOnInteraction: false },
    modules: [Navigation, Autoplay],
    breakpoints: {
      640: { slidesPerView: Math.min(filteredProducts.length || 1, 2) },
      768: { slidesPerView: Math.min(filteredProducts.length || 1, 3) },
      1024: { slidesPerView: Math.min(filteredProducts.length || 1, 4) },
    },
  };

  return (
    <div className="bg-gray-50 py-12">
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
        {/* Thanh tìm kiếm và gợi ý */}
        <div className="mb-6 flex justify-center relative" ref={searchRef}>
          {/* <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            allowClear
            size="large"
            style={{ width: "100%", maxWidth: "500px" }}
          /> */}
          {/* Danh sách gợi ý */}
          {searchQuery && isSearchFocused && filteredProducts.length > 0 && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-full max-w-[500px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => {
                const { price } = getFirstValidMemoryAndPrice(product);
                const isOutOfStock =
                  product.SoLuong1 === 0 &&
                  product.SoLuong2 === 0 &&
                  product.SoLuong3 === 0 &&
                  product.SoLuong4 === 0 &&
                  product.SoLuong5 === 0 &&
                  product.SoLuong6 === 0;

                return (
                  <Link
                    to={`/products/product_detail/${product._id}`}
                    key={product._id}
                    className="flex items-center p-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                    onClick={() => setIsSearchFocused(false)}
                  >
                    <img
                      src={product.HinhAnh1}
                      alt={product.TenSP}
                      className="w-12 h-12 object-contain mr-3"
                    />
                    <div className="flex-1">
                      <Text
                        ellipsis={{ tooltip: product.TenSP }}
                        className="text-gray-800 font-medium"
                      >
                        {product.TenSP}
                      </Text>
                      <div>
                        <Text
                          className={`text-sm ${
                            isOutOfStock ? "text-gray-500" : "text-blue-600"
                          }`}
                        >
                          {isOutOfStock
                            ? "Liên hệ"
                            : price
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(price)
                            : "Chưa có giá"}
                        </Text>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Title level={2} className="text-center mb-8 text-blue-600">
          <MobileOutlined className="text-red-500 mr-2" />
          Tất cả sản phẩm
          <MobileOutlined className="text-red-500 ml-2" />
        </Title>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="large" tip="Đang tải sản phẩm..." />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="swiper-container-custom">
            <Swiper {...swiperConfig}>
              {filteredProducts.map((product) => {
                const { memory, price } = getFirstValidMemoryAndPrice(product);
                const isOutOfStock =
                  product.SoLuong1 === 0 &&
                  product.SoLuong2 === 0 &&
                  product.SoLuong3 === 0 &&
                  product.SoLuong4 === 0 &&
                  product.SoLuong5 === 0 &&
                  product.SoLuong6 === 0;

                return (
                  <SwiperSlide key={product._id}>
                    <Link to={`/products/product_detail/${product._id}`} className="block h-full">
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
                                <Text type="secondary" className="text-gray-600">
                                  {memory}
                                </Text>
                              </div>
                              <Text
                                strong
                                className={`text-lg ${
                                  isOutOfStock ? "text-gray-500" : "text-blue-600"
                                }`}
                              >
                                {isOutOfStock
                                  ? "Liên hệ"
                                  : price
                                  ? new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(price)
                                  : "Chưa có giá"}
                              </Text>
                            </div>
                          }
                        />
                      </Card>
                    </Link>
                  </SwiperSlide>
                );
              })}
              {/* Nút điều hướng tùy chỉnh */}
              <div className="swiper-button-prev custom-swiper-button"></div>
              <div className="swiper-button-next custom-swiper-button"></div>
            </Swiper>
          </div>
        ) : (
          <div className="text-center py-8">
            <Text type="secondary">
              {searchQuery ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm nào"}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;