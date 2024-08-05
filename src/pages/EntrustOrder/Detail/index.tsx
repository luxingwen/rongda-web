import React, { useState, useEffect } from 'react';
import { Descriptions, message, Tag } from 'antd';
import { getEntrustOrderInfo } from '@/services/entrust_order';
import { PageContainer } from '@ant-design/pro-components';
import { useParams } from  'react-router-dom';

const EntrustOrderDetail = () => {
  const { orderId } = useParams();
  const [orderDetail, setOrderDetail] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await getEntrustOrderInfo({uuid:orderId});
        if (response.code === 200) {
          setOrderDetail(response.data);
        } else {
          message.error('获取订单详情失败');
        }
      } catch (error) {
        message.error('获取订单详情失败');
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const renderStatus = (status) => (
    <Tag color={status ? 'green' : 'red'}>{status ? '完成' : '进行中'}</Tag>
  );

  return (
    <PageContainer>
      {orderDetail && (
        <Descriptions bordered>
          <Descriptions.Item label="订单ID">{orderDetail.order_id}</Descriptions.Item>
          <Descriptions.Item label="用户UUID">{orderDetail.user_uuid}</Descriptions.Item>
          <Descriptions.Item label="团队UUID">{orderDetail.team_uuid}</Descriptions.Item>
          <Descriptions.Item label="内容">{orderDetail.content}</Descriptions.Item>
          <Descriptions.Item label="状态">{renderStatus(orderDetail.status)}</Descriptions.Item>
        </Descriptions>
      )}
    </PageContainer>
  );
};

export default EntrustOrderDetail;
