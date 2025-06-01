import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaShoppingCart,
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
  FaUserPlus,
  FaBoxOpen,
} from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { updateUser, getUserById, fetchProducts } from "../../../service/api";
import { Typography, message } from "antd";
import io from "socket.io-client";

const { Text } = Typography;

// Kết nối Socket.IO
const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
});

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // State cho tìm kiếm
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // Kiểm tra đăng nhập và lấy thông tin người dùng
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const storedUserData = localStorage.getItem("userData");

    if (authToken && storedUserData) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Lấy số lượng sản phẩm trong giỏ hàng khi component được tạo
  useEffect(() => {
    const updateCartCount = () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const userId = userData?.id;

      if (userId) {
        const cartItems =
          JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
        setCartCount(cartItems.length);
      }
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Lấy danh sách sản phẩm cho tìm kiếm
  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchProducts();
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setProducts(data);
      } catch (error) {
        message.error("Lỗi khi tải danh sách sản phẩm!");
        console.error("Error fetching products:", error);
      }
    };

    getProducts();
  }, []);

  // Lắng nghe sự kiện từ Socket.IO
  useEffect(() => {
    // Cập nhật sản phẩm khi có sản phẩm mới được tạo
    socket.on("productCreated", (newProduct) => {
      console.log("Sản phẩm mới được thêm:", newProduct);
      setProducts((prevProducts) => [newProduct, ...prevProducts]);
    });

    // Cập nhật sản phẩm khi có sản phẩm được chỉnh sửa
    socket.on("productUpdated", (updatedProduct) => {
      console.log("Sản phẩm được cập nhật:", updatedProduct);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );
    });

    // Dọn dẹp listener khi component unmount
    return () => {
      socket.off("productCreated");
      socket.off("productUpdated");
    };
  }, []);

  // Xử lý nhấp ra ngoài để ẩn gợi ý
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

  // Xử lý đăng xuất
  const handleLogout = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      await updateUser(userData.id, { TrangThai: 0 });
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserData(null);
    setCartCount(0);
    window.location.href = "/";
  };

  const checkUserExists = async (userId) => {
    try {
      const user = await getUserById(userId);
      return user.data;
    } catch (error) {
      return null;
    }
  };

  // Kiểm tra trạng thái đăng nhập và tự động đăng xuất nếu người dùng không tồn tại
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const storedUserData = localStorage.getItem("userData");

    if (authToken && storedUserData) {
      setIsLoggedIn(true);
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);

      const interval = setInterval(async () => {
        const user = await checkUserExists(parsedUserData.id);
        if (!user) {
          handleAutoLogout();
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleAutoLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("cart");
    setIsLoggedIn(false);
    setUserData(null);
    setCartCount(0);
    window.location.href = "/login";
  };

  // Xử lý khi bấm vào giỏ hàng
  const handleCartClick = (e) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      e.preventDefault();
      confirmAlert({
        title: "Yêu cầu đăng nhập",
        message: "Bạn cần đăng nhập để xem giỏ hàng.",
        buttons: [
          {
            label: "Đăng nhập",
            onClick: () => navigate("/login"),
          },
          {
            label: "Hủy",
            onClick: () => {},
          },
        ],
      });
    }
  };

  // Hàm lấy bộ nhớ và giá đầu tiên hợp lệ
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

  // Lọc sản phẩm dựa trên searchQuery
  const filteredProducts = products.filter((product) =>
    product.TenSP.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="shadow-md bg-white">
      {/* Top Bar */}
      <div className="bg-gray-100 py-2">
        <div className="container mx-auto px-6 flex justify-between text-sm text-gray-600">
          <p className="hidden lg:block">
            📍 Số 9, Trịnh Văn Bô, Nam Từ Liêm, Hà Nội
          </p>
          <p>📞 +084-123-4567 | 📩 nhom1@laptrinhweb.com</p>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div>
          <Link to="/">
            <img src="./src/img/logo.png" alt="Logo" className="w-32" />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-grow mx-4 relative" ref={searchRef}>
          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-grow bg-transparent outline-none px-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            <button className="text-gray-600 hover:text-blue-600">
              <FaSearch size={18} />
            </button>
          </div>
          {/* Danh sách gợi ý */}
          {searchQuery && isSearchFocused && filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
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

        {/* User Dropdown */}
        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-600 hover:text-blue-600 transition duration-200">
                {userData?.Email}
              </span>
            </div>
          ) : (
            <FaUser
              size={22}
              className="text-gray-600 hover:text-blue-600 transition duration-200"
            />
          )}

          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute right-0 w-64 bg-white shadow-lg rounded-lg overflow-hidden z-10 border border-gray-200"
            >
              <ul className="py-2 text-gray-700 text-sm">
                {isLoggedIn ? (
                  <>
                    <li>
                      <Link
                        to={`/account-details/${userData.id}`}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-600 hover:text-white transition duration-200 whitespace-nowrap"
                        style={{ textDecoration: "none" }}
                      >
                        <FaUser className="flex-shrink-0" />
                        <span>Thông tin tài khoản</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={`/sanphamdamua`}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-purple-600 hover:text-white transition duration-200 whitespace-nowrap"
                        style={{ textDecoration: "none" }}
                      >
                        <FaBoxOpen className="flex-shrink-0" />
                        <span>Sản phẩm đã mua</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white transition duration-200 whitespace-nowrap"
                        style={{ textDecoration: "none" }}
                      >
                        <FaSignOutAlt className="flex-shrink-0" />
                        <span>Đăng xuất</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-500 hover:text-white transition whitespace-nowrap"
                        style={{ textDecoration: "none" }}
                      >
                        <FaSignInAlt className="flex-shrink-0" />
                        <span>Đăng nhập</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/signup"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-green-500 hover:text-white transition whitespace-nowrap"
                        style={{ textDecoration: "none" }}
                      >
                        <FaUserPlus className="flex-shrink-0" />
                        <span>Đăng ký</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Cart Icon */}
        <Link
          to="/cart"
          className="relative text-gray-600 hover:text-blue-600 ml-3"
          onClick={handleCartClick}
        >
          <FaShoppingCart size={20} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
            {cartCount}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="bg-blue-600">
        <div className="container mx-auto px-6">
          <ul className="flex space-x-6 text-white text-lg">
            <li>
              <Link
                to="/"
                className="py-3 inline-block text-white hover:bg-blue-700 rounded transition duration-300"
                style={{ textDecoration: "none" }}
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className="py-3 inline-block text-white hover:bg-blue-700 rounded transition duration-300"
                style={{ textDecoration: "none" }}
              >
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="py-3 inline-block text-white hover:bg-blue-700 rounded transition duration-300"
                style={{ textDecoration: "none" }}
              >
                Thông tin
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="py-3 inline-block text-white hover:bg-blue-700 rounded transition duration-300"
                style={{ textDecoration: "none" }}
              >
                Bài viết
              </Link>
            </li>
            <li>
              <Link
                to="/listdanhgiauser"
                className="py-3 inline-block text-white hover:bg-blue-700 rounded transition duration-300"
                style={{ textDecoration: "none" }}
              >
                Đánh giá
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="py-3 inline-block text-white hover:bg-blue-700 rounded transition duration-300"
                style={{ textDecoration: "none" }}
              >
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;