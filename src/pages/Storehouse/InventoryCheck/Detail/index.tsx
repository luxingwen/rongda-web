import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getInventoryCheck, getInventoryCheckDetail } from '@/services/storehouse_inventory_check';
import { message, Spin, Card, Divider, Table, Tag } from 'antd';

const InventoryCheckDetail = () => {
  const { uuid } = useParams();
  const [inventoryCheckInfo, setInventoryCheckInfo] = useState(null);
  const [inventoryCheckDetail, setInventoryCheckDetail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryCheckInfo(uuid);
    fetchInventoryCheckDetail(uuid);
  }, [uuid]);

  const fetchInventoryCheckInfo = async (uuid) => {
    try {
      const response = await getInventoryCheck({ uuid });
      if (response.code === 200) {
        setInventoryCheckInfo(response.data);
      } else {
        message.error('获取盘点信息失败');
      }
    } catch (error) {
      message.error('获取盘点信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryCheckDetail = async (uuid) => {
    try {
      const response = await getInventoryCheckDetail({ uuid });
      if (response.code === 200) {
        setInventoryCheckDetail(response.data);
      } else {
        message.error('获取盘点详情失败');
      }
    } catch (error) {
      message.error('获取盘点详情失败');
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
    {
      title: '差异',
      dataIndex: 'difference_op',
      key: 'difference_op',
      render: (text) => (
        <Tag color={text === '1' ? 'green' : 'red'}>
          {text === '1' ? '盘盈' : '盘亏'}
        </Tag>
      ),
    },
    {
      title: '差异数量',
      dataIndex: 'difference_quantity',
      key: 'difference_quantity',
      render: (text, record) => (
        <span style={{ color: record.difference_op === '1' ? 'green' : 'red' }}>
          {text}
        </span>
      ),
    }
  ];

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="盘点详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="仓库">{inventoryCheckInfo?.storehouse?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="盘点单号">{inventoryCheckInfo?.check_order_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="盘点日期">{inventoryCheckInfo?.check_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">{inventoryCheckInfo?.status === 1 ? '已盘点' : '未盘点'}</ProDescriptions.Item>
          <ProDescriptions.Item label="盘点人">{inventoryCheckInfo?.check_by_user?.nickname}</ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="盘点明细" bordered={false}>
          <Table
            dataSource={inventoryCheckDetail}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Card>
    </Spin>
  );
};

export default InventoryCheckDetail;
