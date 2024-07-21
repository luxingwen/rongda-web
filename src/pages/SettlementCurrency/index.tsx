import React, { useState, useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSettlementCurrencies, addSettlementCurrency, updateSettlementCurrency, deleteSettlementCurrency } from '@/services/settlement_currency';
import { PageContainer } from '@ant-design/pro-components';

const SettlementCurrencyManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();

  const handleAddCurrency = () => {
    setEditingCurrency(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCurrency = (record) => {
    setEditingCurrency(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteCurrency = async (id) => {
    try {
      await deleteSettlementCurrency({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.status = values.status ? 1 : 0;
      values.exchange_rate = parseFloat(values.exchange_rate);
      if (editingCurrency) {
        await updateSettlementCurrency({ ...editingCurrency, ...values });
        message.success('更新成功');
      } else {
        await addSettlementCurrency(values);
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
    <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '未启用'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '代码', dataIndex: 'code', key: 'code', hideInSearch: true },
    { title: '汇率', dataIndex: 'exchange_rate', key: 'exchange_rate', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', hideInSearch: true, render: (status) => renderStatus(status) },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditCurrency(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteCurrency(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchCurrencies = async (params) => {
    try {
      const response = await getSettlementCurrencies(params);
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
        rowKey="id"
        actionRef={actionRef}
        request={fetchCurrencies}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={handleAddCurrency}
            type="primary"
          >
            添加结算币种
          </Button>,
        ]}
      />
      <Modal
        title={editingCurrency ? '编辑结算币种' : '添加结算币种'}
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
          <Form.Item
            name="code"
            label="代码"
            rules={[{ required: true, message: '请输入代码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="exchange_rate"
            label="汇率"
            rules={[{ required: true, message: '请输入汇率' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SettlementCurrencyManagement;
