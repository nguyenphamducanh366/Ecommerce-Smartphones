import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserById } from "../../../service/api";

const AccountDetails = () => {
  const [userData, setUserData] = useState({
    HoVaTen: "",
    Avata: "",
    SDT: "",
    Email: "",
    DiaChi: "",
    NgaySinh: "",
    TaiKhoan: "",
    GioiTinh: "",
  });
  const { id } = useParams();

  useEffect(() => {
    // Fetch user data when the component mounts
    const fetchUserData = async () => {
      try {
        const response = await getUserById(id);
        if (response.data) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-1/4 bg-white p-4 rounded-lg shadow-md mr-4">
            <div className="flex items-center mb-4">
              <span className="text-black font-semibold">{userData.Email}</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/account-details/${id}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fa fa-user mr-2"></i>
                  <span>Thông tin tài khoản</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/account/${id}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fa fa-edit mr-2"></i>
                  <span>Update tài khoản</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/profile-receipt/${id}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-money-check mr-2"></i>
                  <span>Thông tin đơn hàng</span>
                </Link>
              </li>
              <li className="flex items-center p-2 hover:bg-gray-200 rounded">
                <Link
                  to={`/profile-reset-password/${id}`}
                  className="flex items-center gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <i className="fas fa-lock mr-2"></i>
                  <span>Thay đổi mật khẩu</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Container */}
          <div className="w-3/4 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-light mb-6">Thông tin tài khoản</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ảnh đại diện
                </label>
                {userData.Avata && (
                  <img
                    src={userData.Avata}
                    alt="Avatar preview"
                    className="mt-2"
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      borderRadius: "10px",
                    }}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên Tài Khoản
                </label>
                <p className="w-full p-2 border border-gray-300 rounded bg-gray-100">
                  {userData.TaiKhoan}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Họ & tên
                </label>
                <p className="w-full p-2 border border-gray-300 rounded bg-gray-100">
                  {userData.HoVaTen}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <p className="w-full p-2 border border-gray-300 rounded bg-gray-100">
                  {userData.Email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số điện thoại
                </label>
                <p className="w-full p-2 border border-gray-300 rounded bg-gray-100">
                  0{userData.SDT}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Địa chỉ giao hàng
                </label>
                <p className="w-full p-2 border border-gray-300 rounded bg-gray-100">
                  {userData.DiaChi}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Giới tính
                </label>
                <p className="w-full p-2 border border-gray-300 rounded bg-gray-100">
                  {userData.GioiTinh}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
