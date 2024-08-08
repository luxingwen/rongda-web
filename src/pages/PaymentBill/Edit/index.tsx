import React, { useState, useEffect } from 'react';
import { Form, Input, Switch, message, Select, Button } from 'antd';
import { updatePaymentBill, getPaymentBillInfo } from '@/services/payment_bill';
import { getSysBankInfoOptions } from '@/services/sys/bankinfo';
import { useParams, history } from '@umijs/max';

const PaymentBillEdit = () => {
  const [form] = Form.useForm();
  const [bankInfoOptions, setBankInfoOptions] = useState([]);
  const { uuid } = useParams();

  useEffect(() => {
    fetchBankInfoOptions();
    if (uuid) {
      fetchPaymentBillInfo(uuid);
    }
  }, [uuid]);

  const fetchBankInfoOptions = async () => {
    try {
      const response = await getSysBankInfoOptions();
      if (response.code === 200) {
        setBankInfoOptions(response.data);
      } else {
        message.error('获取银行信息选项失败');
      }
    } catch (error) {
      message.error('获取银行信息选项失败');
    }
  };

  const fetchPaymentBillInfo = async (uuid) => {
    const response = await getPaymentBillInfo({ uuid });
    if (response.code === 200) {
      form.setFieldsValue(response.data);
    } else {
      message.error('获取支付账单信息失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.original_amount = parseFloat(values.original_amount) || 0;
      values.amount = parseFloat(values.amount) || 0;
      values.payment_amount = parseFloat(values.payment_amount) || 0;
      values.unpaid_amount = parseFloat(values.unpaid_amount) || 0;
      values.advance_amount = parseFloat(values.advance_amount) || 0;
      const res = await updatePaymentBill({ uuid: uuid, ...values });
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('更新成功');
      history.push('/payment_bill');
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <h2>编辑支付账单</h2>
      <Form form={form} layout="vertical">
        <Form.Item
          name="order_no"
          label="订单号"
          rules={[{ required: true, message: '请输入订单号' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="type"
          label="订单类型"
          rules={[{ required: true, message: '请输入订单类型' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="agreement_no"
          label="合同号"
          rules={[{ required: false, message: '请输入合同号' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="pi_agreement_no"
          label="PI合同号"
          rules={[{ required: true, message: '请输入PI合同号' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="cabinet_no"
          label="柜号"
          rules={[{ required: false, message: '请输入柜号' }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="original_amount"
          label="原币金额"
          rules={[{ required: false, message: '请输入原币金额' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="original_currency"
          label="原币币种"
          rules={[{ required: false, message: '请输入原币币种' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="exchange_rate"
          label="汇率"
          rules={[{ required: true, message: '请输入汇率' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="amount"
          label="应付金额"
          rules={[{ required: true, message: '请输入应付金额' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="payment_amount"
          label="实际付款金额"
          rules={[{ required: false, message: '请输入实际付款金额' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="unpaid_amount"
          label="未付金额"
          rules={[{ required: false, message: '请输入未付金额' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="advance_amount"
          label="可垫资额度"
          rules={[{ required: false, message: '请输入可垫资额度' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="is_advance"
          label="是否垫资"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="lock_exchange_rate"
          label="锁汇汇率"
          rules={[{ required: false, message: '请输入锁汇汇率' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="lock_exchange_start_date"
          label="锁汇开始日期"
          rules={[{ required: false, message: '请输入锁汇开始日期' }]}
        >
          <Input type='date' />
        </Form.Item>
        <Form.Item
          name="lock_exchange_end_date"
          label="锁汇结束日期"
          rules={[{ required: false, message: '请输入锁汇结束日期' }]}
        >
          <Input type='date' />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit}>
            提交
          </Button>
          <Button onClick={() => history.push('/payment_bill')}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PaymentBillEdit;
