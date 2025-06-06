import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { message } from "antd";
import {
  getBrandById,
  updateBrand,
  uploadImage,
  fetchBrands,
} from "../../../service/api"; // Added fetchBrands

const BrandEdit = () => {
  const [existingBrands, setExistingBrands] = useState([]);
  const {
    reset,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await fetchBrands();
        setExistingBrands(res.data.data);
      } catch (error) {
        console.error("Error loading brands:", error);
      }
    };
    loadBrands();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await uploadImage(formData);
      setImageUrl(response.data.imageUrl);
      setValue("HinhAnh", response.data.imageUrl);
    } catch (error) {
      message.error("Tải ảnh lên thất bại");
    }
  };

  const checkDuplicateBrandName = (name) => {
    const isDuplicate = existingBrands.some(
      (brand) =>
        brand.TenTH.toLowerCase() === name.toLowerCase() && brand._id !== id
    );
    return isDuplicate ? "Tên thương hiệu đã tồn tại" : true;
  };
  useEffect(() => {
    (async () => {
      try {
        const [brandRes] = await Promise.all([getBrandById(id)]);
        setImageUrl(brandRes.data.data.HinhAnh);

        reset({
          TenTH: brandRes.data.data.TenTH,
          HinhAnh: brandRes.data.data.HinhAnh,
          Mota: brandRes.data.data.Mota,
        });
      } catch (error) {
        console.error("Error loading data:", error);
      }
    })();
  }, [id, reset]);

  const onSubmit = async (data) => {
    const brandData = {
      ...data,
      HinhAnh: imageUrl,
    };

    try {
      await updateBrand(id, brandData);
      message.success("Cập nhật thành công");
      navigate("/admin/brands");
    } catch (error) {
      message.error("Cập nhật thất bại");
      console.error("Error updating brand:", error.response);
    }
  };

  return (
    <div>
      <h1 className="h3 mb-2 text-gray-800">Chỉnh sửa thương hiệu</h1>
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            Cập nhật thông tin thương hiệu
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="TenTH">Tên thương hiệu</label>
              <input
                type="text"
                className="form-control"
                id="TenTH"
                {...register("TenTH", {
                  required: "Tên thương hiệu không được bỏ trống",
                  validate: (value) =>
                    checkDuplicateBrandName(value) === true ||
                    checkDuplicateBrandName(value),
                })}
              />
              <small className="text-danger">{errors.TenTH?.message}</small>
            </div>

            <div className="form-group">
              <label htmlFor="HinhAnh">Hình ảnh</label>
              <input
                type="file"
                className="form-control"
                onChange={handleImageUpload}
                accept="image/*"
              />
              {imageUrl && (
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Current"
                    style={{ maxWidth: "150px" }}
                  />
                  <div className="text-muted small mt-1">Ảnh hiện tại</div>
                </div>
              )}
              <input type="hidden" {...register("HinhAnh")} value={imageUrl} />
            </div>

            <div className="form-group">
              <label htmlFor="Mota">Mô tả</label>
              <input
                type="text"
                className="form-control"
                id="Mota"
                {...register("Mota", {
                  required: "Mô tả không được bỏ trống",
                })}
              />
              <small className="text-danger">{errors.Mota?.message}</small>
            </div>

            <div className="d-flex justify-content-between">
              <Link to="/admin/brands" className="btn btn-secondary">
                Quay lại
              </Link>
              <button type="submit" className="btn btn-success ml-3">
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrandEdit;
