import {
  getSalesOrderDetail,
  getSalesOrderProductList,
} from '@/services/sales_order';
import { RouteContext } from '@ant-design/pro-components';
import ProDescriptions from '@ant-design/pro-descriptions';
import { Card, Divider, message, Spin, Steps, Table } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './SalesOrderDetail.css';

const { Step } = Steps;

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
      const response = await getSalesOrderProductList({ uuid });
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
      dataIndex: ['product', 'name'],
      key: 'product_uuid',
      render: (_, record) => record.product?.name,
    },
    {
      title: 'SKU',
      dataIndex: ['sku', 'code'],
      key: 'sku_uuid',
      render: (_, record) => record.sku?.code,
    },
    {
      title: '规格',
      dataIndex: ['sku', 'specification'],
      key: 'sku_uuid',
      render: (_, record) => record.sku?.specification,
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      render: (_, record) => record.sku?.country,
    },
    {
      title: '厂号',
      dataIndex: 'factory_no',
      key: 'factory_no',
      render: (_, record) => record.sku?.factory_no,
    },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no' },
    { title: '发票号', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: '合同号', dataIndex: 'contract_no', key: 'contract_no' },
    { title: '单价', dataIndex: 'product_price', key: 'product_price' },
    { title: '数量', dataIndex: 'product_quantity', key: 'product_quantity' },
    { title: '箱数', dataIndex: 'box_num', key: 'box_num' },
    { title: '总价', dataIndex: 'product_amount', key: 'product_amount' },
  ];

  const totalQuantity = productList.reduce(
    (acc, item) => acc + item.product_quantity,
    0,
  );
  const totalBoxNum = productList.reduce((acc, item) => acc + item.box_num, 0);
  const totalAmount = productList.reduce(
    (acc, item) => acc + item.product_amount,
    0,
  );

  const steps = [
    { title: "创建订单" },
    { title: "订单确认", description: "客户确认订单" },
    { title: "创建合同", description: "创建订单合同" },
    { title: "签署合同" },
    { title: "创建定金合同" },
    { title: "签署定金合同" },
    { title: "支付定金" },
    { title: "更新单据信息" },
    { title: "船期更新" },
    { title: "创建尾款合同" },
    { title: "签署尾款合同" },
    { title: "支付尾款" },
    { title: "等待货物到港清关" },
    { title: "货物流向" },
    { title: "货物海关放行" },
    { title: "入库或倒柜直提" },
    { title: "预约提货" },
    { title: "账单结算" },
    { title: "账单确认" },
    { title: "货款支付" },
    { title: "货物放行" },
    { title: "完成" },
  ];

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="订单详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="订单号">
            {orderInfo?.order_no}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="订单类型">
            {orderInfo?.order_type}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="订单日期">
            {orderInfo?.order_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="客户">
            {orderInfo?.customer_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="定金">
            {orderInfo?.deposit}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="订单金额">
            {orderInfo?.order_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="税费">
            {orderInfo?.tax_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="销售人">
            {orderInfo?.salesman_info?.nickname}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            {orderInfo?.order_status}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="备注">
            {orderInfo?.remarks}
          </ProDescriptions.Item>
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
                <Table.Summary.Cell index={0} colSpan={9}>
                  总计
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  {totalQuantity}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8}>{totalBoxNum}</Table.Summary.Cell>
                <Table.Summary.Cell index={9}>{totalAmount}</Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>

        <Card
          title="流程进度"
          style={{
            marginBottom: 24,
          }}
        >
          <RouteContext.Consumer>
            {() => (
              <div className="steps-container">
                <Steps current={1} className="steps-content">
                  {steps.map((step, index) => (
                    <Step
                      key={index}
                      title={step.title}
                      description={step.description}
                    />
                  ))}
                </Steps>
              </div>
            )}
          </RouteContext.Consumer>
        </Card>
      </Card>
    </Spin>
  );
};

export default SalesOrderDetail;
