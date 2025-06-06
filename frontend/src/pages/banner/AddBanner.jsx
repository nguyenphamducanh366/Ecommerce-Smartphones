import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createBanner, fetchBanners, uploadImage } from "../../../service/api";

const BannerAdd = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingBanners, setExistingBanners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await fetchBanners();
        setExistingBanners(res.data.data);
      } catch (error) {
        console.error("Error loading banners:", error);
      }
    };
    loadBanners();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await uploadImage(formData);
      const url = response.data.imageUrl;
      setImageUrl(url);
      setValue("imgUrl", url);
      alert("Tải ảnh thành công");
    } catch (error) {
      alert("Tải ảnh thất bại");
    }
  };

  const onSubmit = async (data) => {
    const bannerData = {
      ...data,
      imgUrl: imageUrl,
    };

    try {
      setLoading(true);
      await createBanner(bannerData);
      alert("Thêm banner thành công!");
      navigate("/admin/banners");
    } catch (error) {
      console.error(error);
      alert("Thêm banner thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-semibold text-center mb-6 text-blue-600">
        Thêm Banner
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        {/* Upload hình ảnh */}
        <div>
          <label className="block font-medium mb-2">Hình ảnh <span className="text-red-500">*</span></label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full border border-gray-300 rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mt-4 w-60 h-32 object-cover rounded"
            />
          )}
          <input
            type="hidden"
            {...register("imgUrl", {
              required: "Vui lòng tải lên hình ảnh",
            })}
          />
          {errors.imgUrl && (
            <p className="text-red-500 text-sm mt-2">{errors.imgUrl.message}</p>
          )}
        </div>

        {/* Trạng thái */}
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register("status")}
              className="mr-2"
            />
            Kích hoạt
          </label>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-between">
          <Link
            to="/admin/banners"
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            ← Quay lại
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {loading ? "Đang thêm..." : "Thêm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerAdd;
