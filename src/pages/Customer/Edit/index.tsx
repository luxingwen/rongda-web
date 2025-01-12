import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, Button, message, Select } from 'antd';
import { history, useParams } from '@umijs/max';
import { getCustomer, updateCustomer } from '@/services/customer';
import { getSysBankInfoOptions } from '@/services/sys/bankinfo';

const CustomerEdit = () => {
  const { uuid } = useParams();
  const [form] = Form.useForm();

  const [bankInfoOptions, setBankInfoOptions] = useState([]);

  useEffect(() => {
    fetchCustomerData();
    fetchBankInfoOptions();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const response = await getCustomer({uuid});
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

  const fetchBankInfoOptions = async () => {
    try {
      const response = await getSysBankInfoOptions();
      if (response.code === 200) {
        setBankInfoOptions(response.data);
      } else {
        message.error('获取银行信息选项失败');
      }
    } catch {
      message.error('获取银行信息选项失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.bank_name = values.bank_name[0];
      values.status = values.status ? 1 : 0;
      values.discount = parseFloat(values.discount);

      const res = await updateCustomer({ uuid, ...values });
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('更新成功');
      history.push('/resource/customer');
    } catch {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <h2>编辑客户</h2>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="contact_person" label="联系人" rules={[{ required: true, message: '请输入联系人' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="contact_info" label="联系方式" rules={[{ required: true, message: '请输入联系方式' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="bank_account" label="银行账号" rules={[{ required: true, message: '请输入银行账号' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="bank_name" label="开户行" rules={[{ required: true, message: '请输入开户行' }]}>
          <Select
            showSearch
            placeholder="请选择开户行"
            optionFilterProp="children"
            mode="tags"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {bankInfoOptions.map((bankInfo) => (
              <Select.Option key={bankInfo.uuid} value={bankInfo.name}>
                {bankInfo.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="credit_status" label="信用状态" rules={[{ required: true, message: '请输入信用状态' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="discount" label="折扣" rules={[{ required: true, message: '请输入折扣' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
        <Button type="primary" onClick={handleSubmit}>
          提交
        </Button>
      </Form>
    </div>
  );
};

export default CustomerEdit;
