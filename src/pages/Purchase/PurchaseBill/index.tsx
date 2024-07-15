import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import {
  getPurchaseBills,
  addPurchaseBill,
  updatePurchaseBill,
  deletePurchaseBill,

} from '@/services/purchase_bill';
import { getSupplierOptions } from '@/services/supplier';

const { Option } = Select;

const PurchaseBillManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [form] = Form.useForm();
  const actionRef = useRef();

  useEffect(() => {
    fetchSupplierOptions();
  }, []);

  const fetchSupplierOptions = async () => {
    try {
      const response = await getSupplierOptions();
      if (response.code === 200) {
        setSupplierOptions(response.data);
      } else {
        message.error('获取供应商选项失败');
      }
    } catch (error) {
      message.error('获取供应商选项失败');
    }
  };

  const handleAddBill = () => {
    setEditingBill(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditBill = (record) => {
    setEditingBill(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteBill = async (id) => {
    try {
      await deletePurchaseBill({ id });
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
      if (editingBill) {
        await updatePurchaseBill({ ...editingBill, ...values });
        message.success('更新成功');
      } else {
        await addPurchaseBill(values);
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
      {status === 1 ? '待付款' : status === 2 ? '已付款' : '已取消'}
    </Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '采购单号', dataIndex: 'purchase_order_no', key: 'purchase_order_no' },
    { title: '入库单号', dataIndex: 'stock_in_order_no', key: 'stock_in_order_no', hideInSearch: true },
    { title: '供应商', dataIndex: 'supplier_uuid', key: 'supplier_uuid', hideInSearch: true, render:(_, record) => record.supplier?.name },
    { title: '银行账号', dataIndex: 'bank_account', key: 'bank_account', hideInSearch: true },
    { title: '银行名称', dataIndex: 'bank_name', key: 'bank_name', hideInSearch: true },
    { title: '银行账户名', dataIndex: 'bank_account_name', key: 'bank_account_name', hideInSearch: true },
    { title: '金额', dataIndex: 'amount', key: 'amount', hideInSearch: true },
    { title: '付款日期', dataIndex: 'payment_date', key: 'payment_date', hideInSearch: true },
    { title: '付款方式', dataIndex: 'payment_method', key: 'payment_method', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditBill(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteBill(record.id)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchPurchaseBills = async (params) => {
    try {
      const response = await getPurchaseBills(params);
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
    <div>
      <ProTable
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={fetchPurchaseBills}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddBill} type="primary">
            添加采购结算
          </Button>,
        ]}
      />
      <Modal title={editingBill ? '编辑采购结算' : '添加采购结算'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="purchase_order_no" label="采购单号" rules={[{ required: true, message: '请输入采购单号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="stock_in_order_no" label="入库单号" rules={[{ required: true, message: '请输入入库单号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="supplier_uuid" label="供应商" rules={[{ required: true, message: '请选择供应商' }]}>
            <Select placeholder="请选择供应商">
              {supplierOptions.map((supplier) => (
                <Option key={supplier.uuid} value={supplier.uuid}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="bank_account" label="银行账号" rules={[{ required: true, message: '请输入银行账号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bank_name" label="银行名称" rules={[{ required: true, message: '请输入银行名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bank_account_name" label="银行账户名" rules={[{ required: true, message: '请输入银行账户名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="payment_date" label="付款日期" rules={[{ required: true, message: '请输入付款日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="payment_method" label="付款方式" rules={[{ required: true, message: '请选择付款方式' }]}>
            <Select placeholder="请选择付款方式">
              <Option value="1">现金</Option>
              <Option value="2">转账</Option>
              <Option value="3">支票</Option>
              <Option value="4">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseBillManagement;
