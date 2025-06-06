import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrdersByUserId } from "../../../service/api";

const SpDaMua = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ id: "", Email: "" });
  const navigate = useNavigate();

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Lấy danh sách đơn hàng và lọc sản phẩm từ đơn "Hoàn thành"
  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        if (userData.id) {
          const response = await fetchOrdersByUserId(userData.id);
          const orders = response.data.data;

          // Lọc các đơn hàng có trạng thái "Hoàn thành"
          const completedOrders = orders.filter(
            (order) => order.paymentStatus === "Hoàn thành"
          );

          // Gộp tất cả sản phẩm từ các đơn hàng "Hoàn thành" vào một mảng
          const allProducts = completedOrders.flatMap((order) => order.products);

          // Loại bỏ sản phẩm trùng lặp dựa trên productId, memory và color
          const uniqueProducts = [];
          const seen = new Set();

          allProducts.forEach((product) => {
            const key = `${product.productId}|${product.memory}|${product.color}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueProducts.push(product);
            }
          });

          setProducts(uniqueProducts);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm đã mua:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, [userData.id]);

  // Hàm điều hướng đến trang chi tiết sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/products/product_detail/${productId}`);
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!products.length) {
    return <div className="text-center py-8">Bạn chưa có sản phẩm nào đã mua.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Sản phẩm đã mua
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition duration-200 cursor-pointer"
                onClick={() => handleProductClick(product.productId)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    Dung lượng: {product.memory}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Màu:</span>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: product.color.toLowerCase(),
                        borderRadius: "50%",
                        border: "1px solid #ccc",
                      }}
                      title={product.color}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpDaMua;