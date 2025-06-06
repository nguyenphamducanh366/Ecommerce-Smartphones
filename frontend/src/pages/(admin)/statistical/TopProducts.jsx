import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "react-confirm-alert/src/react-confirm-alert.css";

Chart.register(...registerables);

const API_URL = "http://localhost:5000/api";

const TopProducts = () => {
  const [hoaDons, setHoaDons] = useState([]);
  const [dailySummary, setDailySummary] = useState({});
  const [productSummary, setProductSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ 
    year: "", 
    month: "", 
    viewMode: "daily" // 'daily' hoặc 'product'
  });
  const [availableYears, setAvailableYears] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/hoadons`);
        setHoaDons(data.data);

        const years = new Set();
        data.data.forEach((hoaDon) => {
          const year = new Date(hoaDon.createdAt).getFullYear();
          years.add(year);
        });
        setAvailableYears(years);

        const currentYear = new Date().getFullYear();
        if (!filter.year && years.has(currentYear)) {
          setFilter((prev) => ({ ...prev, year: currentYear.toString() }));
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const dailySum = {};
    const productSum = {};

    hoaDons.forEach((hoaDon) => {
      if (
        hoaDon.paymentStatus === "Hoàn thành" ||
        hoaDon.paymentStatus === "Giao Hàng Thành Công"
      ) {
        const dateObj = new Date(hoaDon.createdAt);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();

        if (
          (filter.year === "" || year === parseInt(filter.year)) &&
          (filter.month === "" || month === parseInt(filter.month))
        ) {
          // Tính tổng theo ngày
          const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          if (!dailySum[dateKey]) dailySum[dateKey] = {};

          // Tính tổng theo sản phẩm
          hoaDon.products.forEach((product) => {
            // Thêm vào tổng ngày
            if (!dailySum[dateKey][product.name]) {
              dailySum[dateKey][product.name] = 0;
            }
            dailySum[dateKey][product.name] += product.quantity;

            // Thêm vào tổng sản phẩm
            if (!productSum[product.name]) {
              productSum[product.name] = 0;
            }
            productSum[product.name] += product.quantity;
          });
        }
      }
    });

    setDailySummary(dailySum);
    setProductSummary(productSum);
  }, [hoaDons, filter.year, filter.month]);

  const getChartData = () => {
    if (filter.viewMode === "daily") {
      const labels = Object.keys(dailySummary)
        .sort((a, b) => new Date(a) - new Date(b))
        .slice(-30);
      
      const data = labels.map((label) => {
        const products = dailySummary[label];
        return Object.values(products).reduce((acc, qty) => acc + qty, 0);
      });

      return {
        labels,
        datasets: [
          {
            label: "Tổng sản phẩm bán ra",
            data,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      };
    } else {
      // Chế độ xem theo sản phẩm
      const sortedProducts = Object.entries(productSummary)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Lấy top 10 sản phẩm bán chạy

      const labels = sortedProducts.map(([name]) => name);
      const data = sortedProducts.map(([_, qty]) => qty);

      return {
        labels,
        datasets: [
          {
            label: "Số lượng bán ra",
            data,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="spinner-border text-blue-600" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p className="mt-2 text-blue-800">Đang tải thông tin thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h6 className="text-lg font-bold text-blue-800 mb-4">
          {filter.viewMode === "daily" 
            ? "Sản phẩm bán ra theo ngày" 
            : "Top sản phẩm bán chạy"}
        </h6>

        <div className="flex flex-wrap gap-4 mb-6">
          <select
            name="year"
            value={filter.year}
            onChange={handleFilterChange}
            className="p-2 border border-blue-200 rounded"
          >
            <option value="">Chọn năm</option>
            {Array.from(availableYears).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            name="month"
            value={filter.month}
            onChange={handleFilterChange}
            className="p-2 border border-blue-200 rounded"
          >
            <option value="">Chọn tháng</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>

          <select
            name="viewMode"
            value={filter.viewMode}
            onChange={handleFilterChange}
            className="p-2 border border-blue-200 rounded"
          >
            <option value="daily">Xem theo ngày</option>
            <option value="product">Xem theo sản phẩm</option>
          </select>
        </div>

        <div className="w-full h-[500px]">
          <Bar
            data={getChartData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    title: (context) => 
                      filter.viewMode === "daily" 
                        ? `Ngày: ${context[0].label}` 
                        : `Sản phẩm: ${context[0].label}`,
                    label: (context) => {
                      if (filter.viewMode === "daily") {
                        const date = context.label;
                        const products = dailySummary[date] || {};
                        return Object.entries(products).map(
                          ([name, qty]) => `${name}: ${qty} sản phẩm`
                        );
                      } else {
                        return `Số lượng: ${context.raw}`;
                      }
                    },
                  },
                },
                legend: { display: false },
              },
              scales: {
                x: {
                  ticks: { 
                    autoSkip: false, 
                    maxRotation: 45, 
                    minRotation: 45 
                  },
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: filter.viewMode === "daily" 
                      ? "Tổng số sản phẩm" 
                      : "Số lượng bán ra",
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopProducts;