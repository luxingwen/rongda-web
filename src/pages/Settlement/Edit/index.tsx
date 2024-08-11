import React, { useState, useEffect } from 'react';
import { Form, Input, Select, message, Button } from 'antd';
import { updateSettlement, getSettlementInfo } from '@/services/settlement';
import { useParams, history } from '@umijs/max';

const SettlementEdit = () => {
  const [form] = Form.useForm();
  const { uuid } = useParams();

  useEffect(() => {
    if (uuid) {
      fetchSettlementInfo(uuid);
    }
  }, [uuid]);

  const fetchSettlementInfo = async (uuid) => {
    const response = await getSettlementInfo({ uuid });
    if (response.code === 200) {
      form.setFieldsValue(response.data);
    } else {
      message.error('获取结算单信息失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const res = await updateSettlement({ uuid: uuid, ...values });
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('更新成功');
      history.push('/sales/settlement');
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <h2>编辑结算单</h2>
      <Form form={form} layout="vertical">
        <Form.Item
          name="order_no"
          label="订单号"
          rules={[{ required: true, message: '请输入订单号' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          hidden
          name="purchase_order_no"
          label="采购订单号"
          rules={[{ required: true, message: '请输入采购订单号' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="pi_agreement_no"
          label="PI合同号"
          rules={[{ required: false, message: '请输入PI合同号' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="cabinet_no"
          label="柜号"
          rules={[{ required: false, message: '请输入柜号' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="destination_port"
          label="目的港口"
          rules={[{ required: false, message: '请输入目的港口' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="eta_date"
          label="ETA时间"
          rules={[{ required: false, message: '请输入ETA时间' }]}
        >
          <Input type='date' />
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: false, message: '请选择状态' }]}
        >
          <Select>
            <Select.Option value="待结算">待结算</Select.Option>
            <Select.Option value="结算中">结算中</Select.Option>
            <Select.Option value="已结算">已结算</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="remarks"
          label="备注"
          rules={[{ required: false, message: '请输入备注' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit}>
            提交
          </Button>
          <Button onClick={() => history.push('/settlement')}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettlementEdit;
