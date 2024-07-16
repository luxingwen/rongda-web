import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getBills,
  addBill,
  updateBill,
  deleteBill,
} from '@/services/bill';

const { Option } = Select;

const BillManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();

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
      await deleteBill({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.amount  = parseFloat(values.amount);
      values.tax_rate = parseFloat(values.tax_rate);
      values.tax_amount = parseFloat(values.tax_amount);
      values.total_amount = parseFloat(values.total_amount);
      values.finance_audit_status  = parseInt(values.finance_audit_status);

      if (editingBill) {
        await updateBill({ ...editingBill, ...values });
        message.success('更新成功');
      } else {
        await addBill(values);
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
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '发票公司', dataIndex: 'invoice_company', key: 'invoice_company' },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
    { title: '发票号', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: '发票代码', dataIndex: 'invoice_code', key: 'invoice_code', hideInSearch: true },
    { title: '发票类型', dataIndex: 'invoice_type', key: 'invoice_type', hideInSearch: true },
    { title: '开票日期', dataIndex: 'invoice_date', key: 'invoice_date', hideInSearch: true },
    { title: '金额', dataIndex: 'amount', key: 'amount', hideInSearch: true },
    { title: '税率', dataIndex: 'tax_rate', key: 'tax_rate', hideInSearch: true },
    { title: '税额', dataIndex: 'tax_amount', key: 'tax_amount', hideInSearch: true },
    { title: '价税合计', dataIndex: 'total_amount', key: 'total_amount', hideInSearch: true },
    { title: '付款日期', dataIndex: 'payment_date', key: 'payment_date', hideInSearch: true },
    { title: '付款方式', dataIndex: 'payment_method', key: 'payment_method', hideInSearch: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', hideInSearch: true },
    { title: '财务人员', dataIndex: 'finance_staff', key: 'finance_staff', hideInSearch: true },
    { title: '财务审核日期', dataIndex: 'finance_audit_date', key: 'finance_audit_date', hideInSearch: true },
    { title: '财务审核状态', dataIndex: 'finance_audit_status', key: 'finance_audit_status', render: renderStatus, hideInSearch: true },
    { title: '财务审核备注', dataIndex: 'finance_audit_remark', key: 'finance_audit_remark', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditBill(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteBill(record.uuid)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchBills = async (params) => {
    try {
      const response = await getBills(params);
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
        request={fetchBills}
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
            添加发票
          </Button>,
        ]}
      />
      <Modal title={editingBill ? '编辑发票' : '添加发票'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="invoice_company" label="发票公司" rules={[{ required: true, message: '请输入发票公司' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="applicant" label="申请人" rules={[{ required: true, message: '请输入申请人' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="invoice_no" label="发票号" rules={[{ required: true, message: '请输入发票号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="invoice_code" label="发票代码" rules={[{ required: true, message: '请输入发票代码' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="invoice_type" label="发票类型" rules={[{ required: true, message: '请选择发票类型' }]}>
            <Select placeholder="请选择发票类型">
              <Option value="1">增值税专用发票</Option>
              <Option value="2">增值税普通发票</Option>
            </Select>
          </Form.Item>
          <Form.Item name="invoice_date" label="开票日期" rules={[{ required: true, message: '请输入开票日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="tax_rate" label="税率" rules={[{ required: true, message: '请输入税率' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="tax_amount" label="税额" rules={[{ required: true, message: '请输入税额' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="total_amount" label="价税合计" rules={[{ required: true, message: '请输入价税合计' }]}>
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
          <Form.Item name="finance_staff" label="财务人员">
            <Input />
          </Form.Item>
          <Form.Item name="finance_audit_date" label="财务审核日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="finance_audit_status" label="财务审核状态">
            <Select placeholder="请选择财务审核状态">
              <Option value="1">待审核</Option>
              <Option value="2">已审核</Option>
              <Option value="3">已驳回</Option>
            </Select>
          </Form.Item>
          <Form.Item name="finance_audit_remark" label="财务审核备注">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BillManagement;
