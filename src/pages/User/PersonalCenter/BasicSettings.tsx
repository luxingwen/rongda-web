import { getMyUserInfo, updateUser } from '@/services/user';
import { UploadOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';

const BasicSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await getMyUserInfo();
        setUser(response.data);
        form.setFieldsValue(response.data);
      } catch (error) {
        message.error('获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [form]);

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const res =await updateUser({uuid: user.uuid,  ...values});
      if (res.code !== 200) {
        message.error('更新失败 :' + res.message);
        return;
      }
      message.success('更新成功');
      setUser(values);
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    showUploadList: false,
    customRequest: async (info) => {
      // Simulate uploading
      setTimeout(() => {
        const updatedUser = {
          ...user,
          avatar: URL.createObjectURL(info.file),
        };
        setUser(updatedUser);
        form.setFieldsValue(updatedUser);
        message.success('头像上传成功');
      }, 1000);
    },
  };

  return (
    <Card loading={loading}>
      <Row gutter={16}>
        <Col span={16}>
          <Form form={form} layout="vertical" onFinish={handleUpdate}>
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="signed" label="个人简介">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item name="country" label="国家/地区">
              <Input />
            </Form.Item>
            <Form.Item name="province" label="所在省市">
              <Input />
            </Form.Item>
            <Form.Item name="address" label="街道地址">
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                更新基本信息
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Row justify="center">
            <Col span={24} style={{ textAlign: 'center' }}>
              <Avatar size={120} src={user?.avatar} />
            </Col>
            <Col span={24} style={{ textAlign: 'center', marginTop: 16 }}>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>更换头像</Button>
              </Upload>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default BasicSettings;
