import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { fetchComments } from '../../../service/api';
import moment from 'moment';
import { Card, Typography, Select, Spin, message } from 'antd';

Chart.register(...registerables);

const { Title } = Typography;
const { Option } = Select;

const ThongKeBinhLuan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await fetchComments();
        const comments = response.data || [];

        // Lấy danh sách các năm từ dữ liệu
        const yearsSet = new Set();
        comments.forEach((cmt) => yearsSet.add(moment(cmt.NgayBL).year()));

        const currentYear = moment().year();
        const sortedYears = [...yearsSet].sort((a, b) => b - a); // Sắp xếp giảm dần

        // Thêm năm hiện tại nếu chưa có
        if (!yearsSet.has(currentYear)) {
          sortedYears.unshift(currentYear);
        }

        setAvailableYears(sortedYears);

        // Đặt năm mặc định là năm hiện tại
        if (year === null) {
          setYear(currentYear);
        }

        // Lọc bình luận theo năm và tháng (nếu có)
        const filteredComments = comments.filter((cmt) => {
          const date = moment(cmt.NgayBL);
          return (!year || date.year() === year) && (!month || date.month() + 1 === month);
        });

        // Thống kê theo ngày
        let stats = {};
        filteredComments.forEach((cmt) => {
          const date = moment(cmt.NgayBL);
          const dayLabel = date.format('DD/MM/YYYY');

          if (!stats[dayLabel]) {
            stats[dayLabel] = {
              label: dayLabel,
              total: 0,
            };
          }
          stats[dayLabel].total++;
        });

        // Sắp xếp theo ngày và lấy tối đa 30 ngày gần nhất
        const sortedStats = Object.values(stats)
          .sort((a, b) => moment(a.label, 'DD/MM/YYYY').valueOf() - moment(b.label, 'DD/MM/YYYY').valueOf())
          .slice(-30); // Chỉ lấy 30 ngày mới nhất

        setData(sortedStats);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu bình luận:', error);
        message.error('Lỗi khi tải dữ liệu bình luận');
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
        label: 'Số lượng bình luận',
        data: data.map((item) => item.total),
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
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
        Thống Kê Số Lượng Bình Luận Theo Ngày
      </Title>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Select
          value={year}
          onChange={(value) => {
            setYear(value);
            setMonth(null); // Reset tháng khi đổi năm
          }}
          style={{ width: 140 }}
          placeholder="Chọn năm"
          allowClear
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
            <Option key={i + 1} value={i + 1}>
              Tháng {i + 1}
            </Option>
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
                    return `Tổng bình luận: ${dayData.total}`;
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
                  text: 'Số lượng bình luận',
                },
              },
            },
          }}
        />
      </div>
    </Card>
  );
};

export default ThongKeBinhLuan;