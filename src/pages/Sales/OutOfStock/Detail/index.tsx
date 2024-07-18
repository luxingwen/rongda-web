// src/pages/SalesOutOfStockDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getSalesOutOfStock,getSalesOutOfStockItems } from '@/services/sales_out_of_stock';
import { message, Spin, Card, Divider, Table } from 'antd';

const SalesOutOfStockDetail = () => {
  const { uuid } = useParams();
  const [outOfStockInfo, setOutOfStockInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutOfStockDetail(uuid);
    fetchOutOfStockItems(uuid);
  }, [uuid]);

  const fetchOutOfStockDetail = async (uuid) => {
    setLoading(true);
    try {
      const response = await getSalesOutOfStock({ uuid });
      if (response.code === 200) {
        setOutOfStockInfo(response.data);
      } else {
        message.error('获取出库详情失败');
      }
    } catch (error) {
      message.error('获取出库详情失败');
    } finally {
      setLoading(false);
    }
  };


  const fetchOutOfStockItems = async (uuid) => {
    setLoading(true);
    try {
      const response = await getSalesOutOfStockItems({ uuid });
      if (response.code === 200) {
        setProducts(response.data);
      } else {
        message.error('获取出库详情失败');
      }
    } catch (error) {
      message.error('获取出库详情失败');
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    {
      title: '商品',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => record.product_info?.name,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text, record) => record.sku_info?.name,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="出库详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="出库日期">{outOfStockInfo?.out_of_stock_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="销售单号">{outOfStockInfo?.sales_order_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="客户">{outOfStockInfo?.customer?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="批次号">{outOfStockInfo?.batch_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="登记人">{outOfStockInfo?.registrant_info?.nickname}</ProDescriptions.Item>
          <ProDescriptions.Item label="仓库">{outOfStockInfo?.storehouse_info?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="备注" span={2}>
            {outOfStockInfo?.remark}
          </ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="出库明细" bordered={false}>
          <Table columns={columns} dataSource={products} pagination={false} rowKey="id" summary={(pageData) => {
            let totalQuantity = 0;
            let totalAmount = 0;

            pageData.forEach(({ quantity, total_amount }) => {
              totalQuantity += quantity;
              totalAmount += total_amount;
            });

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell>总计</Table.Summary.Cell>
                  <Table.Summary.Cell />
                  <Table.Summary.Cell>{totalQuantity}</Table.Summary.Cell>
                  <Table.Summary.Cell />
                  <Table.Summary.Cell>{totalAmount}</Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }} />
        </Card>
      </Card>
    </Spin>
  );
};

export default SalesOutOfStockDetail;
