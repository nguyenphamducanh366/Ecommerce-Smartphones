import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 p-4">
          {/* Thông tin hỗ trợ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin hỗ trợ</h3>
            <div className="mb-4">
              <span className="text-blue-500">
                <i className="fa fa-phone mr-2"></i>
              </span>
             0332417843
            </div>
            <div>
              <span className="text-blue-500">
                <i className="fa fa-envelope mr-2"></i>
              </span>
             nguyenphamducanh366@gmail.com
            </div>
          </div>

          {/* Tiện ích */}
          <div>
            <h3 className="text-lg font-semibold mb-4 ml-4">Tiện ích</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-500">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-blue-500">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-blue-500">
                  Thông tin
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-blue-500">
                  Bài viết
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-blue-500">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Chính sách */}
          <div>
            <h3 className="text-lg font-semibold mb-4 ml-4">Chính sách</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/payment" className="text-gray-600 hover:text-blue-500">
                  Thanh toán
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-600 hover:text-blue-500">
                  Hủy, trả hàng
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 hover:text-blue-500">
                  Giao hàng và vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-blue-500">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên lạc với chúng tôi */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Liên lạc với chúng tôi
            </h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/nguyen.pham.duc.anh.2024" target="blank" className="text-gray-600 hover:text-blue-500">
                <i className="fa fa-facebook text-2xl" />
              </a>
              <a href="https://www.linkedin.com/in/duc-anh-nguyen-pham-b33b3b366/" target="blank" className="text-gray-600 hover:text-blue-500">
                <i className="fa fa-linkedin text-2xl"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tiny Footer */}
      <div className="bg-gray-800 py-4 mt-12">
        <div className="container mx-auto text-center text-white">
          <div className="flex justify-center space-x-6 mb-4">
            <a href="#" className="text-white hover:text-yellow-400">
              <i className="fa fa-cc-paypal text-2xl"></i>
            </a>
            <a href="#" className="text-white hover:text-yellow-400">
              <i className="fa fa-cc-mastercard text-2xl"></i>
            </a>
            <a href="#" className="text-white hover:text-yellow-400">
              <i className="fa fa-cc-visa text-2xl"></i>
            </a>
            <a href="#" className="text-white hover:text-yellow-400">
              <i className="fa fa-cc-discover text-2xl"></i>
            </a>
          </div>
          <p className="text-sm">
            Copyright © All Rights Reserved 2025 by{" "}
            <a href="#" target="_blank" className="text-yellow-500">
                          nguyenphamducanh366@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
