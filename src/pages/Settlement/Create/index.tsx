import React, { useState, useEffect } from 'react';
import { Form, Input, Switch, message, Button } from 'antd';
import { addSettlement } from '@/services/settlement';
import { history, useParams } from '@umijs/max';
import { getSalesOrderDetail } from '@/services/sales_order';

const SettlementCreate = () => {
  const [form] = Form.useForm();
  const [salesOrder, setSalesOrder] = useState(null);

  const { orderNo } = useParams();

  useEffect(() => {
    fetchSalesOrderDetail(orderNo);
  }, []);


  const fetchSalesOrderDetail = async (orderNo) => {
    try {
      const response = await getSalesOrderDetail({ uuid: orderNo });
      if (response.code === 200) {
        setSalesOrder(response.data);
        form.setFieldsValue({
          order_no: response.data.order_no,
          purchase_order_no: response.data.purchase_order_no,
          pi_agreement_no: response.data.purchase_order_info.pi_agreement_no,
          cabinet_no: response.data.purchase_order_info.cabinet_no,
          destination_port: response.data.purchase_order_info.destination,
        });
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.team_uuid = salesOrder.customer_uuid;
      const res = await addSettlement(values);
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('添加成功');
      history.push('/sales/settlement');
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <h2>添加结算单</h2>
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
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="pi_agreement_no"
          label="PI合同号"
          rules={[{ required: false, message: '请输入PI合同号' }]}
        >
          <Input disabled />
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

export default SettlementCreate;
