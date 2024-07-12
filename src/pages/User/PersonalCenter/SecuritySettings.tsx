import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, message, Divider, Modal, Form, Input, Progress } from 'antd';
import { getMyUserInfo } from '@/services/user';

const { Title, Paragraph, Text } = Typography;

const SecuritySettings = () => {
  const [securityInfo, setSecurityInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [progressColor, setProgressColor] = useState('#f5222d'); // 初始为红色
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchSecurityInfo = async () => {
      setLoading(true);
      try {
        const response = await getMyUserInfo();
        setSecurityInfo(response.data);
      } catch (error) {
        message.error('获取安全信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityInfo();
  }, []);

  const handlePasswordChange = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handlePasswordUpdate = async (values) => {
    setLoading(true);
    // TODO: Update password logic here
    setTimeout(() => {
      message.success('密码更新成功');
      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
    }, 1000);
  };

  const checkPasswordStrength = (value) => {
    let strength = 0;
    if (value.length > 5) strength += 20;
    if (value.length > 8) strength += 30;
    if (/[A-Z]/.test(value)) strength += 20;
    if (/[0-9]/.test(value)) strength += 20;
    if (/[^A-Za-z0-9]/.test(value)) strength += 10;

    let label = '弱';
    let color = '#f5222d'; // 红色

    if (strength > 60) {
      label = '中等';
      color = '#faad14'; // 橙色
    }
    if (strength > 80) {
      label = '强';
      color = '#52c41a'; // 绿色
    }

    setPasswordStrength(strength);
    setStrengthLabel(label);
    setProgressColor(color);
    return strength;
  };

  return (
    <Card loading={loading}>
      <Title level={4}>安全设置</Title>
      <Divider />
      <Row gutter={16}>
        <Col span={24}>
          <Row>
            <Col span={12}>
              <Paragraph>账户密码</Paragraph>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button type="link" onClick={handlePasswordChange}>修改</Button>
            </Col>
          </Row>
          <Paragraph type="secondary">当前密码强度：强</Paragraph>
          <Divider />
          <Row>
            <Col span={12}>
              <Paragraph>手机</Paragraph>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button type="link">修改</Button>
            </Col>
          </Row>
          <Paragraph type="secondary">已绑定手机：{securityInfo?.phone}</Paragraph>
          <Divider />
         
          <Row>
            <Col span={12}>
              <Paragraph>邮箱</Paragraph>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button type="link">修改</Button>
            </Col>
          </Row>
          <Paragraph type="secondary">已绑定邮箱：{securityInfo?.email}</Paragraph>
          
        </Col>
      </Row>

      <Modal
        title="修改密码"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordUpdate}
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password onChange={(e) => checkPasswordStrength(e.target.value)} />
          </Form.Item>
          <div>
            <Text>密码强度: {strengthLabel}</Text>
            <Progress percent={passwordStrength} showInfo={false} strokeColor={progressColor} />
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>更新密码</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SecuritySettings;
