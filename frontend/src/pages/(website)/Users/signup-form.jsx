import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { signupUsers } from '../../../service/api';

const SignupForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await signupUsers(values);
      message.success('Đăng ký thành công!');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (typeof errorMessage === 'string') {
        message.error(errorMessage);
      } else if (Array.isArray(errorMessage)) {
        errorMessage.forEach(msg => message.error(msg));
      } else {
        message.error('Đăng ký thất bại');
      }
    } finally {
      setLoading(false);
    }
  };;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-4/5 p-8 bg-white rounded-lg shadow-md">
        <h5 className="text-2xl font-bold mb-6">Đăng Ký Tài Khoản</h5>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="HoVaTen"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="SDT"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]+$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="Email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="DiaChi"
            label="Địa Chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="MatKhau"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              { 
                pattern: /^[A-Z]/,
                message: 'Mật khẩu phải bắt đầu bằng chữ hoa!'
              },
              {
                pattern: /^[a-zA-Z0-9]*$/,
                message: 'Mật khẩu không được chứa ký tự đặc biệt!'
              }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['MatKhau']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('MatKhau') === value) {
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
            ĐĂNG KÝ
          </Button>

          <div className="mt-4 text-center">
            <span>Đã có tài khoản? </span>
            <Link to="/login" className="text-blue-500">Đăng nhập ngay</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SignupForm;