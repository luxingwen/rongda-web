import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getCustomer } from '@/services/customer';
import { message, Spin, Card, Divider, Tag } from 'antd';

const CustomerDetail = () => {
  const { uuid } = useParams();
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerInfo(uuid);
  }, [uuid]);

  const fetchCustomerInfo = async (uuid) => {
    try {
      const response = await getCustomer({ uuid });
      if (response.code === 200) {
        setCustomerInfo(response.data);
      } else {
        message.error('获取客户信息失败');
      }
    } catch (error) {
      message.error('获取客户信息失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="客户详情">
        <ProDescriptions column={1}>
          <ProDescriptions.Item label="UUID">{customerInfo?.uuid}</ProDescriptions.Item>
          <ProDescriptions.Item label="名称">{customerInfo?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="地址">{customerInfo?.address}</ProDescriptions.Item>
          <ProDescriptions.Item label="联系方式">{customerInfo?.contact_info}</ProDescriptions.Item>
          <ProDescriptions.Item label="开户行">{customerInfo?.bank_name}</ProDescriptions.Item>
          <ProDescriptions.Item label="银行账号">{customerInfo?.bank_account}</ProDescriptions.Item>
          <ProDescriptions.Item label="信用状态">{customerInfo?.credit_status}</ProDescriptions.Item>
          <ProDescriptions.Item label="折扣">{customerInfo?.discount}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            <Tag color={customerInfo?.status ? 'green' : 'red'}>
              {customerInfo?.status ? '启用' : '禁用'}
            </Tag>
          </ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        {/* Add any other sections if needed */}
      </Card>
    </Spin>
  );
};

export default CustomerDetail;
