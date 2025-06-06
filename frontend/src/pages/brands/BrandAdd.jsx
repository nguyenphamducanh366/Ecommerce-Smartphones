import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { message } from "antd";
import { createBrand, fetchCategories, fetchBrands, uploadImage } from "../../../service/api"; // Added fetchBrands

const BrandAdd = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm();
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [existingBrands, setExistingBrands] = useState([]);
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
      (brand) => brand.TenTH.toLowerCase() === name.toLowerCase()
    );
    return isDuplicate ? "Tên thương hiệu đã tồn tại" : true;
  };

  const onSubmit = async (data) => {
    const brandData = {
      ...data,
      HinhAnh: imageUrl,
    };

    try {
      await createBrand(brandData);
      message.success("Thêm thương hiệu thành công!");
      navigate("/admin/brands");
    } catch (error) {
      message.error("Thêm thương hiệu thất bại!");
      console.error(error.response);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res.data.data); // Save categories into state
      } catch (error) {
        console.error(error);
      }
    };
    loadCategories();
  }, []);

  return (
    <>
    <div>
      <h1 className="h3 mb-2 text-gray-800">Thêm Thương Hiệu</h1>
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Thêm thương hiệu</h6>
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
                  validate: (value) => checkDuplicateBrandName(value) === true || checkDuplicateBrandName(value),
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
                required
              />
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  style={{ marginTop: '10px', maxWidth: '150px' }}
                />
              )}
              <input
                type="hidden"
                {...register("HinhAnh", { required: "Vui lòng tải lên hình ảnh" })}
              />
              <small className="text-danger">{errors.HinhAnh?.message}</small>
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
                Thêm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
    
  );
};

export default BrandAdd;
