import { addLogistics } from '@/services/logistics'; // Replace with your actual service methods
import { getStorehouseOutOrderDetailInfo } from '@/services/storehouse_outbound/order';
import { UploadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

const LogisticsFormPage = () => {
  const { uuid } = useParams(); // Get UUID from URL
  const [form] = Form.useForm();

  const [storehouseOutOrderDetailInfo, setStorehouseOutOrderDetailInfo] =
    useState(null);

  useEffect(() => {
    if (uuid) {
      fetchStorehouseOutOrderDetailInfo(uuid);
    }
  }, [uuid, form]);

  const fetchStorehouseOutOrderDetailInfo = async (uuid) => {
    try {
      const response = await getStorehouseOutOrderDetailInfo({ uuid: uuid });
      if (response.code === 200) {
        setStorehouseOutOrderDetailInfo(response.data);
      } else {
        message.error('获取出库单详情失败');
      }
    } catch (error) {
      message.error('获取出库单详情失败');
    }
  };

  const handleFinish = async (values) => {
    try {
      await addLogistics(values); // Create new logistics information
      message.success('创建成功');

      history.push('/logistics'); // Redirect to logistics list or desired page after success
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <PageContainer>
      <div style={{ padding: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
         
          <Form.Item
            name="shipper"
            label="承运商"
            rules={[{ required: true, message: '请输入承运商' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="shipper_phone"
            label="承运商电话"
            rules={[{ required: true, message: '请输入承运商电话' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="shipper_no"
            label="承运单号"
            rules={[{ required: true, message: '请输入承运单号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="transport_mode"
            label="运输方式"
            rules={[{ required: false, message: '请选择运输方式' }]}
          >
            <Select>
              <Select.Option value="1">陆运</Select.Option>
              <Select.Option value="2">空运</Select.Option>
              <Select.Option value="3">海运</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="transport_status"
            label="运输状态"
            rules={[{ required: false, message: '请选择运输状态' }]}
          >
            <Select>
              <Select.Option value="1">未发货</Select.Option>
              <Select.Option value="2">已发货</Select.Option>
              <Select.Option value="3">已到货</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="vehicle_no"
            label="车牌号"
            rules={[{ required: false, message: '请输入车牌号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="driver"
            label="司机"
            rules={[{ required: false, message: '请输入司机' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="driver_phone"
            label="司机电话"
            rules={[{ required: false, message: '请输入司机电话' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="receiver"
            label="收货人"
            rules={[{ required: false, message: '请输入收货人' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="receiver_phone"
            label="收货人电话"
            rules={[{ required: false, message: '请输入收货人电话' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="receiver_address"
            label="收货地址"
            rules={[{ required: false, message: '请输入收货地址' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ship_date"
            label="发货日期"
            rules={[{ required: false, message: '请选择发货日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="arrival_date"
            label="到货日期"
            rules={[{ required: false, message: '请选择到货日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="freight"
            label="运费"
            rules={[{ required: false, message: '请输入运费' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="freight_payer"
            label="运费支付方"
            rules={[{ required: false, message: '请选择运费支付方' }]}
          >
            <Select>
              <Select.Option value="1">发货方</Select.Option>
              <Select.Option value="2">收货方</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="freight_status"
            label="运费支付状态"
            rules={[{ required: false, message: '请选择运费支付状态' }]}
          >
            <Select>
              <Select.Option value="1">未支付</Select.Option>
              <Select.Option value="2">已支付</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="attachment" label="附件">
            <Upload>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" >
              提交
            </Button>
          </Form.Item>
        </Form>
      </div>
    </PageContainer>
  );
};

export default LogisticsFormPage;
