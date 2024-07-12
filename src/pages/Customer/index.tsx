import React, { useState, useEffect, useCallback } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/services/customer';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [form] = Form.useForm();

  const fetchCustomers = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await getCustomers(params);
      if(response.code !== 200) {
        message.error(response.message);
        return;
      }
      setCustomers(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.total,
      }));
    } catch (error) {
      message.error('获取客户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers({ current: pagination.current, pageSize: pagination.pageSize });
  }, [pagination.current, pagination.pageSize, fetchCustomers]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCustomer = (record) => {
    setEditingCustomer(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteCustomer = async (id) => {
    setLoading(true);
    try {
      await deleteCustomer(id);
      message.success('删除成功');
      fetchCustomers({ current: pagination.current, pageSize: pagination.pageSize });
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.status = values.status ? 1 : 0;
      values.discount = parseFloat(values.discount);
      if (editingCustomer) {
        const res = await updateCustomer({ ...editingCustomer, ...values });
        if(res.code !== 200) {
            message.error(res.message);
            return;
            }
        message.success('更新成功');
      } else {
        const res = await addCustomer(values);
        if(res.code !== 200) {
            message.error(res.message);
            return;
            }
        message.success('添加成功');
      }
      setIsModalVisible(false);
      fetchCustomers({ current: pagination.current, pageSize: pagination.pageSize });
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
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', hideInSearch: true },
    { title: '联系方式', dataIndex: 'contact_info', key: 'contact_info', hideInSearch: true },
    { title: '银行账号', dataIndex: 'bank_account', key: 'bank_account', hideInSearch: true },
    { title: '信用状态', dataIndex: 'credit_status', key: 'credit_status', hideInSearch: true },
    { title: '折扣', dataIndex: 'discount', key: 'discount', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditCustomer(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteCustomer(record.id)}
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
        dataSource={customers}
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
            onClick={handleAddCustomer}
            type="primary"
          >
            添加客户
          </Button>,
        ]}
      />
      <Modal
        title={editingCustomer ? '编辑客户' : '添加客户'}
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
          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact_info"
            label="联系方式"
            rules={[{ required: true, message: '请输入联系方式' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="bank_account"
            label="银行账号"
            rules={[{ required: true, message: '请输入银行账号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="credit_status"
            label="信用状态"
            rules={[{ required: true, message: '请输入信用状态' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="discount"
            label="折扣"
            rules={[{ required: true, message: '请输入折扣' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
            initialValue={true}
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
