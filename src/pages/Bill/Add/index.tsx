import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Select, Button, message } from 'antd';
import { addBill, updateBill, getBill } from '@/services/bill';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const BillForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const isEdit = !!uuid;

  useEffect(() => {
    if (isEdit) {
      fetchBillDetail(uuid);
    }
  }, [uuid]);

  const fetchBillDetail = async (uuid) => {
    try {
      const response = await getBill({ uuid });
      if (response.code === 200) {
        form.setFieldsValue(response.data);
      } else {
        message.error('获取发票详情失败');
      }
    } catch (error) {
      message.error('获取发票详情失败');
    }
  };

  const handleSubmit = async (values) => {
    values.amount = parseFloat(values.amount);
    values.tax_rate = parseFloat(values.tax_rate);
    values.tax_amount = parseFloat(values.tax_amount);
    values.total_amount = parseFloat(values.total_amount);
    values.finance_audit_status = parseInt(values.finance_audit_status);

    try {
      if (isEdit) {
        await updateBill({ ...values, uuid });
        message.success('更新成功');
      } else {
        await addBill(values);
        message.success('添加成功');
      }
      navigate('/sales/bill');
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {isEdit ? '更新' : '添加'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BillForm;
