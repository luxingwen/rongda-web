// src/pages/PurchaseOrderDetail.jsx
import {
  getPurchaseOrderProductList,
  getPurchaseOrdersInfo,
} from '@/services/purchase_order';
import type { ProColumns } from '@ant-design/pro-components';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ProTable } from '@ant-design/pro-table';
import { Card, Divider, List, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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
        response.data.attachments = [];
        if (response.data.attachment !== '') {
          response.data.attachments = JSON.parse(response.data.attachment);
          response.data.attachments = response.data.attachments.map(
            (file, index) => ({
              uid: index,
              name: file.name,
              status: 'done',
              url: '/public/' + file.url,
            }),
          );
        }

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

  const columns: ProColumns[] = [
    {
      title: '产品名称',
      dataIndex: 'product_uuid',
      render: (text, record) => record.product?.name,
    },
    {
      title: '规格',
      dataIndex: 'spec',
      render: (text, record) => record.sku?.specification,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      render: (text, record) => record.sku?.code,
    },
    {
      title: '国家',
      dataIndex: 'sku_country',
      render: (text, record) => record.sku?.country,
    },
    {
      title: '厂号',
      dataIndex: 'sku_factory_no',
      render: (text, record) => record.sku?.factory_no,
    },
    {
      title: '产品数量',
      dataIndex: 'quantity',
    },
    {
      title: '产品价格',
      dataIndex: 'price',
    },
    {
      title: '产品总金额',
      dataIndex: 'total_amount',
    },
    {
      title: 'PI箱数',
      dataIndex: 'pi_box_num',
    },
    {
      title: 'PI数量',
      dataIndex: 'pi_quantity',
    },
    {
      title: 'PI单价',
      dataIndex: 'pi_unit_price',
    },
    {
      title: 'PI总金额',
      dataIndex: 'pi_total_amount',
    },
    {
      title: '柜号',
      dataIndex: 'cabinet_no',
    },
    {
      title: '提单号',
      dataIndex: 'bill_of_lading_no',
    },
    {
      title: '船名',
      dataIndex: 'ship_name',
    },
    {
      title: '航次',
      dataIndex: 'voyage',
    },
    {
      title: 'CI发票号',
      dataIndex: 'ci_invoice_no',
    },
    {
      title: 'CI箱数',
      dataIndex: 'ci_box_num',
    },
    {
      title: 'CI数量',
      dataIndex: 'ci_quantity',
    },
    {
      title: 'CI单价',
      dataIndex: 'ci_unit_price',
    },
    {
      title: 'CI总金额',
      dataIndex: 'ci_total_amount',
    },
    {
      title: 'CI尾款金额',
      dataIndex: 'ci_residual_amount',
      key: 'ci_residual_amount',
    },
    {
      title: '生产日期',
      dataIndex: 'production_date',
    },
    {
      title: '预计到港日期',
      dataIndex: 'estimated_arrival_date',
    },
    {
      title: 'RMB定金金额',
      dataIndex: 'rmb_deposit_amount',
      key: 'rmb_deposit_amount',
    },
    {
      title: 'RMB尾款金额',
      dataIndex: 'rmb_residual_amount',
      key: 'rmb_residual_amount',
    },
    {
      title: '定金汇率',
      dataIndex: 'deposit_exchange_rate',
      key: 'deposit_exchange_rate',
    },
    {
      title: '尾款汇率',
      dataIndex: 'residual_exchange_rate',
      key: 'residual_exchange_rate',
    },
    {
      title: '关税',
      dataIndex: 'tariff',
    },
    {
      title: '增值税',
      dataIndex: 'vat',
    },
    {
      title: '缴费日期',
      dataIndex: 'payment_date',
    },
  ];

  // const totalQuantity = productList.reduce((sum, item) => sum + item.quantity, 0);
  // const totalAmount = productList.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="采购订单详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="采购单号">
            {orderInfo?.order_no}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="标题">
            {orderInfo?.title}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="客户">
            {orderInfo?.customer_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="供应商">
            {orderInfo?.supplier?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="采购日期">
            {orderInfo?.date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="订单币种">
            {orderInfo?.order_currency_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="结算币种">
            {orderInfo?.settlement_currency_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="定金金额">
            {orderInfo?.deposit_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="定金比例">
            {orderInfo?.deposit_ratio}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="起运地">
            {orderInfo?.departure}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="目的地">
            {orderInfo?.destination}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预计装船日期">
            {orderInfo?.estimated_shipping_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预计入库仓库">
            {orderInfo?.estimated_warehouse_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            {orderInfo?.status}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="备注">
            {orderInfo?.remarks}
          </ProDescriptions.Item>
        </ProDescriptions>

        <Divider />
        <Card title="附件列表" bordered={false}>
          <List
            itemLayout="horizontal"
            dataSource={orderInfo?.attachments || []}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.name}
                    </a>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
        <Card title="采购单明细" bordered={false}>
          <ProTable
            style={{
              marginBottom: 24,
            }}
            columns={columns}
            dataSource={productList}
            pagination={false}
            search={false}
            loading={loading}
            options={false}
            toolBarRender={false}
            scroll={{ x: 'max-content' }}
            // summary={() => (
            //   <Table.Summary.Row>
            //     <Table.Summary.Cell colSpan={2}>总计</Table.Summary.Cell>
            //     <Table.Summary.Cell>{totalQuantity}</Table.Summary.Cell>
            //     <Table.Summary.Cell />
            //     <Table.Summary.Cell>{totalAmount}</Table.Summary.Cell>
            //   </Table.Summary.Row>
            // )}
            rowKey="id"
          />
        </Card>
      </Card>
    </Spin>
  );
};

export default PurchaseOrderDetail;
