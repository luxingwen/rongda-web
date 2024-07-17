import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getInbound, getInboundDetail } from '@/services/storehouseInbound';
import { message, Spin, Card, Divider, Row, Col } from 'antd';

const InboundDetail = () => {
  const { uuid } = useParams();
  const [inboundInfo, setInboundInfo] = useState(null);
  const [inboundDetail, setInboundDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInboundInfo(uuid);
    fetchInboundDetail(uuid);
  }, [uuid]);

  const fetchInboundInfo = async (uuid) => {
    try {
      const response = await getInbound({ uuid });
      if (response.code === 200) {
        setInboundInfo(response.data);
      } else {
        message.error('获取入库信息失败');
      }
    } catch (error) {
      message.error('获取入库信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchInboundDetail = async (uuid) => {
    try {
      const response = await getInboundDetail({ uuid });
      if (response.code === 200) {
        setInboundDetail(response.data);
      } else {
        message.error('获取入库详情失败');
      }
    } catch (error) {
      message.error('获取入库详情失败');
    }
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="入库详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="仓库">{inboundInfo?.storehouse?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="标题">{inboundInfo?.title}</ProDescriptions.Item>
          <ProDescriptions.Item label="入库类型">{inboundInfo?.inbound_type}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">{inboundInfo?.status === 1 ? '已入库' : '未入库'}</ProDescriptions.Item>
          <ProDescriptions.Item label="入库日期">{inboundInfo?.inbound_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="入库人">{inboundInfo?.inbound_by_user?.nickname}</ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="入库明细" bordered={false}>
          {inboundDetail?.map((item) => (
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

export default InboundDetail;
