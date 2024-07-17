import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getOutbound, getOutboundDetail } from '@/services/storehouse_outbound';
import { message, Spin, Card, Divider, Row, Col } from 'antd';

const OutboundDetail = () => {
  const { uuid } = useParams();
  const [outboundInfo, setOutboundInfo] = useState(null);
  const [outboundDetail, setOutboundDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutboundInfo(uuid);
    fetchOutboundDetail(uuid);
  }, [uuid]);

  const fetchOutboundInfo = async (uuid) => {
    try {
      const response = await getOutbound({ uuid });
      if (response.code === 200) {
        setOutboundInfo(response.data);
      } else {
        message.error('获取出库信息失败');
      }
    } catch (error) {
      message.error('获取出库信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutboundDetail = async (uuid) => {
    try {
      const response = await getOutboundDetail({ uuid });
      if (response.code === 200) {
        setOutboundDetail(response.data);
      } else {
        message.error('获取出库详情失败');
      }
    } catch (error) {
      message.error('获取出库详情失败');
    }
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="出库详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="仓库">{outboundInfo?.storehouse?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="标题">{outboundInfo?.title}</ProDescriptions.Item>
          <ProDescriptions.Item label="出库类型">{outboundInfo?.outbound_type}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">{outboundInfo?.status === 1 ? '已出库' : '未出库'}</ProDescriptions.Item>
          <ProDescriptions.Item label="出库日期">{outboundInfo?.outbound_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="出库人">{outboundInfo?.outbound_by_user?.nickname}</ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="出库明细" bordered={false}>
          {outboundDetail?.map((item) => (
            <div key={item.id}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <strong>商品:</strong> {item.product?.name}
                </Col>
                <Col span={8}>
                  <strong>SKU:</strong> {item.sku?.name}
                </Col>
                <Col span={8}>
                  <strong>数量:</strong> {item.quantity}
                </Col>
              </Row>
              <Divider />
            </div>
          ))}
        </Card>
      </Card>
    </Spin>
  );
};

export default OutboundDetail;
