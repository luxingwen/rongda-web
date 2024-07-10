import { addUser, deleteUser, getUsers, updateUser } from '@/services/user';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Table, Select, Tag } from 'antd';
import { useEffect, useState } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({});

  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [pagination, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({ ...filters, ...pagination });
      console.log(response);
      setUsers(response.data.data);
      //   setPagination({
      //     ...pagination,
      //     total: response.data.total,
      //   });
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

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
      await deleteUser(id);
      message.success('删除成功');
      fetchUsers();
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
      console.log('handleOk', values);
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
      fetchUsers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
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
      case "0":
        return <Tag color="red">未知</Tag>;
      case "1":
        return <Tag color="green">男</Tag>;
      case "2":
        return <Tag color="grey">女</Tag>;
      default:
        return null;
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status) => renderStatus(status), },
    { title: '年龄', dataIndex: 'age', key: 'age'},
    { title: '性别', dataIndex: 'sex', key: 'sex',  render: (sex) => renderSex(sex),  },
    { title: '个性签名', dataIndex: 'signed', key: 'signed' },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
            danger
          />
        </span>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddUser}
        style={{ marginBottom: 16 }}
      >
        添加用户
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
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
