import { addUser, deleteUser, getUsers, updateUser } from '@/services/user';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Tag,
  Typography,
  Progress,
} from 'antd';
import { useEffect, useState, useCallback } from 'react';

const { Option } = Select;

const { Title, Paragraph, Text } = Typography;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [progressColor, setProgressColor] = useState('#f5222d'); // 初始为红色

  const [form] = Form.useForm();

  const fetchUsers = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await getUsers(params);
      setUsers(response.data.data);
      setPagination({
        ...params,
        total: response.data.total,
      });
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers({ current: pagination.current, pageSize: pagination.pageSize });
  }, [pagination.current, pagination.pageSize, fetchUsers]);

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (id) => {
    setLoading(true);
    try {
      const res = await deleteUser({ uuid: id });
      if (res.code !== 200) {
        message.error('删除失败 :' + res.message);
      } else {
        message.success('删除成功');
        fetchUsers({ current: pagination.current, pageSize: pagination.pageSize });
      }
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.age = parseInt(values.age ? values.age : 0);
      values.password_strength = passwordStrength
      if (editingUser) {
        await updateUser({ ...editingUser, ...values });
        message.success('更新成功');
      } else {
        const res = await addUser(values);
        if (res.code === 200) {
          message.success('添加成功');
        } else {
          message.error('添加失败 :' + res.message);
        }
      }
      setIsModalVisible(false);
      fetchUsers({ current: pagination.current, pageSize: pagination.pageSize });
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderStatus = (status) => {
    switch (status) {
      case 0:
        return <Tag color="red">禁用</Tag>;
      case 1:
        return <Tag color="green">启用</Tag>;
      case 2:
        return <Tag color="grey">删除</Tag>;
      default:
        return <Tag color="blue">未知</Tag>;
    }
  };

  const renderSex = (sex) => {
    switch (sex) {
      case '0':
        return <Tag color="red">未知</Tag>;
      case '1':
        return <Tag color="green">男</Tag>;
      case '2':
        return <Tag color="grey">女</Tag>;
      default:
        return null;
    }
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


  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
    },
    { title: '年龄', dataIndex: 'age', key: 'age', hideInSearch: true, },
    {
      title: '性别',
      dataIndex: 'sex',
      key: 'sex',
      render: (sex) => renderSex(sex),
      hideInSearch: true,
    },
    { title: '个性签名', dataIndex: 'signed', key: 'signed', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteUser(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>

      <ProTable
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
            type="primary"
          >
            添加用户
          </Button>,
        ]}

      />
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: !editingUser, message: '请输入密码' }]}
          >
            <Input.Password onChange={(e) => checkPasswordStrength(e.target.value)} />
          </Form.Item>
          <div>
            <Text>密码强度: {strengthLabel}</Text>
            <Progress percent={passwordStrength} showInfo={false} strokeColor={progressColor} />
          </div>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue={1}
          >
            <Select>
              <Option value={0}>禁用</Option>
              <Option value={1}>启用</Option>
              <Option value={2}>删除</Option>
            </Select>
          </Form.Item>
          <Form.Item name="age" label="年龄">
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="sex"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
            initialValue="0"
          >
            <Select>
              <Option value="0">未知</Option>
              <Option value="1">男</Option>
              <Option value="2">女</Option>
            </Select>
          </Form.Item>
          <Form.Item name="signed" label="个性签名">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
