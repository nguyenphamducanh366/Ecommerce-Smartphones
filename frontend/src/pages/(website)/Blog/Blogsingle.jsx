import React from "react";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="bg-white p-6 shadow-md rounded-md">
      <h2 className="text-xl font-bold">Thể Loại</h2>
      <ul className="mt-2">
        <li className="text-gray-700">Smartphones</li>
        <li className="text-gray-700">Android Phones</li>
        <li className="text-gray-700">IOS</li>
      </ul>
    
    </div>
  );
};

const Blogsingle = () => {
  const location = useLocation();
  const post = location.state?.post;

  if (!post) {
    return <p>Không tìm thấy bài viết!</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 flex gap-6">
      {/* Nội dung chính */}
      <div className="w-2/3">
        <div className="bg-white p-6 shadow-md rounded-md">
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p className="text-gray-500 text-sm">
            {post.date} | BY {post.author}
          </p>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-80 object-cover rounded-md mt-4"
          />
          <p className="mt-4 text-gray-700">{post.content}</p>
        </div>

        {/* Bài viết liên quan */}
        <div className="mt-8">
          <h2 className="text-xl font-bold">Bài viết liên quan</h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {post.relatedPosts.map((related, index) => (
              <div key={index} className="bg-white p-4 shadow-md rounded-md">
                <img
                  src={related.image}
                  alt={related.title}
                  className="w-full h-32 object-cover rounded-md"
                />
                <p className="mt-2 font-semibold">{related.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bình luận */}
        <div className="mt-8 bg-white p-6 shadow-md rounded-md">
          <h2 className="text-xl font-bold">
            Bình luận ({post.comments.length})
          </h2>
          <div className="mt-4">
            {post.comments.map((comment, index) => (
              <div key={index} className="border-b py-4">
                <p className="font-semibold">{comment.name}</p>
                <p className="text-gray-500 text-sm">{comment.date}</p>
                <p className="mt-2 text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Form bình luận */}
        <div className="mt-8 bg-white p-6 shadow-md rounded-md">
          <h2 className="text-xl font-bold">Để lại bình luận</h2>
          <input
            type="text"
            placeholder="Họ và tên"
            className="w-full p-2 border rounded-md mt-2"
          />
          <textarea
            placeholder="Nhập bình luận..."
            className="w-full p-2 border rounded-md mt-2 h-20"
          ></textarea>
          <button className="mt-4 px-4 py-2 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600">
            Gửi
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-1/3">
        <Sidebar />
      </div>
    </div>
  );
};

export default Blogsingle;