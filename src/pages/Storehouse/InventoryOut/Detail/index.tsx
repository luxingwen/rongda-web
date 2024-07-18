import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getOutbound, getOutboundDetail } from '@/services/storehouse_outbound';
import { message, Spin, Card, Divider, Table, Tag } from 'antd';

const OutboundDetail = () => {
  const { uuid } = useParams();
  const [outboundInfo, setOutboundInfo] = useState(null);
  const [outboundDetail, setOutboundDetail] = useState([]);
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

  
  // 状态 1:待处理 2: 已处理 3:已取消 4:已完成

  const renderStatus = (status) => {
    let str = '';

    switch (status) {
      case 1:
        str = '待处理';
        break;
      case 2:
        str = '已处理';
        break;
      case 3:
        str = '已取消';
        break;
      case 4:
        str = '已完成';
        break;
      default:
        str = '未知状态';
    }

    return (
      <Tag color={status === 1 ? 'blue' : status === 2 ? 'green' : status === 3 ? 'red' : status === 4 ? 'gray' : 'gray'}>
        {str}
      </Tag>
    );
  }


  const columns = [
    {
      title: '商品',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => record.product?.name,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text, record) => record.sku?.name,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="出库详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="仓库">{outboundInfo?.storehouse?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="标题">{outboundInfo?.title}</ProDescriptions.Item>
          <ProDescriptions.Item label="出库类型">{outboundInfo?.outbound_type}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">{renderStatus(outboundInfo?.status)}</ProDescriptions.Item>
          <ProDescriptions.Item label="出库日期">{outboundInfo?.outbound_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="出库人">{outboundInfo?.outbound_by_user?.nickname}</ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="出库明细" bordered={false}>
          <Table
            dataSource={outboundDetail}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Card>
    </Spin>
  );
};

export default OutboundDetail;
