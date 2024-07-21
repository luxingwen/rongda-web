import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSupplierInfo } from '@/services/supplier';
import { message, Spin, Card, Divider, Tag, Row, Col } from 'antd';

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

  const renderInfoItem = (label, value) => (
    <Row style={{ marginBottom: '16px' }}>
      <Col span={2} style={{ fontWeight: 'bold' }}>
        {label}:
      </Col>
      <Col span={22}>{value}</Col>
    </Row>
  );

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="供应商详情" style={{ margin: '20px', padding: '20px' }}>
        {supplierInfo ? (
          <>
            {renderInfoItem('UUID', supplierInfo?.uuid)}
            {renderInfoItem('名称', supplierInfo?.name)}
            {renderInfoItem('地址', supplierInfo?.address)}
            {renderInfoItem('国家厂号', supplierInfo?.country_no)}
            {renderInfoItem('联系方式', supplierInfo?.contact_info)}
            {renderInfoItem('结算币种', supplierInfo?.settlement_currency_info?.name)}
            {renderInfoItem('定金比率', supplierInfo?.deposit_rate)}
            {renderInfoItem('状态', renderStatus(supplierInfo?.status))}
            <Divider />
          </>
        ) : (
          <Row justify="center">
            <Col>
              <p>没有找到供应商信息</p>
            </Col>
          </Row>
        )}
      </Card>
    </Spin>
  );
};

export default SupplierDetail;
