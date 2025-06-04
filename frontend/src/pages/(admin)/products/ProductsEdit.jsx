import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProducts, updateProducts, fetchBrands, uploadImage } from "../../../service/api";
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Card,
  Spin,
  Alert,
  Typography,
  Upload,
  message,
} from "antd";
import { LeftOutlined, UploadOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import io from "socket.io-client";

const { Title, Text } = Typography;
const { Option } = Select;

// Kết nối Socket.IO
const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
});

const ProductsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [product, setProduct] = useState({});
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quantityErrors, setQuantityErrors] = useState({});
  const [priceErrors, setPriceErrors] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [initialQuantities, setInitialQuantities] = useState({});
  const [initialMemories, setInitialMemories] = useState({});
  const [initialPrices, setInitialPrices] = useState({});
  const [visibleVersions, setVisibleVersions] = useState([1]);

  // Validators
  const noWhitespace = (_, value) => {
    if (!value || value.trim() === "") {
      return Promise.reject(new Error("Không được bỏ trống hoặc chỉ chứa khoảng trắng!"));
    }
    return Promise.resolve();
  };

  const noEmpty = (_, value) => {
    if (!value || value.trim() === "") {
      return Promise.reject(new Error("Không được bỏ trống!"));
    }
    return Promise.resolve();
  };

  const noNegativeNumber = (_, value) => {
    if (value === "" || value === undefined || value === null) {
      return Promise.reject(new Error("Không được bỏ trống!"));
    }
    if (isNaN(value) || Number(value) < 0) {
      return Promise.reject(new Error("Giá trị phải là số không âm!"));
    }
    if (/\s/.test(value)) {
      return Promise.reject(new Error("Không được chứa khoảng trắng!"));
    }
    return Promise.resolve();
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getProducts(id), fetchBrands()])
      .then(([productRes, brandsRes]) => {
        const productData = productRes.data.data;
        const updatedProductData = { ...productData };
        const quantities = {};
        const memories = {};
        const prices = {};
        const versions = [];
        for (let i = 1; i <= 6; i++) {
          if (!updatedProductData[`BoNhoTrong${i}`] || updatedProductData[`BoNhoTrong${i}`] === "") {
            updatedProductData[`BoNhoTrong${i}`] = "Không có";
            updatedProductData[`GiaSP${i}`] = 0;
            updatedProductData[`SoLuong${i}`] = 0;
          } else if (updatedProductData[`BoNhoTrong${i}`] !== "Không có") {
            versions.push(i);
          }
          quantities[`SoLuong${i}`] = updatedProductData[`SoLuong${i}`] || 0;
          memories[`BoNhoTrong${i}`] = updatedProductData[`BoNhoTrong${i}`];
          prices[`GiaSP${i}`] = updatedProductData[`GiaSP${i}`] || 0;
        }
        setProduct(updatedProductData);
        setInitialQuantities(quantities);
        setInitialMemories(memories);
        setInitialPrices(prices);
        setVisibleVersions(versions.length > 0 ? versions : [1]);
        form.setFieldsValue(updatedProductData);
        setBrands(brandsRes.data.data);
        validateQuantities(updatedProductData);
      })
      .catch(() => setError("Không thể tải dữ liệu sản phẩm hoặc thương hiệu."))
      .finally(() => setLoading(false));
  }, [id, form]);

  const handleImageUpload = async (file, fieldName) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await uploadImage(formData);
      setProduct((prev) => ({
        ...prev,
        [fieldName]: response.data.imageUrl,
      }));
      form.setFieldsValue({ [fieldName]: response.data.imageUrl });
      message.success(`Tải ảnh ${fieldName} thành công!`);
      return false;
    } catch (error) {
      message.error(`Tải ảnh ${fieldName} thất bại!`);
      return false;
    }
  };

  const onFinish = async (values) => {
    try {
      let updatedValues = { ...values, _id: id };

      // Đặt các phiên bản không hiển thị về "Không có"
      for (let i = 1; i <= 6; i++) {
        if (!visibleVersions.includes(i)) {
          updatedValues[`BoNhoTrong${i}`] = "Không có";
          updatedValues[`SoLuong${i}`] = 0;
          updatedValues[`GiaSP${i}`] = 0;
        }
      }

      // Kiểm tra trạng thái và số lượng
      if (updatedValues.TrangThai === "Còn hàng") {
        const allQuantitiesZero = visibleVersions.every(
          (version) =>
            updatedValues[`BoNhoTrong${version}`] === "Không có" ||
            Number(updatedValues[`SoLuong${version}`] || 0) === 0
        );

        if (allQuantitiesZero) {
          updatedValues.TrangThai = "Hết hàng";
          for (let i = 1; i <= 6; i++) {
            if (updatedValues[`BoNhoTrong${i}`] !== "Không có") {
              updatedValues[`SoLuong${i}`] = 0;
            }
          }
          form.setFieldsValue({ 
            TrangThai: "Hết hàng",
            ...Object.fromEntries(
              Array.from({ length: 6 }, (_, i) => [
                [`SoLuong${i + 1}`, updatedValues[`BoNhoTrong${i + 1}`] !== "Không có" ? 0 : updatedValues[`SoLuong${i + 1}`]],
              ]).flat()
            ),
          });
          setProduct((prev) => ({
            ...prev,
            TrangThai: "Hết hàng",
            ...Object.fromEntries(
              Array.from({ length: 6 }, (_, i) => [
                [`SoLuong${i + 1}`, updatedValues[`BoNhoTrong${i + 1}`] !== "Không có" ? 0 : prev[`SoLuong${i + 1}`]],
                [`GiaSP${i + 1}`, updatedValues[`GiaSP${i + 1}`]],
              ]).flat()
            ),
          }));
          setQuantityErrors({});
          setPriceErrors({});
          setIsSubmitDisabled(false);
        }
      } else if (updatedValues.TrangThai === "Hết hàng") {
        const allMemoriesNone = visibleVersions.every(
          (version) => updatedValues[`BoNhoTrong${version}`] === "Không có"
        );

        if (allMemoriesNone) {
          for (let i = 1; i <= 6; i++) {
            updatedValues[`SoLuong${i}`] = 0;
            updatedValues[`GiaSP${i}`] = 0;
          }
          form.setFieldsValue({ TrangThai: "Hết hàng" });
          setProduct((prev) => ({
            ...prev,
            TrangThai: "Hết hàng",
            ...Object.fromEntries(
              Array.from({ length: 6 }, (_, i) => [
                [`SoLuong${i + 1}`, 0],
                [`GiaSP${i + 1}`, 0],
              ]).flat()
            ),
          }));
          setQuantityErrors({});
          setPriceErrors({});
          setIsSubmitDisabled(false);
        }
      }

      const updatedProduct = await updateProducts(id, updatedValues);
      message.success("Cập nhật sản phẩm thành công!");
      // Phát sự kiện productUpdated với dữ liệu đầy đủ
      socket.emit("productUpdated", updatedValues);
      const newQuantities = {};
      const newMemories = {};
      const newPrices = {};
      for (let i = 1; i <= 6; i++) {
        newQuantities[`SoLuong${i}`] = updatedValues[`SoLuong${i}`] || 0;
        newMemories[`BoNhoTrong${i}`] = updatedValues[`BoNhoTrong${i}`];
        newPrices[`GiaSP${i}`] = updatedValues[`GiaSP${i}`] || 0;
      }
      setInitialQuantities(newQuantities);
      setInitialMemories(newMemories);
      setInitialPrices(newPrices);
      navigate("/admin/products");
    } catch (error) {
      setError("Có lỗi xảy ra khi cập nhật sản phẩm.");
      message.error("Cập nhật sản phẩm thất bại!");
    }
  };

  const handleStatusChange = (value) => {
    const updatedFields = {};

    if (value === "Hết hàng") {
      for (let i = 1; i <= 6; i++) {
        if (product[`BoNhoTrong${i}`] !== "Không có") {
          updatedFields[`SoLuong${i}`] = 0;
        }
      }
    } else if (value === "Còn hàng") {
      for (let i = 1; i <= 6; i++) {
        if (product[`BoNhoTrong${i}`] !== "Không có") {
          updatedFields[`SoLuong${i}`] = initialQuantities[`SoLuong${i}`] || 1;
        }
      }
    }

    form.setFieldsValue(updatedFields);
    setProduct((prev) => ({
      ...prev,
      TrangThai: value,
      ...updatedFields,
    }));
    validateQuantities({ ...product, TrangThai: value, ...updatedFields });
  };

  const handleMemoryChange = (version, value) => {
    const updatedProduct = { ...product, [`BoNhoTrong${version}`]: value };
    if (value === "Không có") {
      updatedProduct[`GiaSP${version}`] = 0;
      updatedProduct[`SoLuong${version}`] = 0;
      form.setFieldsValue({
        [`GiaSP${version}`]: 0,
        [`SoLuong${version}`]: 0,
      });
      setQuantityErrors((prev) => ({
        ...prev,
        [`SoLuong${version}`]: null,
      }));
      setPriceErrors((prev) => ({
        ...prev,
        [`GiaSP${version}`]: null,
      }));
    } else {
      updatedProduct[`GiaSP${version}`] = product[`GiaSP${version}`] || 0;
      updatedProduct[`SoLuong${version}`] = product[`SoLuong${version}`] || (product.TrangThai === "Còn hàng" ? 1 : 0);
      form.setFieldsValue({
        [`GiaSP${version}`]: product[`GiaSP${version}`] || 0,
        [`SoLuong${version}`]: product[`SoLuong${version}`] || (product.TrangThai === "Còn hàng" ? 1 : 0),
      });
      validatePrice(version, product[`GiaSP${version}`] || 0);
    }
    setProduct(updatedProduct);
    setInitialMemories((prev) => ({
      ...prev,
      [`BoNhoTrong${version}`]: value,
    }));
    setInitialQuantities((prev) => ({
      ...prev,
      [`SoLuong${version}`]: updatedProduct[`SoLuong${version}`],
    }));
    setInitialPrices((prev) => ({
      ...prev,
      [`GiaSP${version}`]: updatedProduct[`GiaSP${version}`],
    }));
    validateQuantities(updatedProduct);
  };

  const handleQuantityChange = (version, value) => {
    const updatedProduct = { ...product, [`SoLuong${version}`]: value };
    setProduct(updatedProduct);
    setInitialQuantities((prev) => ({
      ...prev,
      [`SoLuong${version}`]: value,
    }));
    validateQuantities(updatedProduct);
  };

  const handlePriceChange = (version, value) => {
    const updatedProduct = { ...product, [`GiaSP${version}`]: value };
    setProduct(updatedProduct);
    setInitialPrices((prev) => ({
      ...prev,
      [`GiaSP${version}`]: value,
    }));
    validatePrice(version, value);
    validateQuantities(updatedProduct);
  };

  const validatePrice = (version, value) => {
    if (
      product.TrangThai === "Còn hàng" &&
      Number(value) === 0 &&
      product[`BoNhoTrong${version}`] !== "Không có"
    ) {
      setPriceErrors((prev) => ({
        ...prev,
        [`GiaSP${version}`]: "Giá không thể là 0 khi còn hàng!",
      }));
    } else {
      setPriceErrors((prev) => ({
        ...prev,
        [`GiaSP${version}`]: null,
      }));
    }
  };

  const validateQuantities = (currentProduct) => {
    const prices = [
      currentProduct.GiaSP1 || 0,
      currentProduct.GiaSP2 || 0,
      currentProduct.GiaSP3 || 0,
      currentProduct.GiaSP4 || 0,
      currentProduct.GiaSP5 || 0,
      currentProduct.GiaSP6 || 0,
    ];
    let hasError = false;

    if (currentProduct.TrangThai === "Còn hàng") {
      for (let i = 1; i <= 6; i++) {
        const memory = currentProduct[`BoNhoTrong${i}`];
        const price = Number(prices[i - 1]);

        if (memory !== "Không có" && price === 0) {
          hasError = true;
          setPriceErrors((prev) => ({
            ...prev,
            [`GiaSP${i}`]: "Giá không thể là 0 khi còn hàng!",
          }));
        } else {
          setPriceErrors((prev) => ({
            ...prev,
            [`GiaSP${i}`]: null,
          }));
        }
      }
    } else {
      setQuantityErrors({});
      setPriceErrors({});
    }

    setIsSubmitDisabled(hasError);
  };

  const getSelectedMemories = (currentVersion) => {
    const memories = [
      product.BoNhoTrong1,
      product.BoNhoTrong2,
      product.BoNhoTrong3,
      product.BoNhoTrong4,
      product.BoNhoTrong5,
      product.BoNhoTrong6,
    ];
    return memories
      .map((memory, index) => (index + 1 !== currentVersion ? memory : null))
      .filter((memory) => memory && memory !== "Không có" && memory !== "");
  };

  const addVersion = () => {
    if (visibleVersions.length < 6) {
      const allVersions = [1, 2, 3, 4, 5, 6];
      const unusedVersion = allVersions.find((v) => !visibleVersions.includes(v));
      setVisibleVersions([...visibleVersions, unusedVersion].sort((a, b) => a - b));
      form.setFieldsValue({
        [`BoNhoTrong${unusedVersion}`]: "Không có",
        [`SoLuong${unusedVersion}`]: 0,
        [`GiaSP${unusedVersion}`]: 0,
      });
      setProduct((prev) => ({
        ...prev,
        [`BoNhoTrong${unusedVersion}`]: "Không có",
        [`SoLuong${unusedVersion}`]: 0,
        [`GiaSP${unusedVersion}`]: 0,
      }));
    }
  };

  const removeVersion = (version) => {
    if (visibleVersions.length > 1) {
      setVisibleVersions(visibleVersions.filter((v) => v !== version).sort((a, b) => a - b));
      form.setFieldsValue({
        [`BoNhoTrong${version}`]: "Không có",
        [`SoLuong${version}`]: 0,
        [`GiaSP${version}`]: 0,
      });
      setProduct((prev) => ({
        ...prev,
        [`BoNhoTrong${version}`]: "Không có",
        [`SoLuong${version}`]: 0,
        [`GiaSP${version}`]: 0,
      }));
      setQuantityErrors((prev) => ({
        ...prev,
        [`SoLuong${version}`]: null,
      }));
      setPriceErrors((prev) => ({
        ...prev,
        [`GiaSP${version}`]: null,
      }));
      validateQuantities({
        ...product,
        [`BoNhoTrong${version}`]: "Không có",
        [`SoLuong${version}`]: 0,
        [`GiaSP${version}`]: 0,
      });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16, display: "block" }}>Đang tải dữ liệu...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: "20px auto", maxWidth: 600 }}
      />
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f0f2f5" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3}>Chỉnh Sửa Sản Phẩm</Title>
        </Col>
        <Col>
          <Link to="/admin/products">
            <Button type="default" icon={<LeftOutlined />}>
              Quay lại
            </Button>
          </Link>
        </Col>
      </Row>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={product}
        validateTrigger="onSubmit"
      >
        <Card
          title={<Text strong>Thông Tin Cơ Bản</Text>}
          style={{ marginBottom: 24 }}
          headStyle={{ background: "#1890ff", color: "#fff" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
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
                        return Promise.reject(new Error('Tên sản phẩm tối thiểu 3 ký tự!'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Mã Sản Phẩm" name="MaSP">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Thương Hiệu"
                name="TenTH"
                rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
              >
                <Select placeholder="Chọn thương hiệu">
                  {brands.map((brand) => (
                    <Option key={brand._id} value={brand.TenTH}>
                      {brand.TenTH}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Trạng Thái"
                name="TrangThai"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
              >
                <Select
                  placeholder="Chọn trạng thái"
                  onChange={handleStatusChange}
                >
                  <Option value="Còn hàng">Còn hàng</Option>
                  <Option value="Hết hàng">Hết hàng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title={<Text strong>Phiên Bản Sản Phẩm</Text>}
          style={{ marginBottom: 24 }}
          headStyle={{ background: "#13c2c2", color: "#fff" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Màu 1"
                name="Mau1"
                rules={[{ required: true, message: "Vui lòng nhập màu!" }, { validator: noWhitespace }]}
              >
                <Input
                  placeholder="Nhập màu"
                  addonAfter={
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: product.Mau1 || "#fff",
                        border: "1px solid #d9d9d9",
                        borderRadius: 4,
                      }}
                    />
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          {visibleVersions.map((version) => (
            <Row gutter={[16, 16]} key={version} style={{ marginBottom: 16 }}>
              <Col xs={24} md={7}>
                <Form.Item
                  label={`Bộ Nhớ Trong ${version}`}
                  name={`BoNhoTrong${version}`}
                  rules={[{ required: false }]}
                >
                  <Select
                    placeholder="Không có"
                    onChange={(value) => handleMemoryChange(version, value)}
                  >
                    {[
                      { value: "Không có", label: "Không có" },
                      { value: "32GB", label: "32GB" },
                      { value: "64GB", label: "64GB" },
                      { value: "128GB", label: "128GB" },
                      { value: "256GB", label: "256GB" },
                      { value: "512GB", label: "512GB" },
                      { value: "1TB", label: "1TB" },
                    ].map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        disabled={getSelectedMemories(version).includes(option.value) && option.value !== "Không có"}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={7}>
                <Form.Item
                  label={`Số Lượng Bộ Nhớ Trong ${version}`}
                  name={`SoLuong${version}`}
                  rules={[
                    {
                      required: product[`BoNhoTrong${version}`] !== "Không có" && product.TrangThai === "Còn hàng",
                      message: "Vui lòng nhập số lượng!",
                    },
                    { validator: noNegativeNumber },
                  ]}
                  validateStatus={quantityErrors[`SoLuong${version}`] ? "error" : ""}
                  help={quantityErrors[`SoLuong${version}`]}
                >
                  <Input
                    type="number"
                    placeholder="Nhập số lượng"
                    disabled={
                      product.TrangThai === "Hết hàng" ||
                      product[`BoNhoTrong${version}`] === "Không có"
                    }
                    onChange={(e) => handleQuantityChange(version, e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={7}>
                <Form.Item
                  label={`Giá ${version}`}
                  name={`GiaSP${version}`}
                  rules={[
                    {
                      required: product[`BoNhoTrong${version}`] !== "Không có" && product.TrangThai === "Còn hàng",
                      message: "Vui lòng nhập giá!",
                    },
                    { validator: noNegativeNumber },
                  ]}
                  validateStatus={priceErrors[`GiaSP${version}`] ? "error" : ""}
                  help={priceErrors[`GiaSP${version}`]}
                >
                  <Input
                    type="number"
                    placeholder={`Nhập giá sản phẩm ${version}`}
                    disabled={product[`BoNhoTrong${version}`] === "Không có"}
                    onChange={(e) => handlePriceChange(version, e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={3} style={{ display: "flex", alignItems: "center" }}>
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={() => removeVersion(version)}
                  disabled={visibleVersions.length === 1}
                >
                  Xóa
                </Button>
              </Col>
            </Row>
          ))}

          <Row>
            <Col xs={24}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addVersion}
                disabled={visibleVersions.length >= 6}
                block
              >
                Thêm Phiên Bản
              </Button>
            </Col>
          </Row>
        </Card>

        <Card
          title={<Text strong>Hình Ảnh Sản Phẩm</Text>}
          style={{ marginBottom: 24 }}
          headStyle={{ background: "#52c41a", color: "#fff" }}
        >
          <Row gutter={[16, 16]}>
            {["HinhAnh1", "HinhAnh2", "HinhAnh3", "HinhAnh4", "HinhAnh5", "HinhAnh6"].map(
              (field, index) => (
                <Col xs={24} md={12} key={field}>
                  <Form.Item label={`Hình Ảnh ${index + 1}`} name={field}>
                    <Upload
                      beforeUpload={(file) => handleImageUpload(file, field)}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>Tải lên</Button>
                    </Upload>
                    {product[field] && (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={product[field]}
                          alt={`Preview ${index + 1}`}
                          style={{ maxWidth: 150, maxHeight: 150, borderRadius: 8 }}
                        />
                      </div>
                    )}
                  </Form.Item>
                </Col>
              )
            )}
          </Row>
        </Card>

        <Card
          title={<Text strong>Mô Tả Sản Phẩm</Text>}
          style={{ marginBottom: 24 }}
          headStyle={{ background: "#faad14", color: "#fff" }}
        >
          <Form.Item
            label="Mô Tả"
            name="MoTa"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }, { validator: noEmpty }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>
        </Card>

        <Card
          title={<Text strong>Thông Tin Chi Tiết</Text>}
          style={{ marginBottom: 24 }}
          headStyle={{ background: "#722ed1", color: "#fff" }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Hệ Điều Hành"
                name="HDH"
                rules={[{ required: true, message: "Vui lòng chọn hệ điều hành!" }]}
              >
                <Select placeholder="Chọn hệ điều hành">
                  <Option value="IOS">IOS</Option>
                  <Option value="ANDROID">ANDROID</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Camera Trước"
                name="CamTruoc"
                rules={[{ required: true, message: "Vui lòng chọn độ phân giải camera trước!" }]}
              >
                <Select placeholder="Chọn độ phân giải">
                  <Option value="8px">8 PX</Option>
                  <Option value="12px">12 PX</Option>
                  <Option value="32px">32 PX</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Camera Sau"
                name="CamSau"
                rules={[{ required: true, message: "Vui lòng chọn độ phân giải camera sau!" }]}
              >
                <Select placeholder="Chọn độ phân giải">
                  <Option value="12px">12 PX</Option>
                  <Option value="48px">48 PX</Option>
                  <Option value="50px">50 PX</Option>
                  <Option value="64px">64 PX</Option>
                  <Option value="108px">108 PX</Option>
                  <Option value="200px">200 PX</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="CPU"
                name="CPU"
                rules={[{ required: true, message: "Vui lòng chọn loại CPU!" }]}
              >
                <Select placeholder="Chọn loại CPU">
                  <Option value="APPLE CHIPSET">APPLE CHIPSET</Option>
                  <Option value="ANDROID CHIPSET">ANDROID CHIPSET</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Màn Hình"
                name="ManHinh"
                rules={[{ required: true, message: "Vui lòng chọn kích thước màn hình!" }]}
              >
                <Select placeholder="Chọn kích thước màn hình">
                  <Option value="4.7inch">4.7 inch</Option>
                  <Option value="5.1inch">5.1 inch</Option>
                  <Option value="5.5inch">5.5 inch</Option>
                  <Option value="6inch">6 inch</Option>
                  <Option value="6.5inch">6.5 inch</Option>
                  <Option value="6.7inch">6.7 inch</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Cáp Sạc"
                name="CapSac"
                rules={[{ required: true, message: "Vui lòng chọn loại cáp sạc!" }]}
              >
                <Select placeholder="Chọn loại cáp sạc">
                  <Option value="Type-C">Type-C</Option>
                  <Option value="Lightning">Lightning</Option>
                  <Option value="USB">USB</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Loại Pin"
                name="LoaiPin"
                rules={[{ required: true, message: "Vui lòng chọn loại pin!" }]}
              >
                <Select placeholder="Chọn loại pin">
                  <Option value="PISEN">PISEN</Option>
                  <Option value="Energizer">Energizer</Option>
                  <Option value="Duracell">Duracell</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={isSubmitDisabled}>
            Cập Nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductsEdit;