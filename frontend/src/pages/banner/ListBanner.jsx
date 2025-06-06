import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteBanner, fetchBanners } from "../../../service/api";

const ListBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetchBanners();
      setBanners(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách banner:", error);
      alert("Không thể tải danh sách banner!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa banner này?");
    if (!confirm) return;

    try {
      const response = await deleteBanner(id);
      if (response && response.status === 200) {
        setBanners(banners.filter((banner) => banner._id !== id));
        alert("Xóa thành công!");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Xóa thất bại!";
      alert(message);
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Danh sách banner</h2>
        <Link to="/admin/banners/add">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            + Thêm mới
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 border">#</th>
              <th className="px-4 py-3 border">Hình ảnh</th>
              <th className="px-4 py-3 border">Trạng thái</th>
              <th className="px-4 py-3 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-6">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6">
                  Không có dữ liệu để hiển thị.
                </td>
              </tr>
            ) : (
              banners.map((banner, index) => (
                <tr key={banner._id} className="border-t">
                  <td className="px-4 py-3 border">{index + 1}</td>
                  <td className="px-4 py-3 border">
                    <img
                      src={banner.imgUrl || "/placeholder.jpg"}
                      alt="banner"
                      className="w-52 h-24 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 border">
                    {banner.status ? "Bật" : "Tắt"}
                  </td>
                  <td className="px-4 py-3 border">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/banners/edit/${banner._id}`}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListBanner;
