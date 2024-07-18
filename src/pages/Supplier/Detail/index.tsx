import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getSupplierInfo } from '@/services/supplier';
import { message, Spin, Card, Divider, Tag } from 'antd';

const SupplierDetail = () => {
  const { uuid } = useParams();
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplierInfo(uuid);
  }, [uuid]);

  const fetchSupplierInfo = async (uuid) => {
    try {
      const response = await getSupplierInfo({ uuid });
      if (response.code === 200) {
        setSupplierInfo(response.data);
      } else {
        message.error('获取供应商信息失败');
      }
    } catch (error) {
      message.error('获取供应商信息失败');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status) => (
    <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '未启用'}</Tag>
  );

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="供应商详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="UUID">{supplierInfo?.uuid}</ProDescriptions.Item>
          <ProDescriptions.Item label="名称">{supplierInfo?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="地址">{supplierInfo?.address}</ProDescriptions.Item>
          <ProDescriptions.Item label="国家厂号">{supplierInfo?.country_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="联系方式">{supplierInfo?.contact_info}</ProDescriptions.Item>
          <ProDescriptions.Item label="结算币种">{supplierInfo?.settlement_currency_info?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="定金比率">{supplierInfo?.deposit_rate}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">{renderStatus(supplierInfo?.status)}</ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
      </Card>
    </Spin>
  );
};

export default SupplierDetail;
