import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, message, Tag, Popconfirm, Select, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getEntrustOrders, addEntrustOrder, updateEntrustOrder, deleteEntrustOrder } from '@/services/entrust_order';
import { PageContainer } from '@ant-design/pro-components';

const EntrustOrderManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();

  const handleAddOrder = () => {
    setEditingOrder(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditOrder = (record) => {
    setEditingOrder(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteOrder = async (id) => {
    try {
      await deleteEntrustOrder({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingOrder) {
        await updateEntrustOrder({ ...editingOrder, ...values });
        message.success('更新成功');
      } else {
        await addEntrustOrder(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderStatus = (status) => (
    <Tag color={status ? 'green' : 'red'}>{status ? '完成' : '进行中'}</Tag>
  );

  const renderContent = (content) => (
    <Tooltip title={content}>
      <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {content}
      </div>
    </Tooltip>
  );

  const columns = [
    { title: '订单ID', dataIndex: 'order_id', key: 'order_id' },
    { title: '用户UUID', dataIndex: 'user_uuid', key: 'user_uuid' },
    { title: '团队UUID', dataIndex: 'team_uuid', key: 'team_uuid' },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: renderContent,
    },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditOrder(record)} style={{ marginRight: 8 }} />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteOrder(record.order_id)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchOrders = async (params) => {
    try {
      const response = await getEntrustOrders(params);
      if (response.code !== 200) {
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
      return {
        data: response.data.data,
        success: true,
        total: response.data.total,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  return (
    <PageContainer>
      <ProTable
        columns={columns}
        rowKey="uuid"
        actionRef={actionRef}
        request={fetchOrders}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddOrder} type="primary">
            添加订单
          </Button>,
        ]}
      />
      <Modal
        title={editingOrder ? '编辑订单' : '添加订单'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="order_id" label="订单ID" rules={[{ required: true, message: '请输入订单ID' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="user_uuid" label="用户UUID" rules={[{ required: true, message: '请输入用户UUID' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="team_uuid" label="团队UUID" rules={[{ required: true, message: '请输入团队UUID' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select>
              <Select.Option value="完成">完成</Select.Option>
              <Select.Option value="进行中">进行中</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default EntrustOrderManagement;
