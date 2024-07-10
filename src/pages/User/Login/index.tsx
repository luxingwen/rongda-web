import React from 'react';
import { Form, Input, Button, Checkbox, Card, message  } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '@/services/user';


const LoginPage = () => {
  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    login(values).then((res) => {
        console.log(res);
        if (res.code === 200) {
            message.success('登录成功');
        } else {
            message.error(res.message);
        }
        }).catch((err) => {
            console.log(err);
            message.error('登录失败');
        }
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-sm w-full">
        <Card style={{with: 400}} className="p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">登录</h2>
          <Form
            name="normal_login"
            className="space-y-6"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon text-gray-400" />}
                placeholder="用户名"
                className="w-full px-3 py-2 text-gray-700 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon text-gray-400" />}
                type="password"
                placeholder="密码"
                className="w-full px-3 py-2 text-gray-700 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </Form.Item>
            <Form.Item>
              <div className="flex items-center justify-between">
                <Checkbox className="text-gray-600">记住我</Checkbox>
                <a className="text-sm text-blue-600 hover:text-blue-500" href="#">
                  忘记密码?
                </a>
              </div>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
