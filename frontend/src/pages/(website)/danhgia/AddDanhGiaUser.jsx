import React, { useState, useEffect } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { Form, Input, Button, Rate, message, Upload, Space, Card } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createDanhGia, uploadImage, fetchOrdersByUserId } from '../../../service/api';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

const AddDanhGiaUser = () => {
  const [loading, setLoading] = useState(false);
  const [hinhAnh1, setHinhAnh1] = useState(null);
  const [hinhAnh2, setHinhAnh2] = useState(null);
  const [hinhAnh3, setHinhAnh3] = useState(null);
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { id: orderId } = useParams();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.id) {
          const response = await fetchOrdersByUserId(userData.id);
          const orders = response.data.data;
          const foundOrder = orders.find((o) => o._id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
            form.setFieldsValue({ Ten: foundOrder.shippingInfo.name });
          } else {
            message.error("Không tìm thấy đơn hàng!");
            navigate('/profile-receipt');
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin đơn hàng:", error);
        message.error("Không thể tải thông tin đơn hàng!");
      }
    };

    const reviewedOrders = JSON.parse(localStorage.getItem('reviewedOrders') || '{}');
    if (reviewedOrders[orderId]) {
      message.error("Đơn hàng này đã được đánh giá trước đó!");
      navigate('/profile-receipt');
    } else {
      fetchOrderData();
    }
  }, [orderId, navigate, form]);

  const handleImageUpload = async (file, setHinhAnh) => {
    if (!file) return false;

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên file ảnh!');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await uploadImage(formData);
      const imageUrl = response.data.imageUrl;
      setHinhAnh(imageUrl);
      message.success("Tải ảnh thành công!");
      return false;
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      message.error("Tải ảnh thất bại!");
      return false;
    }
  };

  const onFinish = async (values) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      confirmAlert({
        title: 'Yêu cầu đăng nhập',
        message: 'Bạn cần đăng nhập để thêm đánh giá!',
        buttons: [
          { label: 'Đăng nhập ngay', onClick: () => navigate('/login') },
          { label: 'Hủy', onClick: () => {} }
        ]
      });
      return;
    }

    try {
      setLoading(true);
      const danhGiaData = {
        Ten: values.Ten,
        SanPham: order.products.map(p => p.name).join(', '),
        NoiDung: values.NoiDung || '', // Cho phép nội dung rỗng
        DanhGia: values.DanhGia,
        orderId,
        HinhAnh1: hinhAnh1,
        HinhAnh2: hinhAnh2,
        HinhAnh3: hinhAnh3,
      };

      await createDanhGia(danhGiaData);
      message.success("Đánh giá của bạn đã được gửi thành công!");
      
      const reviewedOrders = JSON.parse(localStorage.getItem('reviewedOrders') || '{}');
      reviewedOrders[orderId] = true;
      localStorage.setItem('reviewedOrders', JSON.stringify(reviewedOrders));

      navigate('/listdanhgiauser');
    } catch (error) {
      console.error("Lỗi khi thêm đánh giá:", error);
      message.error("Thêm đánh giá thất bại, thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
      <Card
        title={<h2 style={{ textAlign: 'center', margin: 0 }}>Thêm Đánh Giá</h2>}
        style={{ maxWidth: '800px', width: '100%', margin: '0 auto', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ padding: '0 20px' }}
        >
          <Form.Item
            label="Tên khách hàng"
            name="Ten"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input size="large" placeholder="Nhập tên của bạn" disabled />
          </Form.Item>

          <Form.Item label="Sản phẩm">
            <div>
              {order.products.map((product, index) => (
                <p key={index} className="font-medium">
                  {product.name} ({product.memory} - {product.color})
                </p>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            label="Nội dung đánh giá"
            name="NoiDung"
            // Đã bỏ rule required để cho phép bỏ trống
          >
            <Input.TextArea
              size="large"
              placeholder="Nhập nội dung đánh giá (không bắt buộc)"
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="Xếp hạng"
            name="DanhGia"
            rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
          >
            <Rate style={{ fontSize: '24px' }} />
          </Form.Item>

          <Space direction="vertical" style={{ width: '100%' }}>
            {[1, 2, 3].map((index) => {
              const currentImage = index === 1 ? hinhAnh1 : index === 2 ? hinhAnh2 : hinhAnh3;
              const setImage = index === 1 ? setHinhAnh1 : index === 2 ? setHinhAnh2 : setHinhAnh3;
              
              return (
                <Form.Item key={index} label={`Hình ảnh ${index}`}>
                  <Upload
                    beforeUpload={(file) => handleImageUpload(file, setImage)}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button size="large" icon={<UploadOutlined />}>
                      Chọn hình ảnh
                    </Button>
                  </Upload>
                  {currentImage && (
                    <div style={{ marginTop: 10 }}>
                      <img 
                        src={currentImage} 
                        alt={`Hình ảnh ${index}`} 
                        style={{ maxWidth: '150px', borderRadius: '4px' }} 
                      />
                      <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        onClick={() => setImage(null)}
                        style={{ color: '#ff4d4f', marginLeft: '10px' }}
                      >
                        Xóa
                      </Button>
                    </div>
                  )}
                </Form.Item>
              );
            })}
          </Space>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{ width: '100%', borderRadius: '4px' }}
            >
              Thêm đánh giá
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddDanhGiaUser;