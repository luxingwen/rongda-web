// src/pages/PurchaseBillForm.jsx
import React, { useEffect, useState } from 'react';
import {  useParams } from 'react-router-dom';
import { Form, Input, Select, Button, message } from 'antd';
import { getSupplierOptions } from '@/services/supplier';
import { addPurchaseBill, updatePurchaseBill, getPurchaseBill } from '@/services/purchase_bill';
import { history } from '@umijs/max';

const { Option } = Select;

const PurchaseBillForm = () => {
  const [form] = Form.useForm();

  const { id } = useParams();
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSupplierOptions();
    if (id) {
      fetchBillDetail(id);
    }
  }, [id]);

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

  const fetchBillDetail = async (id) => {
    setLoading(true);
    try {
      const response = await getPurchaseBill({ id });
      if (response.code === 200) {
        form.setFieldsValue(response.data);
      } else {
        message.error('获取结算详情失败');
      }
    } catch (error) {
      message.error('获取结算详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      values.amount = parseFloat(values.amount);
      if (id) {
        await updatePurchaseBill({ ...values, id });
        message.success('更新成功');
      } else {
        await addPurchaseBill(values);
        message.success('添加成功');
      }
      history.push('/purchase/settlement');
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{id ? '编辑采购结算' : '添加采购结算'}</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {id ? '更新' : '添加'}
          </Button>
          <Button onClick={() => history.push('/purchase/settlement')} style={{ marginLeft: '8px' }}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PurchaseBillForm;
