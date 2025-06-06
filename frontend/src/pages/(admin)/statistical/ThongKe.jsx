import React, { useEffect, useState, useRef } from "react";
import { fetchThongKeDoanhThu } from "../../../service/api";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ThongKe = () => {
  const [thongKeDoanhThu, setThongKeDoanhThu] = useState({
    doanhThuTheoNgay: [],
    doanhThuTheoTuan: [],
    doanhThuTheoThang: [],
    doanhThuTheoNam: [],
    tongDoanhThuTheoNgay: 0,
    tongDoanhThuTheoTuan: 0,
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [filteredMonths, setFilteredMonths] = useState([]);
  const [displayMode, setDisplayMode] = useState("last30days"); // 'last30days' hoặc 'byMonth'

  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchThongKeDoanhThu();
        setThongKeDoanhThu(response.data);
        
        // Set năm mặc định là năm hiện tại
        const currentYear = new Date().getFullYear().toString();
        setSelectedYear(currentYear);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê doanh thu:", error);
      }
    };

    fetchData();
  }, []);

  // Lọc các tháng theo năm đã chọn
  useEffect(() => {
    if (selectedYear && thongKeDoanhThu.doanhThuTheoThang.length > 0) {
      const filtered = thongKeDoanhThu.doanhThuTheoThang.filter(item => {
        const [year] = item._id.split('-');
        return year === selectedYear;
      });
      setFilteredMonths(filtered);
    }
  }, [selectedYear, thongKeDoanhThu.doanhThuTheoThang]);

  useEffect(() => {
    if (thongKeDoanhThu.doanhThuTheoNgay.length > 0 && canvasRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      let labels = [];
      let data = [];
      let tooltipTitle = "";
      let xAxisTitle = "";

      if (displayMode === "byMonth" && selectedMonth) {
        // Hiển thị theo tháng được chọn
        const [year, month] = selectedMonth.split('-');
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Tạo danh sách tất cả ngày trong tháng
        const fullMonthDates = Array.from({ length: daysInMonth }, (_, i) => {
          const day = (i + 1).toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
        });

        // Tạo map từ dữ liệu doanh thu
        const doanhThuMap = new Map(
          thongKeDoanhThu.doanhThuTheoNgay
            .filter(item => item._id.ngay.startsWith(`${year}-${month}`))
            .map((item) => [item._id.ngay, item.tongDoanhThu])
        );

        labels = fullMonthDates.map(date => date.split('-')[2]); // Chỉ hiển thị ngày
        data = fullMonthDates.map((date) => doanhThuMap.get(date) || 0);
        tooltipTitle = `Tháng ${month}/${year}`;
        xAxisTitle = 'Ngày';
      } else {
        // Hiển thị 30 ngày gần nhất
        const sortedDays = [...thongKeDoanhThu.doanhThuTheoNgay]
          .sort((a, b) => new Date(b._id.ngay) - new Date(a._id.ngay))
          .slice(0, 30)
          .reverse();

        labels = sortedDays.map(item => {
          const date = new Date(item._id.ngay);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        data = sortedDays.map(item => item.tongDoanhThu);
        tooltipTitle = '30 ngày gần nhất';
        xAxisTitle = 'Ngày/Tháng';
      }

      // Tạo biểu đồ
      chartRef.current = new Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Doanh Thu Theo Ngày",
              data,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: xAxisTitle
              },
              ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 },
            },
            y: {
              title: {
                display: true,
                text: 'Doanh thu (VND)'
              },
              beginAtZero: true,
            },
          },
          plugins: {  
            tooltip: {  
              callbacks: {  
                title: (tooltipItems) => {  
                  const label = tooltipItems[0].label;
                  let date, totalRevenue;
                  
                  if (displayMode === "byMonth" && selectedMonth) {
                    const [year, month] = selectedMonth.split('-');
                    date = `${label.padStart(2, '0')}/${month}/${year}`;
                    const fullDate = `${year}-${month}-${label.padStart(2, '0')}`;
                    const doanhThuItem = thongKeDoanhThu.doanhThuTheoNgay.find(
                      item => item._id.ngay === fullDate
                    );
                    totalRevenue = doanhThuItem ? doanhThuItem.tongDoanhThu : 0;
                  } else {
                    date = label;
                    const [day, month] = label.split('/');
                    const year = new Date().getFullYear();
                    const fullDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    const doanhThuItem = thongKeDoanhThu.doanhThuTheoNgay.find(
                      item => item._id.ngay === fullDate
                    );
                    totalRevenue = doanhThuItem ? doanhThuItem.tongDoanhThu : 0;
                  }
                  
                  return `Ngày: ${date}\nTổng doanh thu: ${totalRevenue.toLocaleString("vi-VN", {  
                    style: "currency",  
                    currency: "VND"  
                  })}`;  
                },  
                label: (tooltipItem) => {  
                  let fullDate;
                  
                  if (displayMode === "byMonth" && selectedMonth) {
                    const [year, month] = selectedMonth.split('-');
                    const day = tooltipItem.label.padStart(2, '0');
                    fullDate = `${year}-${month}-${day}`;
                  } else {
                    const [day, month] = tooltipItem.label.split('/');
                    const year = new Date().getFullYear();
                    fullDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                  }
                  
                  const doanhThuItem = thongKeDoanhThu.doanhThuTheoNgay.find(  
                    (item) => item._id.ngay === fullDate  
                  );  
                
                  if (!doanhThuItem || !doanhThuItem.sanPhamDaBan || doanhThuItem.sanPhamDaBan.length === 0) {  
                    return "Không có chi tiết sản phẩm.";  
                  }  
                
                  const productMap = new Map();
                  doanhThuItem.sanPhamDaBan.forEach((sp) => {
                    const key = `${sp.TenSP} (${sp.memory})`;
                    if (productMap.has(key)) {
                      productMap.set(key, productMap.get(key) + sp.quantity);
                    } else {
                      productMap.set(key, sp.quantity);
                    }
                  });
                
                  return Array.from(productMap.entries())
                    .map(([key, quantity]) => `${key} x${quantity}`);
                },   
              },  
            },  
          },  
        }
      });
    }
  
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [thongKeDoanhThu.doanhThuTheoNgay, selectedMonth, displayMode]);
  
  const handleMonthChange = (e) => {
    const value = e.target.value;
    setSelectedMonth(value);
    setDisplayMode(value ? "byMonth" : "last30days");
  };

  return (
    <div style={{ width: "100%", padding: "20px", fontFamily: "Arial" }}>
      {/* Tiêu đề */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#333", marginBottom: "8px" }}>Thống Kê Doanh Thu</h2>
      </div>

      {/* Cards thống kê */}
      <div className="row">
        {/* Chọn năm */}
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Chọn Năm</div>
              <select 
                className="form-control font-weight-bold text-gray-800"
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {thongKeDoanhThu.doanhThuTheoNam.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item._id}: {item.tongDoanhThu.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chọn tháng */}
        <div className="col-xl-4 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Chọn Tháng</div>
              <select 
                className="form-control font-weight-bold text-gray-800 custom-select"
                value={selectedMonth}
                onChange={handleMonthChange}
                disabled={!selectedYear || filteredMonths.length === 0}
              >
                <option value="">-- Chọn tháng --</option>
                {filteredMonths.length > 0 && filteredMonths.map((item) => (
                  <option key={item._id} value={item._id}>
                    Tháng {item._id.split('-')[1]}: {item.tongDoanhThu.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Thông tin hiển thị */}
      <div className="alert alert-info mb-4">
        {displayMode === "byMonth" && selectedMonth ? (
          <>Đang hiển thị doanh thu tháng {selectedMonth.split('-')[1]} năm {selectedMonth.split('-')[0]}</>
        ) : (
          <>Đang hiển thị doanh thu 30 ngày gần nhất</>
        )}
      </div>

      {/* Biểu đồ doanh thu theo ngày */}
      <div style={{ width: "100%", height: "500px" }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default ThongKe;