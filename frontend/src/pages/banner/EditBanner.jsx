import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Form,
  Upload,
  Image,
  Button,
  Checkbox,
  Typography,
  Card,
  message,
  Space,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  getBannerById,
  updateBanner,
  uploadImage,
  fetchBanners,
} from "../../../service/api";

const { Title } = Typography;

const BannerEdit = () => {
  const {
    reset,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const { id } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBanners = async () => {
      try {
        await fetchBanners(); // nếu cần
      } catch (error) {
        console.error("Error loading banners:", error);
      }
    };
    loadBanners();
  }, []);

  const handleImageUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await uploadImage(formData);
      const url = response.data.imageUrl;
      setImageUrl(url);
      setValue("imgUrl", url);
      message.success("Tải ảnh thành công");
    } catch (error) {
      message.error("Tải ảnh thất bại");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const bannerRes = await getBannerById(id);
        const data = bannerRes.data.data;
        setImageUrl(data.imgUrl);

        reset({
          imgUrl: data.imgUrl,
          status: data.status ?? false,
        });
      } catch (error) {
        console.error("Error loading banner:", error);
        message.error("Không thể tải dữ liệu banner!");
      }
    })();
  }, [id, reset, setValue]);

  const onSubmit = async (data) => {
    const bannerData = {
      ...data,
      imgUrl: imageUrl,
    };

    try {
      setLoading(true);
      await updateBanner(id, bannerData);
      message.success("Cập nhật banner thành công!");
      navigate("/admin/banners");
    } catch (error) {
      message.error("Cập nhật banner thất bại!");
      console.error(error.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <Title level={3} className="text-center text-yellow-500">
        Sửa Banner
      </Title>

      <Card bordered className="shadow">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {/* Upload hình ảnh */}
          <Form.Item label="Hình ảnh" required>
            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={handleImageUpload}
            >
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="Preview"
                width={200}
                className="mt-3"
                style={{ borderRadius: 8 }}
              />
            )}
            {!imageUrl && (
              <div style={{ color: "red", marginTop: 5 }}>
                {errors.imgUrl?.message}
              </div>
            )}
            <input
              type="hidden"
              {...register("imgUrl", {
                required: "Vui lòng tải lên hình ảnh",
              })}
            />
          </Form.Item>

          {/* Trạng thái */}
          <Form.Item label="Trạng thái">
            <Checkbox
              checked={!!watch("status")}
              onChange={(e) => setValue("status", e.target.checked)}
            >
              Kích hoạt
            </Checkbox>
          </Form.Item>

          {/* Nút hành động */}
          <Form.Item>
            <Space className="w-full justify-between">
              <Link to="/admin/banners">
                <Button icon={<ArrowLeftOutlined />}>Quay lại</Button>
              </Link>
              <Button
                type="primary"
                htmlType="submit"
                icon={<EditOutlined />}
                loading={loading}
              >
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BannerEdit;
