import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { updateUser, getUserById } from "../../../service/api";

const SideBar = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (userData?.id) {
          const response = await getUserById(userData.id);
          setUserRole(response.data.MaQuyen);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [userData?.id]);

  const handleLogout = async () => {
    const authToken = localStorage.getItem("authToken");
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      await updateUser(userData.id, { TrangThai: 0 });
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "/admin/login";
  };

  if (loading) {
    return (
      <div
        className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
        id="accordionSidebar"
      ></div>
    );
  }

  const checkQuyen = userRole === 2;
  const isAdmin = userRole === 1;

  return (
    <>
      {/* Sidebar */}
      <ul
        className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
        id="accordionSidebar"
      >
        {/* Sidebar - Brand */}
        <Link
          className="sidebar-brand d-flex align-items-center justify-content-center"
          to="/admin/dashboard"
        >
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink" />
          </div>
          <div className="sidebar-brand-text mx-3">
            SP Admin <sup>2</sup>
          </div>
        </Link>
        {/* Admin Email */}
        <div className="sidebar-user px-3 py-2 text-center">
          <span className="text-white small">{userData?.Email}</span>
        </div>
        {/* Divider */}
        <hr className="sidebar-divider my-0" />
        {/* Nav Item - Trang chủ */}
        <li className="nav-item active">
          <Link className="nav-link" to="/admin/dashboard">
            <i className="fas fa-fw fa-tachometer-alt" />
            <span>Trang chủ</span>
          </Link>
        </li>

        {isAdmin ? (
          <>
            {/* Divider */}
            <hr className="sidebar-divider" />
            {/* Heading */}
            <div className="sidebar-heading">Chức năng</div>

            {/* Quản lý sản phẩm */}
            <li className="nav-item">
              <Link className="nav-link collapsed" to="/admin/products">
                <i className="fas fa-fw fa-wrench" />
                <span>Quản lý sản phẩm</span>
              </Link>
            </li>
            {/* Quản lý thương hiệu */}
            <li className="nav-item">
              <Link className="nav-link collapsed" to="/admin/brands">
                <i className="bi bi-slack"></i>
                <span>Quản lý thương hiệu</span>
              </Link>
            </li>
            {/* Quản lý hóa đơn */}
            <li className="nav-item">
              <Link className="nav-link" to="/admin/orders">
                <i className="bi bi-boxes"></i>
                <span>Quản lý hóa đơn</span>
              </Link>
            </li>
            {/* Quản lý voucher Admin */}
            <li className="nav-item">
              <Link to="/admin/vouchers" className="nav-link collapsed">
                <i className="bi bi-ticket-perforated"></i>
                <span>Quản lý voucher</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/listbanner" className="nav-link collapsed">
                <i className="bi bi-ticket-perforated"></i>
                <span>Quản lý Banner</span>
              </Link>
            </li>


            <li className="nav-item">
              <Link className="nav-link collapsed" to="/danhgia">
                <i className="fas fa-fw fa-comments" />
                <span>Quản lý đánh giá</span>
              </Link>
            </li>

            {/* Quản lý bình luận */}
            <li className="nav-item">
              <Link className="nav-link collapsed" to="/admin/comments">
                <i className="fas fa-fw fa-comments" />
                <span>Quản lý bình luận</span>
              </Link>
            </li>
            {/* Quản lý tài khoản */}
            <li className="nav-item">
              <Link className="nav-link collapsed" to="/admin/accounts">
                <i className="fas fa-fw fa-user" />
                <span>Quản lý tài khoản</span>
              </Link>
            </li>
          </>
        ) : checkQuyen ? (
          <>
            <hr className="sidebar-divider" />
            <div className="sidebar-heading">Chức năng</div>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/orders">
                <i className="bi bi-boxes"></i>
                <span>Quản lý hóa đơn</span>
              </Link>
            </li>
          </>
        ) : null}

        <div className="text-center d-none d-md-inline">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white transition"
          >
            Đăng xuất
          </button>
        </div>
      </ul>
    </>
  );
};

export default SideBar;
