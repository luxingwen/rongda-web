// src/pages/PurchaseOrderDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getPurchaseOrdersInfo, getPurchaseOrderProductList } from '@/services/purchase_order';
import { message, Spin, Card, Table } from 'antd';

const PurchaseOrderDetail = () => {
  const { uuid } = useParams();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    fetchOrderDetail(uuid);
    fetchProductList(uuid);
  }, [uuid]);

  const fetchOrderDetail = async (uuid) => {
    try {
      const response = await getPurchaseOrdersInfo({ uuid });
      if (response.code === 200) {
        setOrderInfo(response.data);
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductList = async (uuid) => {
    try {
      const response = await getPurchaseOrderProductList({ uuid });
      if (response.code === 200) {
        setProductList(response.data);
      } else {
        message.error('获取商品列表失败');
      }
    } catch (error) {
      message.error('获取商品列表失败');
    }
  };

  const columns = [
    {
      title: '商品',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => record.product.name,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text, record) => record.sku.name,
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

  const totalQuantity = productList.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = productList.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="采购订单详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="采购单号">{orderInfo?.order_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="标题">{orderInfo?.title}</ProDescriptions.Item>
          <ProDescriptions.Item label="供应商">{orderInfo?.supplier?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="采购日期">{orderInfo?.date}</ProDescriptions.Item>
          <ProDescriptions.Item label="定金">{orderInfo?.deposit}</ProDescriptions.Item>
          <ProDescriptions.Item label="税费">{orderInfo?.tax}</ProDescriptions.Item>
          <ProDescriptions.Item label="总金额">{orderInfo?.total_amount}</ProDescriptions.Item>
          <ProDescriptions.Item label="采购人">{orderInfo?.purchaser}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">{orderInfo?.status}</ProDescriptions.Item>
          <ProDescriptions.Item label="备注">{orderInfo?.remarks}</ProDescriptions.Item>
        </ProDescriptions>
        <Card title="采购单明细" bordered={false}>
          <Table
            columns={columns}
            dataSource={productList}
            pagination={false}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2}>总计</Table.Summary.Cell>
                <Table.Summary.Cell>{totalQuantity}</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell>{totalAmount}</Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            rowKey="id"
          />
        </Card>
      </Card>
    </Spin>
  );
};

export default PurchaseOrderDetail;
