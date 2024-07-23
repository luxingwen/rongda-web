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
    { title: 'SKU', dataIndex: ['sku', 'code'], key: 'sku_uuid', render: (_, record) => record.sku_info?.code },
    { title: '规格', dataIndex: ['sku', 'specification'], key: 'sku_uuid', render: (_, record) => record.sku_info?.specification },
   
    { title: '国家', dataIndex: 'country', key: 'country', render: (_, record) => record.sku_info?.country  },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no', render: (_, record) => record.sku_info?.factory_no },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no' },
    { title: '发票号', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: '合同号', dataIndex: 'contract_no', key: 'contract_no' },
    { title: '单价', dataIndex: 'product_price', key: 'product_price' },
    { title: '数量', dataIndex: 'product_quantity', key: 'product_quantity' },
    { title: '箱数', dataIndex: 'box_num', key: 'box_num' },
    { title: '总价', dataIndex: 'product_amount', key: 'product_amount' },
  
  ];

  const totalQuantity = productList.reduce((acc, item) => acc + item.product_quantity, 0);
  const totalBoxNum = productList.reduce((acc, item) => acc + item.box_num, 0);
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
                <Table.Summary.Cell index={0} colSpan={9}>总计</Table.Summary.Cell>
                <Table.Summary.Cell index={7}>{totalQuantity}</Table.Summary.Cell>
                <Table.Summary.Cell index={8}>{totalBoxNum}</Table.Summary.Cell>
                <Table.Summary.Cell index={9}>{totalAmount}</Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>
      </Card>
    </Spin>
  );
};

export default SalesOrderDetail;
