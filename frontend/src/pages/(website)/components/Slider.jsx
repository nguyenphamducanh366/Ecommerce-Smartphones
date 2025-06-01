import React, { useState, useEffect } from "react";
import Socket from "../socket/Socket";
import { fetchBanners } from "../../../service/api";

const Slider = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm tải dữ liệu banner
  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await fetchBanners();
      console.log("Dữ liệu nhận từ API:", response.data);

      // Lọc các banner có `status` là true và tạo slides
      const banners = response.data || [];
      const activeBanners = banners.filter((banner) => banner.status === true);
      const newSlides = activeBanners.map((banner, index) => ({
        id: index + 1,
        img: banner.imgUrl,
      }));

      if (newSlides.length === 0) {
        setError("Không có banner nào để hiển thị.");
      } else {
        setSlides(newSlides);
        setCurrentIndex(0);
      }
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải banner:", err);
      setError("Không thể tải banner.");
      setLoading(false);
    }
  };

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    loadBanners();
  }, []);

  // Lắng nghe sự kiện bannerUpdated từ Socket.IO
  useEffect(() => {
    Socket.on("bannerUpdated", (updatedBanner) => {
      console.log("Banner được cập nhật:", updatedBanner);
      loadBanners(); // Tải lại danh sách banner
    });

    // Dọn dẹp listener khi component unmount
    return () => {
      Socket.off("bannerUpdated");
    };
  }, []);

  // Logic chuyển slide tự động
  useEffect(() => {
    if (!slides || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [slides]);

  const nextSlide = () => {
    if (!slides || slides.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    if (!slides || slides.length <= 1) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        Đang tải banner...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-red-500">
        {error}
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        Không có banner để hiển thị.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg mb-6">
      {/* Hiển thị ảnh */}
      <img
        src={slides[currentIndex].img}
        className="w-full h-[500px] object-contain transition-transform duration-500"
        alt={`Banner ${slides[currentIndex].id}`}
      />

      {/* Nút điều hướng */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 text-black text-4xl cursor-pointer bg-white p-2 rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-black text-4xl cursor-pointer bg-white p-2 rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity"
      >
        ›
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-blue-600" : "bg-gray-300"
            } transition-all cursor-pointer`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
