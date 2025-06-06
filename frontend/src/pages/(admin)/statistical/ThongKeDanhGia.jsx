import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { fetchDanhGias } from '../../../service/api';
import moment from 'moment';
import { Card, Typography, Select, Spin } from 'antd';

Chart.register(...registerables);

const { Title } = Typography;
const { Option } = Select;

const ThongKeDanhGia = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await fetchDanhGias();
        const danhGias = response.data?.data ?? [];

        // Lấy danh sách các năm có dữ liệu
        const yearsSet = new Set();
        danhGias.forEach((dg) => yearsSet.add(moment(dg.created_at).year()));

        const currentYear = moment().year();
        const sortedYears = [...yearsSet].sort((a, b) => b - a); // Sắp xếp giảm dần để năm mới nhất lên đầu

        // Thêm năm hiện tại vào danh sách nếu chưa có
        if (!yearsSet.has(currentYear)) {
          sortedYears.unshift(currentYear);
        }

        setAvailableYears(sortedYears);

        // Đặt năm mặc định là năm hiện tại
        if (year === null) {
          setYear(currentYear);
        }

        // Lọc đánh giá theo năm và tháng (nếu có)
        const filteredDanhGias = danhGias.filter((dg) => {
          const date = moment(dg.created_at);
          return (!year || date.year() === year) && (!month || date.month() + 1 === month);
        });

        // Thống kê theo ngày
        let stats = {};
        filteredDanhGias.forEach((dg) => {
          const date = moment(dg.created_at);
          const star = Number(dg.DanhGia);
          const dayLabel = date.format('DD/MM/YYYY');

          if (!stats[dayLabel]) {
            stats[dayLabel] = {
              label: dayLabel,
              total: 0,
              stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };
          }
          stats[dayLabel].stars[star]++;
          stats[dayLabel].total++;
        });

        // Sắp xếp theo ngày và lấy tối đa 30 ngày gần nhất
        const sortedStats = Object.values(stats)
          .sort((a, b) => moment(a.label, 'DD/MM/YYYY').valueOf() - moment(b.label, 'DD/MM/YYYY').valueOf())
          .slice(-30); // Chỉ lấy 30 ngày mới nhất

        setData(sortedStats);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thống kê đánh giá:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [year, month]);

  const getChartData = () => {
    const labels = data.map((item) => item.label);
    const datasets = [
      {
        label: 'Tổng đánh giá',
        data: data.map((item) => item.total),
        backgroundColor: 'rgba(33, 150, 243, 0.6)', // Màu xanh mặc định
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
      },
    ];

    return { labels, datasets };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#1890ff' }}>Đang tải thông tin thống kê...</p>
      </div>
    );
  }

  return (
    <Card
      style={{
        margin: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Title level={3} style={{ textAlign: 'center', marginBottom: '24px', color: '#1890ff' }}>
        Thống Kê Đánh Giá
      </Title>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Select
          value={year}
          onChange={(value) => {
            setYear(value);
            setMonth(null);
          }}
          style={{ width: 140 }}
          placeholder="Chọn năm"
        >
          {availableYears.map((y) => (
            <Option key={y} value={y}>
              {y}
            </Option>
          ))}
        </Select>

        <Select
          value={month}
          onChange={setMonth}
          style={{ width: 140 }}
          placeholder="Chọn tháng"
          allowClear
        >
          {Array.from({ length: 12 }, (_, i) => (
            <Option key={i + 1} value={i + 1}>Tháng {i + 1}</Option>
          ))}
        </Select>
      </div>

      <div style={{ height: '500px' }}>
        <Bar
          data={getChartData()}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: (context) => {
                    const index = context.dataIndex;
                    const dayData = data[index];
                    const stars = dayData.stars;
                    return [
                      `Tổng đánh giá: ${dayData.total}`,
                      `1 Sao: ${stars[1]}`,
                      `2 Sao: ${stars[2]}`,
                      `3 Sao: ${stars[3]}`,
                      `4 Sao: ${stars[4]}`,
                      `5 Sao: ${stars[5]}`,
                    ];
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 },
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Số lượng đánh giá',
                },
              },
            },
          }}
        />
      </div>
    </Card>
  );
};

export default ThongKeDanhGia;