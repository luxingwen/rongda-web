import React from 'react';
import { Form, Input, Switch, Button, message, Select } from 'antd';
import { history } from '@umijs/max';
import { getAgents, addAgent, updateAgent, deleteAgent } from '@/services/agent';
import { getSysBankInfoOptions } from '@/services/sys/bankinfo';

const CustomerAdd = () => {
  const [form] = Form.useForm();
  const [bankInfoOptions, setBankInfoOptions] = React.useState([]);

  React.useEffect(() => {
    fetchBankInfoOptions();
  }, []);

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
      values.rate = parseFloat(values.rate);

      const res = await addAgent(values);
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('添加成功');
      history.push('/resource/agent');
    } catch {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <h2>添加代理</h2>
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
                 name="contact_person"
                 label="联系人"
                 rules={[{ required: true, message: '请输入联系人' }]}
               >
                 <Input />
               </Form.Item>
               <Form.Item
                 name="contact_info"
                 label="联系方式"
                 rules={[{ required: true, message: '请输入联系方式' }]}
               >
                 <Input />
               </Form.Item>
               <Form.Item
                 name="bank_account"
                 label="银行账号"
                 rules={[{ required: true, message: '请输入银行账号' }]}
               >
                 <Input />
               </Form.Item>
               <Form.Item
                 name="bank_name"
                 label="开户行"
                 rules={[{ required: true, message: '请输入开户行' }]}
               >
                <Select
                 showSearch
                 placeholder="请选择开户行"
                 optionFilterProp="children"
                 maxCount={1}
                 mode='tags'
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
               <Form.Item
                 name="credit_status"
                 label="信用状态"
                 rules={[{ required: true, message: '请输入信用状态' }]}
               >
                 <Input />
               </Form.Item>
               <Form.Item
                 name="rate"
                 label="费率"
                 rules={[{ required: true, message: '请输入费率' }]}
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

export default CustomerAdd;
