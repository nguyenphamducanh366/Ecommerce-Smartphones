import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBrandById } from "../../../service/api";

const BrandDetail = () => {
  const [brand, setBrand] = useState(null); // Lưu thông tin thương hiệu
  const { id } = useParams(); // Lấy ID từ URL

  // Lấy thông tin chi tiết thương hiệu
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getBrandById(id); // Gọi API lấy chi tiết
        setBrand(data.data); // Lưu dữ liệu vào state
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết thương hiệu:", error);
      }
    })();
  }, [id]);

  if (!brand) {
    return <p>Đang tải dữ liệu...</p>; // Hiển thị khi dữ liệu chưa sẵn sàng
  }

  return (
    <div>
      <h1 className="h3 mb-2 text-gray-800">Chi tiết thương hiệu</h1>
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            Thông tin thương hiệu
          </h6>
        </div>
        <div className="card-body">
          <p>
            <strong>Mã thương hiệu:</strong> {brand._id}
          </p>
          <p>
            <strong>Tên thương hiệu:</strong> {brand.TenTH}
          </p>
          <p>
            <strong>Hình ảnh:</strong> <br />
            <img
              src={brand.HinhAnh}
              alt={brand.TenTH}
              style={{ width: "200px" }}
            />
          </p>
          <p>
            <strong>Mô tả:</strong> {brand.Mota}
          </p>
          <Link to="/admin/brands" className="btn btn-primary mt-3">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrandDetail;
