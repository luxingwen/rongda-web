// src/pages/PurchaseArrivalDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getPurchaseArrival, getPurchaseArrivalItems } from '@/services/purchase_arrival';
import { message, Spin, Card, Row, Col, Divider } from 'antd';

const PurchaseArrivalDetail = () => {
  const { uuid } = useParams();
  const [arrivalInfo, setArrivalInfo] = useState(null);
  const [arrivalItems, setArrivalItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArrivalDetail(uuid);
    fetchArrivalItems(uuid);
  }, [uuid]);

  const fetchArrivalDetail = async (uuid) => {
    try {
      const response = await getPurchaseArrival({ uuid });
      if (response.code === 200) {
        setArrivalInfo(response.data);
      } else {
        message.error('获取到货详情失败');
      }
    } catch (error) {
      message.error('获取到货详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchArrivalItems = async (uuid) => {
    try {
      const response = await getPurchaseArrivalItems({ uuid });
      if (response.code === 200) {
        setArrivalItems(response.data);
      } else {
        message.error('获取到货详情失败');
      }
    } catch (error) {
      message.error('获取到货详情失败');
    }
  }

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="到货详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="采购单号">{arrivalInfo?.purchase_order_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="批次">{arrivalInfo?.batch}</ProDescriptions.Item>
          <ProDescriptions.Item label="到货日期">{arrivalInfo?.arrival_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="验收人">{arrivalInfo?.acceptor}</ProDescriptions.Item>
          <ProDescriptions.Item label="验收结果">{arrivalInfo?.acceptance_result === 1 ? '合格' : '不合格'}</ProDescriptions.Item>
          <ProDescriptions.Item label="备注" span={2}>{arrivalInfo?.remark}</ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="到货明细" bordered={false}>
          <Row gutter={16}>
            <Col span={6}><strong>产品</strong></Col>
            <Col span={6}><strong>SKU</strong></Col>
            <Col span={4}><strong>数量</strong></Col>
            <Col span={4}><strong>价格</strong></Col>
            <Col span={4}><strong>总金额</strong></Col>
          </Row>
          {arrivalItems?.map((item) => (
            <div key={item.id}>
              <Row gutter={16}>
                <Col span={6}>{item.product_info?.name}</Col>
                <Col span={6}>{item.sku_info?.name}</Col>
                <Col span={4}>{item.quantity}</Col>
                <Col span={4}>{item.price}</Col>
                <Col span={4}>{item.total_amount}</Col>
              </Row>
              <Divider />
            </div>
          ))}
        </Card>
      </Card>
    </Spin>
  );
};

export default PurchaseArrivalDetail;
