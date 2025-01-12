
import { getSettlementCurrencyOptions } from '@/services/settlement_currency';
import { history } from '@umijs/max';
import { Button, Form, Input, message, Select, Switch } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSupplierInfo,updateSupplier } from '@/services/supplier';

const SupplierAdd = () => {
     const { uuid } = useParams();
  const [form] = Form.useForm();
  const [bankInfoOptions, setBankInfoOptions] = React.useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  React.useEffect(() => {
    fetchSupplierInfoData();
    fetchSettlementCurrencyOptions();
  }, []);

  const fetchSettlementCurrencyOptions = async () => {
    try {
      const response = await getSettlementCurrencyOptions();
      if (response.code === 200) {
        setCurrencyOptions(response.data);
      } else {
        message.error('获取结算币种失败');
      }
    } catch (error) {
      message.error('获取结算币种失败');
    }
  };

    const fetchSupplierInfoData = async () => {
      try {
        const response = await getSupplierInfo({uuid});
        if (response.code === 200) {
          const customer = response.data;
          form.setFieldsValue({
            ...customer,
            status: customer.status === 1,
            bank_name: [customer.bank_name],
          });
        } else {
          message.error('获取客户信息失败');
        }
      } catch {
        message.error('获取客户信息失败');
      }
    };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.status = values.status ? 1 : 0;
      values.deposit_rate = parseFloat(values.deposit_rate);

      const res = await updateSupplier({uuid, ...values});
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('更新成功');
      history.push('/resource/supplier');
    } catch {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <h2>编辑供应商</h2>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="address"
          label="地址"
          rules={[{ required: true, message: '请输入地址' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="country_no"
          label="国家"
          rules={[{ required: false, message: '请输入国家' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="factory_no"
          label="厂号"
          rules={[{ required: false, message: '请输入厂号' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="contact_person"
          label="联系人"
          rules={[{ required: false, message: '请输入联系人' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="contact_info"
          label="联系方式"
          rules={[{ required: false, message: '请输入联系方式' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="settlement_currency"
          label="结算币种"
          rules={[{ required: true, message: '请选择结算币种' }]}
        >
          <Select>
            {currencyOptions.map((currency) => (
              <Option key={currency.uuid} value={currency.uuid}>
                {currency.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="deposit_rate"
          label="定金比率"
          rules={[{ required: true, message: '请输入定金比率' }]}
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

        <Button type="primary" onClick={handleSubmit}>
          提交
        </Button>
      </Form>
    </div>
  );
};

export default SupplierAdd;
