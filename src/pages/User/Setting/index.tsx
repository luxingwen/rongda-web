import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Avatar, Typography, Tag, message, Space, Divider, Layout, Menu } from 'antd';
import { getMyUserInfo } from '@/services/user';

const { Title, Paragraph, Text } = Typography;
const { Sider, Content } = Layout;

const PersonalCenter = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await getMyUserInfo();
        setUser(response.data);
      } catch (error) {
        message.error('获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <Card loading={loading}>
      <Row gutter={16} justify="start" align="middle">
        <Col style={{ textAlign: 'center' }}>
          <Avatar size={120} src={user?.avatar} />
          <Title level={2}>{user?.username}</Title>
          <Paragraph>{user?.nickname}</Paragraph>
          <Divider />
          <div style={{ textAlign: 'left' }}>
            <Paragraph>
              <Text strong>UUID: </Text>{user?.uuid}
            </Paragraph>
            <Paragraph>
              <Text strong>邮箱: </Text>{user?.email}
            </Paragraph>
            <Paragraph>
              <Text strong>电话: </Text>{user?.phone}
            </Paragraph>
            <Paragraph>
              <Text strong>签名: </Text>{user?.signed}
            </Paragraph>
            <Paragraph>
              <Text strong>性别: </Text>{user?.sex}
            </Paragraph>
            <Paragraph>
              <Text strong>年龄: </Text>{user?.age}
            </Paragraph>
            <Paragraph>
              <Text strong>状态: </Text>{user?.status === 1 ? '启用' : '禁用'}
            </Paragraph>
          </div>
        </Col>
      </Row>
      <Divider />
      <div style={{ textAlign: 'left' }}>
        <Title level={4}>标签</Title>
        <Space wrap>
          <Tag color="blue">很有想法的</Tag>
          <Tag color="green">专注设计</Tag>
          <Tag color="orange">辣~</Tag>
          <Tag color="red">大长腿</Tag>
          <Tag color="purple">川妹子</Tag>
          <Tag color="cyan">海纳百川</Tag>
        </Space>
      </div>
      <Divider />
      <div style={{ textAlign: 'left' }}>
        <Title level={4}>团队</Title>
        <Space size="large">
          <Tag icon={<Avatar src="path_to_icon1.png" />} color="default">科学搬砖组</Tag>
          <Tag icon={<Avatar src="path_to_icon2.png" />} color="default">全组都是黑马</Tag>
          <Tag icon={<Avatar src="path_to_icon3.png" />} color="default">中二少女团</Tag>
          <Tag icon={<Avatar src="path_to_icon4.png" />} color="default">程序员日常</Tag>
          <Tag icon={<Avatar src="path_to_icon5.png" />} color="default">高逼格设计天团</Tag>
          <Tag icon={<Avatar src="path_to_icon6.png" />} color="default">骗你来学计算机</Tag>
        </Space>
      </div>
    </Card>
  );
};

const PersonalSettings = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');

  const handleMenuClick = (e) => {
    setSelectedMenuItem(e.key);
  };

  return (
    <Layout>
      <Sider width={200} className="site-layout-background">
        <Menu
          mode="inline"
          selectedKeys={[selectedMenuItem]}
          style={{ height: '100%', borderRight: 0 }}
          onClick={handleMenuClick}
        >
          <Menu.Item key="1">个人信息</Menu.Item>
          <Menu.Item key="2">基本设置</Menu.Item>
          <Menu.Item key="3">安全设置</Menu.Item>
          <Menu.Item key="4">账户绑定</Menu.Item>
          <Menu.Item key="5">新消息通知</Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ padding: '0 24px 24px' }}>
        <Content
          className="site-layout-background"
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}
        >
          {selectedMenuItem === '1' && <PersonalCenter />}
          {selectedMenuItem === '2' && <Card>基本设置内容</Card>}
          {selectedMenuItem === '3' && <Card>安全设置内容</Card>}
          {selectedMenuItem === '4' && <Card>账户绑定内容</Card>}
          {selectedMenuItem === '5' && <Card>新消息通知内容</Card>}
        </Content>
      </Layout>
    </Layout>
  );
};

export default PersonalSettings;
