import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRoles, addRole, updateRole, deleteRole } from '@/services/role';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({});

  const [form] = Form.useForm();

  useEffect(() => {
    fetchRoles();
  }, [pagination, filters]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await getRoles({ ...filters, ...pagination });
      setRoles(response.data.data);
    } catch (error) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditRole = (record) => {
    setEditingRole(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteRole = async (id) => {
    setLoading(true);
    try {
      await deleteRole(id);
      message.success('删除成功');
      fetchRoles();
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await updateRole({ ...editingRole, ...values });
        message.success('更新成功');
      } else {
        await addRole(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      fetchRoles();
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

  const renderIsActive = (isActive) => (
    <Tag color={isActive ? 'green' : 'red'}>{isActive ? '活跃' : '禁用'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'desc', key: 'desc' },
    {
      title: '活跃状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => renderIsActive(isActive),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRole(record.id)}
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
        onClick={handleAddRole}
        style={{ marginBottom: 16 }}
      >
        添加角色
      </Button>
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="desc" label="描述">
            <Input />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="活跃状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement;
