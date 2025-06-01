import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { resetPassword } from '../../../service/api';

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token');

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await resetPassword({ 
        token,
        MatKhau: values.newPassword 
      });
      
      message.success('Đặt lại mật khẩu thành công!');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-4/5 p-8 bg-white rounded-lg shadow-md">
        <h5 className="text-2xl font-bold mb-6">Đặt Lại Mật Khẩu</h5>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Đặt Lại Mật Khẩu
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;