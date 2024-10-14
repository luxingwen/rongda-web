// src/pages/PurchaseOrderDetail.jsx
import { getCustomerOptions } from '@/services/customer';
import {
  getPurchaseOrderProductList,
  getPurchaseOrdersInfo,
  updatePurchaseOrderItem,
  updatePurchaseOrderReceiptFile,
  deletePurchaseOrderReceiptFile,
} from '@/services/purchase_order';
import { getStorehouseOptions } from '@/services/storehouse';
import { getSupplierOptions } from '@/services/supplier';
import type { ProColumns } from '@ant-design/pro-components';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ProTable } from '@ant-design/pro-table';
import type { TabsProps } from 'antd';

import {
  Button,
  Card,
  Divider,
  message,
  Select,
  Spin,
  Table,
  Tabs,
  Tag,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PurchaseOrderDetail = () => {
  const { uuid } = useParams();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [storehouseOptions, setStorehouseOptions] = useState([]);

  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchOrderDetail(uuid);
    fetchProductList(uuid);
    fetchSupplierOptions();
    fetchCustomerOptions();
    fetchStorehouseOptions();
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

  const fetchSupplierOptions = async () => {
    try {
      const response = await getSupplierOptions();
      if (response.code === 200) {
        setSupplierOptions(response.data);
      } else {
        message.error('获取供应商选项失败');
      }
    } catch (error) {
      message.error('获取供应商选项失败');
    }
  };

  const fetchCustomerOptions = async () => {
    try {
      const response = await getCustomerOptions();
      if (response.code === 200) {
        setCustomerOptions(response.data);
      } else {
        message.error('获取客户选项失败');
      }
    } catch (error) {
      message.error('获取客户选项失败');
    }
  };

  const fetchStorehouseOptions = async () => {
    try {
      const response = await getStorehouseOptions();
      if (response.code === 200) {
        setStorehouseOptions(response.data);
      } else {
        message.error('获取仓库选项失败');
      }
    } catch (error) {
      message.error('获取仓库选项失败');
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
      key: 'invoice_attachment',
      title: '形式发票/采购订单附件',
      value: orderInfo?.invoice_attachment,
    },
    {
      key: 'commercial_invoice',
      title: '商业发票',
      value: orderInfo?.commercial_invoice,
    },
    {
      key: 'packing_list',
      title: '装箱单',
      value: orderInfo?.packing_list,
    },
    {
      key: 'bill_of_lading',
      title: '船公司提单',
      value: orderInfo?.bill_of_lading,
    },
    {
      key: 'batch_order',
      title: '批次单',
      value: orderInfo?.batch_order,
    },
    {
      key: 'sanitary_certificate',
      title: '卫生证',
      value: orderInfo?.sanitary_certificate,
    },
    {
      key: 'certificate_of_origin',
      title: '产地证',
      value: orderInfo?.certificate_of_origin,
    },
    {
      key: 'customs_declaration',
      title: '报关单',
      value: orderInfo?.customs_declaration,
    },
    {
      key: 'quarantine_certificate',
      title: '检疫证',
      value: orderInfo?.quarantine_certificate,
    },
    {
      key: '10',
      title: '其它证件',
      value: '',
    },
  ];

  

  const handleDeleteCertificate = (key) => {
    // const newCertificateDatas = certificateDatas.filter((item) => item.key !== key);
    //setCertificateDatas(newCertificateDatas);
    deletePurchaseOrderReceiptFile({ key, order_no: uuid }).then((response) => {
      if (response.code === 200) {
        message.success('文件删除成功');
        fetchOrderDetail(uuid);
      } else {
        message.error('文件删除失败');
      }
    });
  };


  const handleUploadCertificate = async (fileList0, key) => {
    // console.log(key);
    setFileList(fileList0);

    if (fileList0.length > 0) {
      const file = fileList0[0].originFileObj;
      try {
        // 获取表单中的其他值
      
        // 创建 FormData
        const formData = new FormData();
        formData.append('file', file); // 添加文件
        formData.append('key', key); // 添加其它字段，比如 name
        formData.append('order_no', uuid);
        console.log("key:", key);

        // 使用 axios 上传文件和其他数据
        const response = await updatePurchaseOrderReceiptFile(formData);
        if (response.code === 200) {
          

          message.success('文件上传成功');
          fetchOrderDetail(uuid);
        }else{
          message.error('文件上传失败0');
        }
      } catch (error) {
        message.error('文件上传失败1:' + error);
      }
      setFileList([]);
    }
  };


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

          return (
            <Upload
            beforeUpload={() => false} // 禁用自动上传
            fileList={fileList}
            onChange={({fileList}) => handleUploadCertificate(fileList, record.key)} // 文件选择后自动上传
          >
            <Button>上传证件</Button>
            </Upload>
            );
        }
        return (
          <div>
            <a href={"/public/"+ text} target="_blank" rel="noopener noreferrer">
              查看证件
            </a>
            <Button onClick={() => handleDeleteCertificate(record.key)}>
              删除
            </Button>
          </div>
        );
      },
    },
  ];


  const columnsHeaderPaymentInfo = [
    {
      title: '产品名称',
      dataIndex: 'payment_date',
    },
    {
      title: '重量',
      dataIndex: 'payment_amount',
    },
    {
      title: '件数',
      dataIndex: 'payment_method',
    },
    {
      title: '预付款时间',
      dataIndex: 'payer',
    },
    {
      title: '已付预付款金额',
      dataIndex: 'remark',
    },
    {
      title: '已付尾款时间',
      dataIndex: 'remark',
    },
    {
      title: '已付尾款金额',
      dataIndex: 'remark',
    },
    {
      title: '缴税时间',
      dataIndex: 'remark',
    },
    {
      title: '关税',
      dataIndex: 'remark',
    },
    {
      title: '增值税',
      dataIndex: 'remark',
    },
    {
      title: '预付款手续费',
      dataIndex: 'remark',
    },
    {
      title: '尾款手续费',
      dataIndex: 'remark',
    },
    {
      title: '合计金额',
      dataIndex: 'remark',
    },
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
      children: (
        <ProTable
        style={{
          marginBottom: 24,
        }}
        columns={columnsHeaderPaymentInfo}
        dataSource={[]}
        pagination={false}
        search={false}
        loading={loading}
        options={false}
        toolBarRender={false}
        scroll={{ x: 'max-content' }}
        rowKey="id"
      />
      ),
    },
    {
      key: '3',
      label: '结算',
      children: 'Content of Tab Pane 3',
    },
    {
      key: '4',
      label: '进程明细',
      children: (
        <ProDescriptions layout='vertical' bordered column={8} >
          <ProDescriptions.Item label="接单时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item label="签订合同时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预付款付汇时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item label="尾款付汇时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item label="收到副本时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item label="收单正本时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item label="海关放行时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item label="入库时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
        </ProDescriptions>
      ),
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

  const statusColors = {
    待处理: 'blue',
    处理中: 'orange',
    已处理: 'green',
    已审核: 'purple',
    已取消: 'red',
    已完成: 'gold',
    已入库: 'teal',
  };

  const renderStatus = (status, record, index) => {
    if (status === '已完成' || status === '已入库') {
      return <Tag color={statusColors[status]}>{status}</Tag>;
    }

    return (
      <Select
        value={status}
        onChange={(value) => handleChangeStatus(value, record.order_no)}
      >
        {Object.keys(statusColors).map((status) => (
          <Option
            key={status}
            value={status}
            style={{ color: statusColors[status] }}
          >
            {status}
          </Option>
        ))}
      </Select>
    );
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="采购订单详情">
        <ProDescriptions
          column={3}
          editable={{
            editableKeys,
            onChange: setEditableKeys,
            onSave: async (key, record) => {
              console.log('Saved record:', record, 'key:', key);
              const data = {
                key: key,
                value: record[key],
                order_no: orderInfo.order_no,
              };

              updatePurchaseOrderItem(data).then((response) => {
                if (response.code === 200) {
                  message.success('保存成功');
                  fetchOrderDetail(uuid);
                } else {
                  message.error('保存失败' + response.message);
                }
              });
            },
          }}
        >
          <ProDescriptions.Item
            editable={false}
            label="采购单号(合同号)"
            dataIndex="order_no"
          >
            {orderInfo?.order_no}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="供应商"
            dataIndex="supplier_uuid"
            render={(text) => orderInfo?.supplier?.name}
            renderFormItem={(item, props, form) => (
              <Select placeholder="请选择供应商">
                {supplierOptions.map((supplier) => (
                  <Option key={supplier.uuid} value={supplier.uuid}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            )}
          >
            {orderInfo?.supplier?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="采购时间"
            dataIndex="date"
            valueType="date"
          >
            {orderInfo?.date}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="预计船期"
            dataIndex="estimated_shipping_date"
          >
            {orderInfo?.estimated_shipping_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="境内收货人"
            dataIndex="domestic_consignee"
          >
            {orderInfo?.domestic_consignee}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="消费使用单位"
            dataIndex="customer_uuid"
            render={(text) => orderInfo?.customer_info?.name}
            renderFormItem={(item, props, form) => (
              <Select placeholder="请选择客户">
                {customerOptions.map((customer) => (
                  <Option key={customer.uuid} value={customer.uuid}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            )}
          >
            {orderInfo?.customer_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="贸易条款" dataIndex="trade_terms">
            {orderInfo?.trade_terms}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="付款比例" dataIndex="deposit_ratio">
            {orderInfo?.deposit_ratio}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="PI总金额" dataIndex="pi_total_amount">
            {orderInfo?.pi_total_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="预付款金额（美元）"
            dataIndex="deposit_amount"
            valueType="number"
          >
            {orderInfo?.deposit_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="CI总金额"
            dataIndex="ci_total_amount"
            valueType="number"
          >
            {orderInfo?.ci_total_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="尾款金额（美元）"
            dataIndex="residual_amount"
            valueType="number"
          >
            {orderInfo?.residual_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="预计入库仓库"
            dataIndex="estimated_warehouse"
            render={(text) => orderInfo?.estimated_warehouse_info?.name}
            renderFormItem={(item, props, form) => (
              <Select>
                {storehouseOptions.map((storehouse) => (
                  <Option key={storehouse.uuid} value={storehouse.uuid}>
                    {storehouse.name}
                  </Option>
                ))}
              </Select>
            )}
          >
            {orderInfo?.estimated_warehouse_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="是否海关放行"
            dataIndex="is_customs_clearance"
            valueType="select"
            valueEnum={{
              true: { text: '是' },
              false: { text: '否' },
            }}
          >
            {orderInfo?.is_customs_clearance}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="订单状态"
            dataIndex="status"
            render={(text) => <Tag color={statusColors[text]}>{text}</Tag>}
            renderFormItem={(item, props, form) => (
              <Select>
                {Object.keys(statusColors).map((status) => (
                  <Option
                    key={status}
                    value={status}
                    style={{ color: statusColors[status] }}
                  >
                    {status}
                  </Option>
                ))}
              </Select>
            )}
          >
            {orderInfo?.status}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="起运港口" dataIndex="departure">
            {orderInfo?.departure}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="目的地" dataIndex="destination">
            {orderInfo?.destination}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="实际到港时间"
            dataIndex="actual_arrival_date"
            valueType="date"
          >
            {orderInfo?.actual_arrival_date}
          </ProDescriptions.Item>
        </ProDescriptions>

        <Divider />

        <Card bordered={false} title="">
          <ProDescriptions
            column={3}
            editable={{
              editableKeys,
              onChange: setEditableKeys,
              onSave: async (key, record) => {
                console.log('Saved record:', record, 'key:', key);
                const data = {
                  key: key,
                  value: record[key],
                  order_no: orderInfo.order_no,
                };

                updatePurchaseOrderItem(data).then((response) => {
                  if (response.code === 200) {
                    message.success('保存成功');
                    fetchOrderDetail(uuid);
                  } else {
                    message.error('保存失败' + response.message);
                  }
                });
              },
            }}
          >
            <ProDescriptions.Item label="船公司" dataIndex="ship_company">
              {orderInfo?.ship_company}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="船名" dataIndex="ship_name">
              {orderInfo?.ship_name}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="航次" dataIndex="voyage">
              {orderInfo?.voyage}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="提单号" dataIndex="bill_of_lading_no">
              {orderInfo?.bill_of_lading_no}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="柜号" dataIndex="cabinet_no">
              {orderInfo?.cabinet_no}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="柜型" dataIndex="cabinet_type">
              {orderInfo?.cabinet_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="预计装船时间"
              dataIndex="estimated_shipping_date"
              valueType="date"
            >
              {orderInfo?.estimated_shipping_date}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="预计到港时间"
              dataIndex="estimated_arrival_date"
              valueType="date"
            >
              {orderInfo?.estimated_arrival_date}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="起运港" dataIndex="departure_port">
              {orderInfo?.departure_port}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="目的地" dataIndex="destination_port">
              {orderInfo?.destination_port}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="实际到港时间"
              dataIndex="actual_arrival_port"
              valueType="date"
            >
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
