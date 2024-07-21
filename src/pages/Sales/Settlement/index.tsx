import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Popconfirm,Tag  } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getSalesSettlements,
  addSalesSettlement,
  updateSalesSettlement,
  deleteSalesSettlement,
} from '@/services/sales_settlement';
import { getSalesOrderOptions } from '@/services/sales_order';
import { PageContainer } from '@ant-design/pro-components';

const { Option } = Select;

const SalesSettlementManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState(null);
  const [orderOptions, setOrderOptions] = useState([]);
  const [form] = Form.useForm();
  const actionRef = useRef();

  useEffect(() => {
    fetchOrderOptions();
  }, []);

  const fetchOrderOptions = async () => {
    try {
      const response = await getSalesOrderOptions();
      if (response.code === 200) {
        setOrderOptions(response.data);
      } else {
        message.error('获取订单选项失败');
      }
    } catch (error) {
      message.error('获取订单选项失败');
    }
  };

  const handleAddSettlement = () => {
    setEditingSettlement(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSettlement = (record) => {
    setEditingSettlement(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteSettlement = async (id) => {
    try {
      await deleteSalesSettlement({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
        values.amount = parseFloat(values.amount);
      if (editingSettlement) {
        await updateSalesSettlement({ ...editingSettlement, ...values });
        message.success('更新成功');
      } else {
        await addSalesSettlement(values);
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
    <Tag color={status === 1 ? 'blue' : status === 2 ? 'green' : 'red'}>
      {status === 1 ? '待结算' : status === 2 ? '已结算' : '已取消'}
    </Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '订单UUID', dataIndex: 'order_uuid', key: 'order_uuid' },
    { title: '付款方式', dataIndex: 'payment_method', key: 'payment_method', hideInSearch: true },
    { title: '付款日期', dataIndex: 'payment_date', key: 'payment_date', hideInSearch: true },
    { title: '金额', dataIndex: 'amount', key: 'amount', hideInSearch: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', hideInSearch: true },
    { title: '付款凭证', dataIndex: 'payment_voucher', key: 'payment_voucher', hideInSearch: true },
    { title: '财务审核状态', dataIndex: 'finance_audit_status', key: 'finance_audit_status', render: renderStatus, hideInSearch: true },
    { title: '财务人员', dataIndex: 'finance_staff', key: 'finance_staff', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditSettlement(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteSettlement(record.uuid)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchSalesSettlements = async (params) => {
    try {
      const response = await getSalesSettlements(params);
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
        request={fetchSalesSettlements}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddSettlement} type="primary">
            添加结算
          </Button>,
        ]}
      />
      <Modal title={editingSettlement ? '编辑结算' : '添加结算'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="order_uuid" label="订单UUID" rules={[{ required: true, message: '请选择订单UUID' }]}>
            <Select placeholder="请选择订单UUID">
              {orderOptions.map((order) => (
                <Option key={order.order_no} value={order.order_no}>
                  {order.order_no}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="payment_method" label="付款方式" rules={[{ required: true, message: '请选择付款方式' }]}>
            <Select placeholder="请选择付款方式">
              <Option value="1">现金</Option>
              <Option value="2">转账</Option>
              <Option value="3">支票</Option>
              <Option value="4">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="payment_date" label="付款日期" rules={[{ required: true, message: '请输入付款日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="payment_voucher" label="付款凭证">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SalesSettlementManagement;
