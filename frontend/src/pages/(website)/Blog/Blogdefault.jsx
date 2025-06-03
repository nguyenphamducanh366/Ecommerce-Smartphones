import React from "react";
import { useNavigate } from "react-router-dom";

const posts = [
  {
    id: 1,
    title: "Samsung Galaxy S25",
    date: "20 MARCH, 2025",
    author: "ADMIN",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-utra_19_.png",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất...",
    content: "Chi tiết về Samsung Galaxy S25. Đây là một sản phẩm tuyệt vời với nhiều tính năng nổi bật.",
    relatedPosts: [
      { title: "iPhone 14", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-14_1.png" },
      { title: "Vivo Y100", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/v/i/vivo-y100.png" },
      { title: "Xiaomi 15 Ultra 5G", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-15-ultra.png" },
    ],
    comments: [
      { name: "Nguyen Van B", text: "Tôi rất thích sản phẩm này!", date: "21 MARCH, 2025" },
      { name: "Nguyen Van C", text: "Sản phẩm này rất đáng mua!", date: "22 MARCH, 2025" },
      { name: "Nguyen Van A", text: "Bài viết rất hay!", date: "20 MARCH, 2025" },
    ],
  },
  {
    id: 2,
    title: "iPhone 14 Pro Max",
    date: "20 MARCH, 2025",
    author: "ADMIN",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-14_1.png",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất...",
    content: "Chi tiết về iPhone 14 Pro Max. Đây là một sản phẩm cao cấp với hiệu năng mạnh mẽ.",
    relatedPosts: [
      { title: "Samsung Galaxy S25", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-utra_19_.png" },
      { title: "Xiaomi 15 Ultra 5G", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-15_11_.png" },
      { title: "Vivo Y100", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/v/i/vivo-y100.png" },
    ],
    comments: [
      { name: "Nguyen Van D", text: "Hiệu năng rất mạnh mẽ!", date: "23 MARCH, 2025" },
      { name: "Nguyen Van C", text: "Sản phẩm rất tốt!", date: "22 MARCH, 2025" },
    ],
  },
  {
    id: 3,
    title: "Vivo Y100",
    date: "20 MARCH, 2025",
    author: "ADMIN",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/v/i/vivo-y100.png",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất...",
    content: "Chi tiết về Vivo Y100. Đây là một sản phẩm cao cấp với hiệu năng mạnh mẽ.",
    relatedPosts: [
      { title: "Oppo Find X6", image: "https://cdn.tgdd.vn/Files/2023/03/22/1519635/2-220323-215508-800-resize.jpg" },
      { title: "Samsung Galaxy S25", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-utra_19_.png" },
      { title: "Xiaomi 15 5G", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-15_11_.png" },
    ],
    comments: [
      { name: "Nguyen Van E", text: "Thiết kế rất đẹp!", date: "24 MARCH, 2025" },
    ],
  },
  {
    id: 4,
    title: "Xiaomi Redmi Note 14 Pro Plus 5G",
    date: "15 DECEMBER, 2020",
    author: "ADMIN",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14-pro-plus-den.png",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất...",
    content: "Chi tiết về Xiaomi Redmi Note 14 Pro Plus 5G. Đây là một sản phẩm cao cấp với hiệu năng mạnh mẽ.",
    relatedPosts: [
      { title: "Realme GT Neo 5", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/p/u/purple-be8e0ce5d0.png" },
      { title: "Samsung Galaxy S25", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-utra_19_.png" },
      { title: "Vivo Y100", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/v/i/vivo-y100.png" },
    ],
    comments: [
      { name: "Nguyen Van F", text: "Giá cả hợp lý!", date: "25 MARCH, 2025" },
    ],
  },
  {
    id: 5,
    title: "Xiaomi 15 Ultra 5G - Pro New 2025",
    date: "16 DECEMBER, 2020",
    author: "ADMIN",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-15-ultra.png",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất...",
    content: "Chi tiết về Xiaomi 15 Ultra 5G. Đây là một sản phẩm cao cấp với hiệu năng mạnh mẽ.",
    relatedPosts: [
      { title: "Google Pixel 7", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/v/_/v_by6.jpg" },
      { title: "Samsung Galaxy S25", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-utra_19_.png" },
      { title: "Vivo Y100", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/v/i/vivo-y100.png" },
    ],
    comments: [
      { name: "Nguyen Van G", text: "Camera rất tốt!", date: "26 MARCH, 2025" },
    ],
  },
  {
    id: 6,
    title: "Oppo Find X6 - Pro New 2025",
    date: "20 DECEMBER, 2020",
    author: "ADMIN",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-15_11_.png",
    description: "Mới, đầy đủ phụ kiện từ nhà sản xuất...",
    content: "Chi tiết về Oppo Find X6. Đây là một sản phẩm cao cấp với hiệu năng mạnh mẽ.",
    relatedPosts: [
      { title: "OnePlus 11", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/o/n/oneplus_11_-_green_-_rgb.jpg" },
      { title: "Samsung Galaxy S25", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-s25-utra_19_.png" },
      { title: "Vivo Y100", image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/v/i/vivo-y100.png" },
    ],
    comments: [
      { name: "Nguyen Van H", text: "Pin rất bền!", date: "27 MARCH, 2025" },
    ],
  },
];

const BlogGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-5 shadow-lg rounded-lg">
              <img
                src={post.image}
                alt={post.title}
                className="rounded-lg"
                style={{ width: "80%", height: "auto", display:"flex", justifyContent:"center", alignItems:"center" }}
              />
              <h3 className="mt-4 text-lg font-semibold">{post.title}</h3>
              <p className="text-gray-500 text-sm">
                {post.date} | BY {post.author}
              </p>
              <p className="mt-2 text-gray-700">{post.description}</p>

              
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => navigate(`/blog/${post.id}`, { state: { post } })}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                >
                  ĐỌC THÊM
                </button>
              </div>
            </div>
          ))}
        </div>
         {/* Pagination */}
         <div className="flex justify-center mt-6">
          <button className="px-3 py-1 bg-gray-300 text-gray-700 rounded-l">
            TRANG TRƯỚC
          </button>
          <button className="px-3 py-1 bg-orange-500 text-white mx-1">1</button>
          <button className="px-3 py-1 bg-gray-300 text-gray-700 mx-1">
            2
          </button>
          <button className="px-3 py-1 bg-gray-300 text-gray-700 mx-1">
            3
          </button>
          <button className="px-3 py-1 bg-gray-300 text-gray-700 rounded-r">
            TRANG SAU
          </button>
        </div>
      </div>
     
      
    </div>
    
  );
  
};

export default BlogGrid;