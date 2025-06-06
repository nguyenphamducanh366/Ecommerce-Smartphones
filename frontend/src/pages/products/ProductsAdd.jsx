import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProducts, fetchBrands, uploadImage } from "../../../service/api";
import { Form, Input, Select, Button, Upload, message, Card, Row, Col, Space, Divider } from 'antd';
import { UploadOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';

const { Option } = Select;

const ProductsAdd = () => {
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [product, setProduct] = useState({
    MaSP: '',
    Mau1: '',
    TrangThai: '',
    HinhAnh1: null,
    HinhAnh2: null,
    HinhAnh3: null,
    HinhAnh4: null,
    HinhAnh5: null,
    HinhAnh6: null,
    memoryData: [
      { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: true },
      { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
      { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
      { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
      { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
      { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
    ],
    hiddenIndices: [],
  });
  const [errors, setErrors] = useState({ global: '', imageError: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await fetchBrands();
        setBrands(response.data.data);
      } catch (err) {
        console.error('Lỗi khi tải thương hiệu:', err);
        setErrors((prev) => ({ ...prev, global: 'Không thể tải danh sách thương hiệu.' }));
      }
    };
    loadBrands();
  }, []);

  const validateMainFields = async () => {
    try {
      await form.validateFields([
        'TenSP',
        'TenTH',
        'MoTa',
        'CamTruoc',
        'CamSau',
        'HDH',
        'LoaiPin',
        'CapSac',
        'ManHinh',
        'CPU',
      ]);
      return true;
    } catch (error) {
      return false;
    }
  };

  const validateFormData = async () => {
    try {
      await form.validateFields([
        'MaSP',
        'Mau1',
        'TrangThai',
        'BoNhoTrong_0',
        'GiaSP_0',
        'SoLuong_0',
      ]);
      const images = [
        { field: 'HinhAnh1', label: 'Hình ảnh 1' },
        { field: 'HinhAnh2', label: 'Hình ảnh 2' },
        { field: 'HinhAnh3', label: 'Hình ảnh 3' },
        { field: 'HinhAnh4', label: 'Hình ảnh 4' },
        { field: 'HinhAnh5', label: 'Hình ảnh 5' },
        { field: 'HinhAnh6', label: 'Hình ảnh 6' },
      ];
      for (const img of images) {
        if (!product[img.field]) {
          throw new Error(`${img.label} không được để trống!`);
        }
      }
      const hasSelectedMemory = product.memoryData.some(
        (data) => data.BoNhoTrong !== 'Vui lòng chọn bộ nhớ'
      );
      if (!hasSelectedMemory) {
        throw new Error(`Phải chọn ít nhất một bộ nhớ!`);
      }
      if (product.TrangThai === 'Còn hàng') {
        const hasValidQuantity = product.memoryData.some(
          (data) => data.SoLuong && Number(data.SoLuong) > 0
        );
        if (!hasValidQuantity) {
          throw new Error(`Khi còn hàng, ít nhất một số lượng phải lớn hơn 0!`);
        }
      }
      return true;
    } catch (error) {
      if (error.message) {
        message.error(error.message);
      }
      return false;
    }
  };

  const debouncedValidateFields = debounce(async (fields) => {
    try {
      await form.validateFields(fields);
    } catch (error) {
      // Không làm gì, lỗi sẽ tự hiển thị tại Form.Item
    }
  }, 500);

  const resetProductForm = () => {
    const initialProductState = {
      MaSP: '',
      Mau1: '',
      TrangThai: '',
      HinhAnh1: null,
      HinhAnh2: null,
      HinhAnh3: null,
      HinhAnh4: null,
      HinhAnh5: null,
      HinhAnh6: null,
      memoryData: [
        { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: true },
        { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
        { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
        { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
        { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
        { BoNhoTrong: 'Vui lòng chọn bộ nhớ', GiaSP: '0', SoLuong: '0', isVisible: false },
      ],
      hiddenIndices: [],
    };
    setProduct(initialProductState);

    const fieldsToReset = [
      'MaSP',
      'Mau1',
      'TrangThai',
      'HinhAnh1',
      'HinhAnh2',
      'HinhAnh3',
      'HinhAnh4',
      'HinhAnh5',
      'HinhAnh6',
    ];
    for (let i = 0; i < 6; i++) {
      fieldsToReset.push(`BoNhoTrong_${i}`, `GiaSP_${i}`, `SoLuong_${i}`);
    }
    form.resetFields(fieldsToReset);

    const defaultMemoryValues = {};
    for (let i = 0; i < 6; i++) {
      defaultMemoryValues[`BoNhoTrong_${i}`] = 'Vui lòng chọn bộ nhớ';
      defaultMemoryValues[`GiaSP_${i}`] = '0';
      defaultMemoryValues[`SoLuong_${i}`] = '0';
    }
    form.setFieldsValue(defaultMemoryValues);

    setErrors({ global: '', imageError: '' });
  };

  const handleAddProduct = async () => {
    setLoading(true);

    try {
      const isMainFieldsValid = await validateMainFields();
      if (!isMainFieldsValid) {
        message.error('Vui lòng sửa lỗi ở phần Thông Tin Cơ Bản hoặc Thông Số Kỹ Thuật!');
        return;
      }

      const isFormValid = await validateFormData();
      if (!isFormValid) {
        return;
      }

      const mainValues = form.getFieldsValue();
      const productToAdd = {
        ...product,
        TenSP: mainValues.TenSP,
        TenTH: mainValues.TenTH,
        MoTa: mainValues.MoTa,
        CamTruoc: mainValues.CamTruoc,
        CamSau: mainValues.CamSau,
        HDH: mainValues.HDH,
        LoaiPin: mainValues.LoaiPin,
        CapSac: mainValues.CapSac,
        ManHinh: mainValues.ManHinh,
        CPU: mainValues.CPU,
        ...product.memoryData.reduce((acc, data, i) => ({
          ...acc,
          [`BoNhoTrong${i + 1}`]: data.BoNhoTrong === 'Vui lòng chọn bộ nhớ' ? '' : data.BoNhoTrong,
          [`GiaSP${i + 1}`]: data.GiaSP,
          [`SoLuong${i + 1}`]: data.SoLuong,
        }), {}),
      };

      delete productToAdd.memoryData;
      delete productToAdd.hiddenIndices;

      await createProducts(productToAdd);
      message.success('Thêm sản phẩm thành công!');
      resetProductForm();
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error.response?.data || error);
      const errorMsg = error.response?.data?.message || error.message || 'Không thể thêm sản phẩm.';
      message.error(`Thêm sản phẩm thất bại: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (field, value) => {
    setProduct((prev) => {
      const updatedProduct = { ...prev, [field]: value };
      if (field === 'TrangThai' && value === 'Hết hàng') {
        updatedProduct.memoryData = updatedProduct.memoryData.map((data) => ({
          ...data,
          SoLuong: '0',
        }));
        const memoryFields = {};
        updatedProduct.memoryData.forEach((data, index) => {
          memoryFields[`SoLuong_${index}`] = '0';
        });
        form.setFieldsValue(memoryFields);
      }
      return updatedProduct;
    });
    debouncedValidateFields(['MaSP', 'TrangThai']);
  };

  const handleMainFieldsChange = () => {
    debouncedValidateFields([
      'TenSP',
      'TenTH',
      'MoTa',
      'CamTruoc',
      'CamSau',
      'HDH',
      'LoaiPin',
      'CapSac',
      'ManHinh',
      'CPU',
    ]);
  };

  const toggleMemoryVisibility = () => {
    setProduct((prev) => {
      const visibleCount = prev.memoryData.filter(data => data.isVisible).length;
      const updatedProduct = { ...prev };

      if (visibleCount < 6) {
        const nextHiddenIndex = updatedProduct.hiddenIndices.length > 0 ? updatedProduct.hiddenIndices[0] : visibleCount;
        if (nextHiddenIndex < 6) {
          updatedProduct.memoryData[nextHiddenIndex].isVisible = true;
          updatedProduct.hiddenIndices = updatedProduct.hiddenIndices.filter(idx => idx !== nextHiddenIndex);
        }
      } else {
        const lastVisibleIndex = updatedProduct.memoryData.reduce((maxIdx, data, idx) => 
          data.isVisible && idx > 0 ? idx : maxIdx, 0);
        updatedProduct.memoryData[lastVisibleIndex].isVisible = false;
        updatedProduct.hiddenIndices = [...updatedProduct.hiddenIndices, lastVisibleIndex].sort((a, b) => a - b);
      }
      return updatedProduct;
    });
    debouncedValidateFields(['BoNhoTrong_0', 'GiaSP_0', 'SoLuong_0']);
  };

  const hideMemory = (memoryIndex) => {
    setProduct((prev) => {
      const updatedProduct = { ...prev };
      updatedProduct.memoryData[memoryIndex] = {
        BoNhoTrong: 'Vui lòng chọn bộ nhớ',
        GiaSP: '0',
        SoLuong: '0',
        isVisible: false,
      };
      updatedProduct.hiddenIndices = [...updatedProduct.hiddenIndices, memoryIndex].sort((a, b) => a - b);
      return updatedProduct;
    });
    form.setFieldsValue({
      [`BoNhoTrong_${memoryIndex}`]: 'Vui lòng chọn bộ nhớ',
      [`GiaSP_${memoryIndex}`]: '0',
      [`SoLuong_${memoryIndex}`]: '0',
    });
    debouncedValidateFields(['BoNhoTrong_0', 'GiaSP_0', 'SoLuong_0']);
  };

  const handleMemoryDataChange = (memoryIndex, field, value) => {
    setProduct((prev) => {
      const updatedProduct = { ...prev };
      updatedProduct.memoryData[memoryIndex] = {
        ...updatedProduct.memoryData[memoryIndex],
        [field]: value,
      };
      if (field === 'BoNhoTrong' && value === 'Vui lòng chọn bộ nhớ') {
        updatedProduct.memoryData[memoryIndex].GiaSP = '0';
        updatedProduct.memoryData[memoryIndex].SoLuong = '0';
        form.setFieldsValue({
          [`GiaSP_${memoryIndex}`]: '0',
          [`SoLuong_${memoryIndex}`]: '0',
        });
      }
      if (field === 'BoNhoTrong' && value !== 'Vui lòng chọn bộ nhớ') {
        updatedProduct.memoryData[memoryIndex].GiaSP = '';
        if (updatedProduct.TrangThai !== 'Hết hàng') {
          updatedProduct.memoryData[memoryIndex].SoLuong = '';
        }
        form.setFieldsValue({
          [`GiaSP_${memoryIndex}`]: '',
          ...(updatedProduct.TrangThai !== 'Hết hàng' && { [`SoLuong_${memoryIndex}`]: '' }),
        });
      }
      return updatedProduct;
    });
    debouncedValidateFields([
      `BoNhoTrong_${memoryIndex}`,
      `GiaSP_${memoryIndex}`,
      `SoLuong_${memoryIndex}`,
    ]);
  };

  const handleImageUpload = async (file, fieldName) => {
    if (!file) return false;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await uploadImage(formData);
      const imageUrl = response.data.imageUrl;
      handleProductChange(fieldName, imageUrl);
      setErrors((prev) => ({ ...prev, imageError: '' }));
      message.success(`Tải ảnh ${fieldName} thành công!`);
      return false;
    } catch (error) {
      console.error(`Lỗi khi tải ${fieldName}:`, error);
      message.error(`Tải ảnh ${fieldName} thất bại!`);
      setErrors((prev) => ({
        ...prev,
        imageError: `Không thể tải ảnh ${fieldName}.`,
      }));
      return false;
    }
  };

  const noWhitespace = (rule, value) => {
    if (!value || value.trim() === '') {
      return Promise.reject('Không được để trống hoặc chỉ nhập khoảng trắng!');
    }
    return Promise.resolve();
  };

  const noNegativeNumber = (rule, value) => {
    if (value && Number(value) < 0) {
      return Promise.reject('Không được nhập số âm!');
    }
    return Promise.resolve();
  };

  const getSelectedMemories = (currentMemoryIndex) => {
    return product.memoryData
      .map((data, index) => (index !== currentMemoryIndex ? data.BoNhoTrong : null))
      .filter((memory) => memory && memory !== 'Vui lòng chọn bộ nhớ');
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Thêm Sản Phẩm</h1>

      {errors.global && (
        <div style={{ color: 'red', marginBottom: '20px', fontSize: '16px' }}>{errors.global}</div>
      )}

      <Form form={form} layout="vertical" onValuesChange={handleMainFieldsChange}>
        <Card title="Thông Tin Cơ Bản" style={{ marginBottom: '30px', padding: '20px' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Tên Sản Phẩm"
                name="TenSP"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                  { validator: noWhitespace },
                  { max: 255, message: 'Tên sản phẩm không được dài quá 255 ký tự!' },
                  {
                    validator: (_, value) => {
                      if (!value || value.trim().length < 3) {
                        return Promise.reject('Tên sản phẩm tối thiểu 3 ký tự!');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Thương Hiệu"
                name="TenTH"
                rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
              >
                <Select placeholder="Chọn thương hiệu" size="large">
                  <Option value="">Chọn thương hiệu</Option>
                  {brands.map((brand) => (
                    <Option key={brand._id} value={brand.TenTH}>
                      {brand.TenTH}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Thông Số Kỹ Thuật" style={{ marginBottom: '30px', padding: '20px' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Mô Tả"
                name="MoTa"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }, { validator: noWhitespace }]}
              >
                <Input placeholder="Nhập mô tả sản phẩm" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Camera Trước"
                name="CamTruoc"
                rules={[{ required: true, message: 'Vui lòng chọn độ phân giải camera trước!' }]}
              >
                <Select placeholder="Chọn độ phân giải" size="large">
                  <Option value="">Chọn độ phân giải</Option>
                  <Option value="8px">8 PX</Option>
                  <Option value="12px">12 PX</Option>
                  <Option value="16px">32 PX</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Camera Sau"
                name="CamSau"
                rules={[{ required: true, message: 'Vui lòng chọn độ phân giải camera sau!' }]}
              >
                <Select placeholder="Chọn độ phân giải" size="large">
                  <Option value="">Chọn độ phân giải</Option>
                  <Option value="12px">12 PX</Option>
                  <Option value="48px">48 PX</Option>
                  <Option value="50px">50 PX</Option>
                  <Option value="64px">64 PX</Option>
                  <Option value="108px">108 PX</Option>
                  <Option value="200px">200 PX</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="CPU"
                name="CPU"
                rules={[{ required: true, message: 'Vui lòng chọn loại CPU!' }]}
              >
                <Select placeholder="Chọn loại CPU" size="large">
                  <Option value="">Chọn loại CPU</Option>
                  <Option value="APPLE CHIPSET">APPLE CHIPSET</Option>
                  <Option value="ANDROID CHIPSET">ANDROID CHIPSET</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Màn Hình"
                name="ManHinh"
                rules={[{ required: true, message: 'Vui lòng chọn kích thước màn hình!' }]}
              >
                <Select placeholder="Chọn kích thước màn hình" size="large">
                  <Option value="">Chọn kích thước màn hình</Option>
                  <Option value="4.7inch">4.7 inch</Option>
                  <Option value="5.1inch">5.1 inch</Option>
                  <Option value="5.5inch">5.5 inch</Option>
                  <Option value="6inch">6 inch</Option>
                  <Option value="6.5inch">6.5 inch</Option>
                  <Option value="6.7inch">6.7 inch</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Hệ Điều Hành"
                name="HDH"
                rules={[{ required: true, message: 'Vui lòng chọn hệ điều hành!' }]}
              >
                <Select placeholder="Chọn hệ điều hành" size="large">
                  <Option value="">Chọn hệ điều hành</Option>
                  <Option value="IOS">IOS</Option>
                  <Option value="ANDROID">ANDROID</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Loại Pin"
                name="LoaiPin"
                rules={[{ required: true, message: 'Vui lòng chọn loại pin!' }]}
              >
                <Select placeholder="Chọn loại pin" size="large">
                  <Option value="">Chọn loại pin</Option>
                  <Option value="PISEN">PISEN</Option>
                  <Option value="Energizer">Energizer</Option>
                  <Option value="Duracell">Duracell</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Cáp Sạc"
                name="CapSac"
                rules={[{ required: true, message: 'Vui lòng chọn loại cáp sạc!' }]}
              >
                <Select placeholder="Chọn loại cáp" size="large">
                  <Option value="">Chọn loại cáp</Option>
                  <Option value="Type-C">Type-C</Option>
                  <Option value="Lightning">Lightning</Option>
                  <Option value="USB">USB</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider orientation="left">Thông Tin Sản Phẩm</Divider>

        <Card
          title="Form Sản Phẩm"
          style={{ marginBottom: '30px', padding: '20px' }}
          extra={
            <Space>
              <Button
                type="primary"
                onClick={handleAddProduct}
                loading={loading}
                style={{ fontSize: '14px' }}
              >
                {loading ? 'Đang thêm...' : 'Thêm Sản Phẩm'}
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => {
                  resetProductForm();
                  message.success('Form sản phẩm đã được reset!');
                }}
                style={{ fontSize: '14px' }}
              >
                Reset Form
              </Button>
            </Space>
          }
        >
          {errors.imageError && (
            <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>
              Lỗi: {errors.imageError}
            </div>
          )}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Form.Item
                    label="Mã Sản Phẩm"
                    name="MaSP"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mã sản phẩm!' },
                      { validator: noWhitespace },
                    ]}
                  >
                    <Input
                      value={product.MaSP}
                      onChange={(e) => handleProductChange('MaSP', e.target.value)}
                      placeholder="Nhập mã sản phẩm"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Trạng Thái"
                    name="TrangThai"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                  >
                    <Select
                      value={product.TrangThai}
                      onChange={(value) => handleProductChange('TrangThai', value)}
                      placeholder="Chọn trạng thái"
                      size="large"
                    >
                      <Option value="">Vui lòng chọn</Option>
                      <Option value="Còn hàng">Còn hàng</Option>
                      <Option value="Hết hàng">Hết hàng</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Màu Sắc"
                    name="Mau1"
                    rules={[{ required: true, message: 'Vui lòng nhập màu sắc!' }, { validator: noWhitespace }]}
                  >
                    <Input
                      value={product.Mau1}
                      onChange={(e) => handleProductChange('Mau1', e.target.value)}
                      placeholder="Nhập màu sắc"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Card title="Bộ Nhớ, Giá và Số Lượng" style={{ marginBottom: '20px', padding: '10px' }}>
                {product.memoryData.map((data, memoryIndex) => (
                  data.isVisible && (
                    <Row key={memoryIndex} gutter={[16, 16]} style={{ marginBottom: 16, alignItems: 'middle' }}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={`Bộ Nhớ Trong ${memoryIndex + 1}`}
                          name={`BoNhoTrong_${memoryIndex}`}
                          rules={[
                            {
                              validator: (_, value) => {
                                if (value === 'Vui lòng chọn bộ nhớ') {
                                  return Promise.reject('Vui lòng chọn bộ nhớ!');
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                          initialValue={data.BoNhoTrong}
                        >
                          <Select
                            placeholder="Vui lòng chọn bộ nhớ"
                            size="large"
                            onChange={(value) => handleMemoryDataChange(memoryIndex, 'BoNhoTrong', value)}
                          >
                            <Option value="Vui lòng chọn bộ nhớ">Vui lòng chọn bộ nhớ</Option>
                            {[
                              { value: '32GB', label: '32GB' },
                              { value: '64GB', label: '64GB' },
                              { value: '128GB', label: '128GB' },
                              { value: '256GB', label: '256GB' },
                              { value: '512GB', label: '512GB' },
                              { value: '1TB', label: '1TB' },
                            ].map((option) => {
                              const selectedMemories = getSelectedMemories(memoryIndex);
                              const isDisabled = selectedMemories.includes(option.value);
                              return (
                                <Option key={option.value} value={option.value} disabled={isDisabled}>
                                  {option.label}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={memoryIndex === 0 ? 8 : 7}>
                        <Form.Item
                          label={`Giá Sản Phẩm ${memoryIndex + 1}`}
                          name={`GiaSP_${memoryIndex}`}
                          rules={[
                            {
                              required: data.BoNhoTrong !== 'Vui lòng chọn bộ nhớ',
                              message: 'Vui lòng nhập giá!',
                            },
                            { validator: noNegativeNumber },
                          ]}
                          initialValue={data.GiaSP}
                        >
                          <Input
                            type="number"
                            placeholder="Nhập giá"
                            size="large"
                            disabled={data.BoNhoTrong === 'Vui lòng chọn bộ nhớ'}
                            onChange={(e) => handleMemoryDataChange(memoryIndex, 'GiaSP', e.target.value)}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={memoryIndex === 0 ? 8 : 7}>
                        <Form.Item
                          label={`Số Lượng ${memoryIndex + 1}`}
                          name={`SoLuong_${memoryIndex}`}
                          rules={[
                            {
                              required: data.BoNhoTrong !== 'Vui lòng chọn bộ nhớ',
                              message: 'Vui lòng nhập số lượng!',
                            },
                            { validator: noNegativeNumber },
                          ]}
                          initialValue={data.SoLuong}
                        >
                          <Input
                            type="number"
                            placeholder="Nhập số lượng"
                            size="large"
                            disabled={
                              data.BoNhoTrong === 'Vui lòng chọn bộ nhớ' ||
                              product.TrangThai === 'Hết hàng'
                            }
                            onChange={(e) => handleMemoryDataChange(memoryIndex, 'SoLuong', e.target.value)}
                            value={product.TrangThai === 'Hết hàng' ? '0' : undefined}
                          />
                        </Form.Item>
                      </Col>
                      {memoryIndex > 0 && (
                        <Col xs={24} md={2}>
                          <Button
                            type="link"
                            icon={<EyeInvisibleOutlined />}
                            onClick={() => hideMemory(memoryIndex)}
                          >
                            Ẩn
                          </Button>
                        </Col>
                      )}
                    </Row>
                  )
                ))}
                <Button
                  type="link"
                  icon={product.memoryData.filter(data => data.isVisible).length < 6 ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  onClick={toggleMemoryVisibility}
                  style={{ marginTop: 8 }}
                >
                  Thêm bộ nhớ
                </Button>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Hình Ảnh Sản Phẩm" style={{ padding: '10px' }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Form.Item
                      label="Hình Ảnh 1"
                      name="HinhAnh1"
                      valuePropName="file"
                      getValueFromEvent={() => product.HinhAnh1}
                    >
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, 'HinhAnh1')}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="large">
                          Tải lên
                        </Button>
                      </Upload>
                      {product.HinhAnh1 && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={product.HinhAnh1}
                            alt="Hình ảnh 1"
                            style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=Error+Loading+Image';
                              console.error('Lỗi tải HinhAnh1:', product.HinhAnh1);
                            }}
                          />
                          <Button
                            type="link"
                            onClick={() => handleProductChange('HinhAnh1', null)}
                            style={{ marginLeft: '10px', color: 'red' }}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Hình Ảnh 2"
                      name="HinhAnh2"
                      valuePropName="file"
                      getValueFromEvent={() => product.HinhAnh2}
                    >
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, 'HinhAnh2')}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="large">
                          Tải lên
                        </Button>
                      </Upload>
                      {product.HinhAnh2 && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={product.HinhAnh2}
                            alt="Hình ảnh 2"
                            style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=Error+Loading+Image';
                              console.error('Lỗi tải HinhAnh2:', product.HinhAnh2);
                            }}
                          />
                          <Button
                            type="link"
                            onClick={() => handleProductChange('HinhAnh2', null)}
                            style={{ marginLeft: '10px', color: 'red' }}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Hình Ảnh 3"
                      name="HinhAnh3"
                      valuePropName="file"
                      getValueFromEvent={() => product.HinhAnh3}
                    >
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, 'HinhAnh3')}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="large">
                          Tải lên
                        </Button>
                      </Upload>
                      {product.HinhAnh3 && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={product.HinhAnh3}
                            alt="Hình ảnh 3"
                            style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=Error+Loading+Image';
                              console.error('Lỗi tải HinhAnh3:', product.HinhAnh3);
                            }}
                          />
                          <Button
                            type="link"
                            onClick={() => handleProductChange('HinhAnh3', null)}
                            style={{ marginLeft: '10px', color: 'red' }}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Hình Ảnh 4"
                      name="HinhAnh4"
                      valuePropName="file"
                      getValueFromEvent={() => product.HinhAnh4}
                    >
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, 'HinhAnh4')}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="large">
                          Tải lên
                        </Button>
                      </Upload>
                      {product.HinhAnh4 && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={product.HinhAnh4}
                            alt="Hình ảnh 4"
                            style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=Error+Loading+Image';
                              console.error('Lỗi tải HinhAnh4:', product.HinhAnh4);
                            }}
                          />
                          <Button
                            type="link"
                            onClick={() => handleProductChange('HinhAnh4', null)}
                            style={{ marginLeft: '10px', color: 'red' }}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Hình Ảnh 5"
                      name="HinhAnh5"
                      valuePropName="file"
                      getValueFromEvent={() => product.HinhAnh5}
                    >
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, 'HinhAnh5')}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="large">
                          Tải lên
                        </Button>
                      </Upload>
                      {product.HinhAnh5 && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={product.HinhAnh5}
                            alt="Hình ảnh 5"
                            style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=Error+Loading+Image';
                              console.error('Lỗi tải HinhAnh5:', product.HinhAnh5);
                            }}
                          />
                          <Button
                            type="link"
                            onClick={() => handleProductChange('HinhAnh5', null)}
                            style={{ marginLeft: '10px', color: 'red' }}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Hình Ảnh 6"
                      name="HinhAnh6"
                      valuePropName="file"
                      getValueFromEvent={() => product.HinhAnh6}
                    >
                      <Upload
                        beforeUpload={(file) => handleImageUpload(file, 'HinhAnh6')}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="large">
                          Tải lên
                        </Button>
                      </Upload>
                      {product.HinhAnh6 && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={product.HinhAnh6}
                            alt="Hình ảnh 6"
                            style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=Error+Loading+Image';
                              console.error('Lỗi tải HinhAnh6:', product.HinhAnh6);
                            }}
                          />
                          <Button
                            type="link"
                            onClick={() => handleProductChange('HinhAnh6', null)}
                            style={{ marginLeft: '10px', color: 'red' }}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default ProductsAdd;