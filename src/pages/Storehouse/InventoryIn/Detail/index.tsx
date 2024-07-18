import { getInbound, getInboundDetail } from '@/services/storehouseInbound';
import ProDescriptions from '@ant-design/pro-descriptions';
import { Card, Divider, message, Spin, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const InboundDetail = () => {
  const { uuid } = useParams();
  const [inboundInfo, setInboundInfo] = useState(null);
  const [inboundDetail, setInboundDetail] = useState([]);
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
      <Tag
        color={
          status === 1
            ? 'blue'
            : status === 2
            ? 'green'
            : status === 3
            ? 'red'
            : status === 4
            ? 'gray'
            : 'gray'
        }
      >
        {str}
      </Tag>
    );
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="入库详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="仓库">
            {inboundInfo?.storehouse?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="标题">
            {inboundInfo?.title}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="入库类型">
            {inboundInfo?.inbound_type}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            {renderStatus(inboundInfo?.status)}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="入库日期">
            {inboundInfo?.inbound_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="入库人">
            {inboundInfo?.inbound_by_user?.nickname}
          </ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="入库明细" bordered={false}>
          <Table
            dataSource={inboundDetail}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Card>
    </Spin>
  );
};

export default InboundDetail;
