import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getSalesOrderDetail, getSalesOrderProductlList } from '@/services/sales_order';
import { message, Spin, Card, Divider, Row, Col, Table } from 'antd';

const SalesOrderDetail = () => {
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
      const response = await getSalesOrderDetail({ uuid });
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
      const response = await getSalesOrderProductlList({ uuid });
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
    { title: '商品', dataIndex: ['product', 'name'], key: 'product_uuid', render: (_, record) => record.product_info?.name },
    { title: 'SKU', dataIndex: ['sku', 'name'], key: 'sku_uuid', render: (_, record) => record.sku_info?.name },
    { title: '数量', dataIndex: 'product_quantity', key: 'product_quantity' },
    { title: '金额', dataIndex: 'product_amount', key: 'product_amount' },
  ];

  const totalQuantity = productList.reduce((acc, item) => acc + item.product_quantity, 0);
  const totalAmount = productList.reduce((acc, item) => acc + item.product_amount, 0);

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="订单详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="订单号">{orderInfo?.order_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="订单类型">{orderInfo?.order_type}</ProDescriptions.Item>
          <ProDescriptions.Item label="订单日期">{orderInfo?.order_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="客户">{orderInfo?.customer_info?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="定金">{orderInfo?.deposit}</ProDescriptions.Item>
          <ProDescriptions.Item label="订单金额">{orderInfo?.order_amount}</ProDescriptions.Item>
          <ProDescriptions.Item label="税费">{orderInfo?.tax_amount}</ProDescriptions.Item>
          <ProDescriptions.Item label="销售人">{orderInfo?.salesman_info?.nickname}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">{orderInfo?.order_status}</ProDescriptions.Item>
          <ProDescriptions.Item label="备注">{orderInfo?.remarks}</ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="商品列表" bordered={false}>
          <Table
            columns={columns}
            dataSource={productList}
            rowKey="id"
            pagination={false}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>总计</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>{totalQuantity}</Table.Summary.Cell>
                <Table.Summary.Cell index={3}>{totalAmount}</Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>
      </Card>
    </Spin>
  );
};

export default SalesOrderDetail;
