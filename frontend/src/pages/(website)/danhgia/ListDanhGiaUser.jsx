import React, { useEffect, useState } from 'react';
import { Table, Rate, Select, Image } from 'antd';
import { fetchDanhGias } from '../../../service/api';
import moment from 'moment';
import Socket from "../socket/Socket"

const { Option } = Select;

const ListDanhGiaUser = () => {
  const [danhGias, setDanhGias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStar, setSelectedStar] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const getDanhGias = async () => {
      try {
        setLoading(true);
        const response = await fetchDanhGias();
        setDanhGias(response.data?.data ?? []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        setDanhGias([]);
      } finally {
        setLoading(false);
      }
    };
    getDanhGias();
  }, []);

  // Lắng nghe sự kiện Socket.IO
  useEffect(() => {
    // Thêm đánh giá mới
    Socket.on("danhGiaCreated", (newDanhGia) => {
      console.log("Nhận đánh giá mới:", newDanhGia);
      setDanhGias((prevDanhGias) => [...prevDanhGias, newDanhGia]);
    });

    // Xóa đánh giá
    Socket.on("danhGiaDeleted", (deletedDanhGia) => {
      console.log("Đánh giá đã xóa:", deletedDanhGia);
      setDanhGias((prevDanhGias) =>
        prevDanhGias.filter((dg) => dg._id !== deletedDanhGia._id)
      );
    });

    // Cập nhật đánh giá
    Socket.on("danhGiaUpdated", (updatedDanhGia) => {
      console.log("Đánh giá được cập nhật:", updatedDanhGia);
      setDanhGias((prevDanhGias) =>
        prevDanhGias.map((dg) =>
          dg._id === updatedDanhGia._id ? updatedDanhGia : dg
        )
      );
    });

    // Dọn dẹp listener
    return () => {
      Socket.off("danhGiaCreated");
      Socket.off("danhGiaDeleted");
      Socket.off("danhGiaUpdated");
    };
  }, []);

  const handleSelectChange = (value) => setSelectedStar(value || null);
  const handleSortChange = (value) => setSortOrder(value || 'newest');

  let filteredDanhGias = selectedStar !== null
    ? danhGias.filter((dg) => Number(dg.DanhGia) === selectedStar)
    : danhGias;

  filteredDanhGias = [...filteredDanhGias].sort((a, b) => {
    if (sortOrder === 'newest' || !sortOrder) {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    return 0;
  });

  const renderImage = (url) =>
    url ? (
      <Image
        width={100}
        height={100}
        style={{ objectFit: 'cover', borderRadius: 10 }}
        src={url}
      />
    ) : (
      'Không có ảnh'
    );

  const columns = [
    { title: 'Tên', dataIndex: 'Ten', key: 'Ten', align: 'center', width: 150 },
    {
      title: 'Sản phẩm',
      dataIndex: 'SanPham',
      key: 'SanPham',
      align: 'center',
      width: 200,
      render: (sanPham) =>
        sanPham.split(',').map((item, index) => <div key={index}>{item}</div>),
    },
    { title: 'Nội dung', dataIndex: 'NoiDung', key: 'NoiDung', width: 300 },
    {
      title: 'Đánh giá',
      dataIndex: 'DanhGia',
      key: 'DanhGia',
      align: 'center',
      render: (value) => <Rate disabled defaultValue={Number(value)} />,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Hình ảnh 1',
      dataIndex: 'HinhAnh1',
      key: 'HinhAnh1',
      align: 'center',
      render: renderImage,
    },
    {
      title: 'Hình ảnh 2',
      dataIndex: 'HinhAnh2',
      key: 'HinhAnh2',
      align: 'center',
      render: renderImage,
    },
    {
      title: 'Hình ảnh 3',
      dataIndex: 'HinhAnh3',
      key: 'HinhAnh3',
      align: 'center',
      render: renderImage,
    },
  ];

  return (
    <div style={{ padding: 20, width: '100%', height: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
        Danh sách đánh giá
      </h2>
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div>
          <span style={{ marginRight: 10 }}>Lọc theo số sao:</span>
          <Select
            placeholder="Chọn số sao"
            style={{ width: 120 }}
            onChange={handleSelectChange}
            allowClear
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <Option key={value} value={value}>
                {value} Sao
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <span style={{ marginRight: 10 }}>Sắp xếp:</span>
          <Select
            placeholder="Chọn kiểu sắp xếp"
            style={{ width: 150 }}
            onChange={handleSortChange}
            value={sortOrder}
            allowClear
          >
            <Option value="newest">Gần nhất</Option>
            <Option value="oldest">Lâu nhất</Option>
          </Select>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredDanhGias}
        rowKey={(record) => record._id}
        bordered
        pagination={{ pageSize: 5 }}
        loading={loading}
        style={{ backgroundColor: 'white', borderRadius: 10, overflow: 'hidden' }}
      />
    </div>
  );
};

export default ListDanhGiaUser;