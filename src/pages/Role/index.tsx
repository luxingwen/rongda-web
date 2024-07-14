import React, { useState, useEffect, useCallback } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRoles, addRole, updateRole, deleteRole } from '@/services/role';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [form] = Form.useForm();

  const fetchRoles = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await getRoles(params);
      setRoles(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }));
    } catch (error) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles({ current: pagination.current, pageSize: pagination.pageSize });
  }, [pagination.current, pagination.pageSize, fetchRoles]);

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
      fetchRoles({ current: pagination.current, pageSize: pagination.pageSize });
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
      fetchRoles({ current: pagination.current, pageSize: pagination.pageSize });
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteRole(record.id)}
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
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddRole}
        style={{ marginBottom: 16 }}
      >
        添加角色
      </Button>
      <ProTable
        columns={columns}
        dataSource={roles}
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
        search={false}
        options={false}
      />
      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        open={isModalVisible}
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
