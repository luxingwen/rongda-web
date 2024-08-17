import { addRemittanceBill } from '@/services/remittance_bill';
import { getSupplierInfo } from '@/services/supplier';
import { Button, Form, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';

const { Option } = Select;

const RemittanceBillCreateForm = ({ orderInfo, type, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [formStaus, setFormStatus] = useState('待付款');

  console.log('orderInfo:', orderInfo);
  console.log('type:', type);

  useEffect(() => {
    if (orderInfo) {
      // 获取供应商信息

      fetchSupplierInfo(orderInfo.purchase_order_info.supplier_uuid);
    }
  }, []);

  // 获取供应商信息
  const fetchSupplierInfo = async (uuid) => {
    try {
      const response = await getSupplierInfo({ uuid });
      if (response.code === 200) {
        setSupplierInfo(response.data);
        setFormInitialValues(response.data);
      } else {
        message.error('获取供应商信息失败1');
      }
    } catch (error) {
      message.error('获取供应商信息失败' + error);
    }
  };

  const setFormInitialValues = (supplierInfo0) => {
    // 定金
    let firstAmount = orderInfo.deposit_amount;
    // 尾款
    let finalAmount = orderInfo.final_amount;
    if (type === '定金') {
      firstAmount = 0;
      finalAmount = 0;
    } else if (type === '尾款') {
      finalAmount = 0;
    }

    form.setFieldsValue({
      order_no: orderInfo.order_no,
      agreement_amount: orderInfo.order_amount,
      agreement_no: orderInfo.purchase_order_info.pi_agreement_no,
      currency: orderInfo.settlement_currency_info.name,
      first_amount: firstAmount,
      final_amount: finalAmount,
      type: type,
      status: '待付款',
      supplier: supplierInfo0.name,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.agreement_amount = parseFloat(values.agreement_amount) || 0;
      values.first_amount = parseFloat(values.first_amount) || 0;
      values.final_amount = parseFloat(values.final_amount) || 0;
      values.order_no = orderInfo.order_no;
      values.supplier = supplierInfo.uuid;
      values.status = formStaus;
      values.team_uuid = orderInfo.customer_uuid;

      const res = await addRemittanceBill(values);
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('付汇账单添加成功');
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="order_no"
        label="订单号"
        rules={[{ required: true, message: '请输入订单号' }]}
      >
        <Input disabled />
      </Form.Item>
      <Form.Item
        name="supplier"
        label="供应商"
        rules={[{ required: true, message: '请输入供应商' }]}
      >
        <Input disabled />
      </Form.Item>
      <Form.Item
        name="agreement_no"
        label="合同号"
        rules={[{ required: true, message: '请输入合同号' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="type"
        label="类型"
        initialValue={type}
        rules={[{ required: true, message: '请选择类型' }]}
      >
        <Select disabled>
          <Option value="定金">定金</Option>
          <Option value="尾款">尾款</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="currency"
        label="币种"
        rules={[{ required: true, message: '请输入币种' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="agreement_amount"
        label="合同金额"
        rules={[{ required: true, message: '请输入合同金额' }]}
      >
        <Input disabled />
      </Form.Item>
      <Form.Item
        name="first_amount"
        label="头款金额"
        rules={[{ required: type == '定金', message: '请输入头款金额' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="final_amount"
        label="尾款金额"
        rules={[{ required: type == '尾款', message: '请输入尾款金额' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="status"
        label="状态"
        initialValue={'待付款'}
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select
          onChange={(value) => {
            console.log(value);
            setFormStatus(value);
          }}
        >
          <Option value="待付款">待付款</Option>
          <Option value="已付款">已付款</Option>
          <Option value="已取消">已取消</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={handleSubmit}>
          提交
        </Button>
        <Button onClick={onCancel} style={{ marginLeft: 8 }}>
          取消
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RemittanceBillCreateForm;
