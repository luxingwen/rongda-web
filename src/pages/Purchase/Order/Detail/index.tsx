// src/pages/PurchaseOrderDetail.jsx
import {
  getPurchaseOrderProductList,
  getPurchaseOrdersInfo,
} from '@/services/purchase_order';
import type { ProColumns } from '@ant-design/pro-components';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ProTable } from '@ant-design/pro-table';
import { Card, Divider, List, message, Spin,Tabs,Table,Button } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { TabsProps } from 'antd';
import { data } from 'autoprefixer';
import { render } from '@react-pdf/renderer';

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


 // 证件数据
 const certificateDatas = [
  {
    key: '1',
    title: '形式发票/采购订单附件',
    value: orderInfo?.invoice_attachment,
  },
  {
    key: '2',
    title: '商业发票',
    value: orderInfo?.commercial_invoice,
  },
  {
    key: '3',
    title: '装箱单',
    value: orderInfo?.packing_list,
  },
  {
    key: '4',
    title: '船公司提单',
    value: orderInfo?.bill_of_lading,
  },
  {
    key: '5',
    title: '批次单',
    value: orderInfo?.batch_order,
  },
  {
    key: '6',
    title: '卫生证',
    value: orderInfo?.sanitary_certificate,
  },
  {
    key: '7',
    title: '产地证',
    value: orderInfo?.certificate_of_origin,
  },
  {
    key: '8',
    title: '报关单',
    value: orderInfo?.customs_declaration,
  },
  {
    key: '9',
    title: '检疫证',
    value: orderInfo?.quarantine_certificate,
  },
  {
    key: '10',
    title: '其它证件',
    value: "",
  },
];

 const handleDeleteCertificate = (key) => {
 // const newCertificateDatas = certificateDatas.filter((item) => item.key !== key);
  //setCertificateDatas(newCertificateDatas);
}

  // 证件头
  const certificateHeader = [
    {
    key: '1',
    title: '证件类型',
    dataIndex: 'title',
    width: '300px',
  },
  {
    key: '2',
    title: '合同单证',
    dataIndex: 'value',
    render: (text, record) => {
      // 如果是空的，显示按钮上传证件
      console.log(record);
      if (record.value === '' || record.value === undefined) {
        return <Button>上传证件</Button>;
      }
      return (
        <div>
        <a href={text} target="_blank" rel="noopener noreferrer">
          查看证件
        </a>
         <Button onClick={() => handleDeleteCertificate(record.key)}>删除</Button>
         </div>
      );

    }
  }
];


  const itemTabs: TabsProps['items'] = [
    {
      key: '1',
      label: '采购单明细',
      children: (
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
      ),
    },
    {
      key: '2',
      label: '付款信息',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: '结算',
      children: 'Content of Tab Pane 3',
    },
    {
      key: '4',
      label: '进程明细',
      children: 'Content of Tab Pane 4',
    },
    {
      key: '5',
      label: '证件明细',
      children: (
        <Table dataSource={certificateDatas} columns={certificateHeader} />
      ),
    },
  ];

  const onTabChange = (key: string) => {
    // console.log(key);
  };

 
    

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="采购订单详情">
        <ProDescriptions column={3}>
          <ProDescriptions.Item label="采购单号(合同号)">
            {orderInfo?.order_no}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="供应商">
            {orderInfo?.supplier?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="采购时间">
            {orderInfo?.date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预计船期">
            {orderInfo?.supplier?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="境内收货人">
            {orderInfo?.domestic_consignee}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="消费使用单位">
            {orderInfo?.order_currency_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="贸易条款">
            {orderInfo?.settlement_currency_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="付款比例">
            {orderInfo?.deposit_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="PI总金额">
            {orderInfo?.deposit_ratio}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预付款金额（美元）">
            {orderInfo?.ci_total_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="CI总金额">
            {orderInfo?.ci_total_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="尾款金额（美元）">
            {orderInfo?.residual_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预计入库仓库">
            {orderInfo?.estimated_warehouse_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="是否海关放行">
            {orderInfo?.is_customs_clearance}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="订单状态">
            {orderInfo?.remarks}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="起运港口">
            {orderInfo?.departure}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="目的地">
            {orderInfo?.destination}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="实际到港时间">
            {orderInfo?.actual_arrival_date}
          </ProDescriptions.Item>
        </ProDescriptions>

        <Divider />

        <Card bordered={false} title="">
        <ProDescriptions column={3}>
          <ProDescriptions.Item label="船公司">
            {orderInfo?.ship_company}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="船名">
            {orderInfo?.ship_name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="航次">
            {orderInfo?.voyage}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="提单号">
            {orderInfo?.bill_of_lading_no}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="柜号">
            {orderInfo?.cabinet_no}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="柜型">
            {orderInfo?.cabinet_type}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预计装船时间">
            {orderInfo?.estimated_shipping_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预计到港时间">
            {orderInfo?.estimated_arrival_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="起运港">
            {orderInfo?.departure_port}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="目的地">
            {orderInfo?.destination_port}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="实际到港时间">
            {orderInfo?.actual_arrival_port}
          </ProDescriptions.Item>


          </ProDescriptions>
        </Card>

        <Tabs defaultActiveKey="1" items={itemTabs} onChange={onTabChange} />

        {/* <Card title="附件列表" bordered={false}>
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
        </Card> */}
        
        {/* <Card title="采购单明细" bordered={false}>
          
        </Card> */}
      </Card>
    </Spin>
  );
};

export default PurchaseOrderDetail;
