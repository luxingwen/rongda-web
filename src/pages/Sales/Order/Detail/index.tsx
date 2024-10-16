import RemittanceBillCreateForm from '@/components/RemittanceBill/RemittanceBillCreate';
import {
  getSalesOrderDetail,
  getSalesOrderProductList,
  getSalesOrderStepList,
  uploadDocments,
} from '@/services/sales_order';
import { UploadOutlined } from '@ant-design/icons';
import { RouteContext } from '@ant-design/pro-components';
import ProDescriptions from '@ant-design/pro-descriptions';
import { history } from '@umijs/max';
import {
  Button,
  Card,
  Divider,
  message,
  Modal,
  Spin,
  Steps,
  Table,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './SalesOrderDetail.css';
import { render } from '@react-pdf/renderer';

const { Step } = Steps;

const SalesOrderDetail = () => {
  const { uuid } = useParams();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [stepList, setStepList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [docFileList, setDocFileList] = useState([]);
  const [exsitingDocFileList, setExistingDocFileList] = useState([]);
  // 添加付汇弹窗
  const [remittanceBillVisible, setRemittanceBillVisible] = useState(false);
  const [remittanceBillType, setRemittanceBillType] = useState('定金');

  const handleFileChange = ({ fileList: newFileList }) => {
    setDocFileList(newFileList);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    // Here you can handle the file upload process
    console.log('Uploaded files:', docFileList);
    const formData = new FormData();
    docFileList.forEach((file) => {
      formData.append('attachment', file.originFileObj);
    });

    formData.append('order_no', uuid);
    if (exsitingDocFileList.length > 0) {
      formData.append('existfiles', JSON.stringify(exsitingDocFileList));
    }

    const res = await uploadDocments(formData);
    if (res.code === 200) {
      message.success('上传成功');
      setIsModalVisible(false);
      fetchOrderDetail(uuid);
    } else {
      message.error('上传失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onChange = (current) => {
    setCurrent(current);
  };

  useEffect(() => {
    fetchOrderDetail(uuid);
    fetchProductList(uuid);
    fetchStepList(uuid);
  }, [uuid]);

  const fetchOrderDetail = async (uuid) => {
    try {
      const response = await getSalesOrderDetail({ uuid });
      if (response.code === 200) {
        setOrderInfo(response.data);
        if (response.data?.documents !== '') {
          const documents = JSON.parse(response.data.documents);
          setExistingDocFileList(documents);
        }
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFileParams = (index) => {
    const newFileList = [...exsitingDocFileList];
    newFileList.splice(index, 1);
    setExistingDocFileList(newFileList);
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

  const fetchStepList = async (uuid) => {
    try {
      const response = await getSalesOrderStepList({ uuid });
      if (response.code === 200) {
        setStepList(response.data);
      } else {
        message.error('获取步骤列表失败');
      }
    } catch (error) {
      message.error('获取步骤列表失败');
    }
  };

  const handleButtonClick = (path) => {
    history.push(path);
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
      render: (text, record) => record.purchase_order_item?.quantity,
    },
    {
      title: '产品价格',
      dataIndex: 'price',
      render: (text, record) => record.purchase_order_item?.price,
    },
    {
      title: '产品总金额',
      dataIndex: 'total_amount',
      render: (text, record) => record.purchase_order_item?.total_amount,
    },
    {
      title: 'PI箱数',
      dataIndex: 'pi_box_num',
      render: (text, record) => record.purchase_order_item?.pi_box_num,
    },
    {
      title: 'PI数量',
      dataIndex: 'pi_quantity',
      render: (text, record) => record.purchase_order_item?.pi_quantity,
    },
    {
      title: 'PI单价',
      dataIndex: 'pi_unit_price',
      render: (text, record) => record.purchase_order_item?.pi_unit_price,
    },
    {
      title: 'PI总金额',
      dataIndex: 'pi_total_amount',
      render: (text, record) => record.purchase_order_item?.pi_total_amount,
    },
    {
      title: '柜号',
      dataIndex: 'cabinet_no',
      render: (text, record) => record.purchase_order_item?.cabinet_no,
    },
    {
      title: '提单号',
      dataIndex: 'bill_of_lading_no',
      render: (text, record) => record.purchase_order_item?.bill_of_lading_no,
    },
    {
      title: '船名',
      dataIndex: 'ship_name',
      render: (text, record) => record.purchase_order_item?.ship_name,
    },
    {
      title: '航次',
      dataIndex: 'voyage',
      render: (text, record) => record.purchase_order_item?.voyage,
    },
    {
      title: 'CI发票号',
      dataIndex: 'ci_invoice_no',
      render: (text, record) => record.purchase_order_item?.ci_invoice_no,
    },
    {
      title: 'CI箱数',
      dataIndex: 'ci_box_num',
      render: (text, record) => record.purchase_order_item?.ci_box_num,
    },
    {
      title: 'CI数量',
      dataIndex: 'ci_quantity',
      render: (text, record) => record.purchase_order_item?.ci_quantity,
    },
    {
      title: 'CI单价',
      dataIndex: 'ci_unit_price',
      render: (text, record) => record.purchase_order_item?.ci_unit_price,
    },
    {
      title: 'CI总金额',
      dataIndex: 'ci_total_amount',
      render: (text, record) => record.purchase_order_item?.ci_total_amount,
    },
    {
      title: 'CI尾款金额',
      dataIndex: 'ci_residual_amount',
      key: 'ci_residual_amount',
      render: (text, record) => record.purchase_order_item?.ci_residual_amount,
    },
    {
      title: '生产日期',
      dataIndex: 'production_date',
      render: (text, record) => record.purchase_order_item?.production_date,
    },
    {
      title: '预计到港日期',
      dataIndex: 'estimated_arrival_date',
      render: (text, record) => record.purchase_order_item?.estimated_arrival_date,
    },
    {
      title: 'RMB定金金额',
      dataIndex: 'rmb_deposit_amount',
      key: 'rmb_deposit_amount',
      render: (text, record) => record.purchase_order_item?.rmb_deposit_amount,
    },
    {
      title: 'RMB尾款金额',
      dataIndex: 'rmb_residual_amount',
      key: 'rmb_residual_amount',
      render: (text, record) => record.purchase_order_item?.rmb_residual_amount,
    },
    {
      title: '定金汇率',
      dataIndex: 'deposit_exchange_rate',
      key: 'deposit_exchange_rate',
      render: (text, record) => record.purchase_order_item?.deposit_exchange_rate,
    },
    {
      title: '尾款汇率',
      dataIndex: 'residual_exchange_rate',
      key: 'residual_exchange_rate',
      render: (text, record) => record.purchase_order_item?.residual_exchange_rate,
    },
    {
      title: '关税',
      dataIndex: 'tariff',
      render: (text, record) => record.purchase_order_item?.tariff,
    },
    {
      title: '增值税',
      dataIndex: 'vat',
      render: (text, record) => record.purchase_order_item?.vat,
    },
    {
      title: '缴费日期',
      dataIndex: 'payment_date',
      render: (text, record) => record.purchase_order_item?.payment_date,
    },
  ];


  // const columns = [
  //   {
  //     title: '商品',
  //     dataIndex: ['product', 'name'],
  //     key: 'product_uuid',
  //     render: (_, record) => record.product?.name,
  //   },
  //   {
  //     title: 'SKU',
  //     dataIndex: ['sku', 'code'],
  //     key: 'sku_uuid',
  //     render: (_, record) => record.sku?.code,
  //   },
  //   {
  //     title: '规格',
  //     dataIndex: ['sku', 'specification'],
  //     key: 'sku_uuid',
  //     render: (_, record) => record.sku?.specification,
  //   },
  //   {
  //     title: '国家',
  //     dataIndex: 'country',
  //     key: 'country',
  //     render: (_, record) => record.sku?.country,
  //   },
  //   {
  //     title: '厂号',
  //     dataIndex: 'factory_no',
  //     key: 'factory_no',
  //     render: (_, record) => record.sku?.factory_no,
  //   },
  //   { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no' },
  //   { title: '发票号', dataIndex: 'invoice_no', key: 'invoice_no' },
  //   { title: '合同号', dataIndex: 'contract_no', key: 'contract_no' },
  //   { title: '单价', dataIndex: 'product_price', key: 'product_price' },
  //   { title: '数量', dataIndex: 'product_quantity', key: 'product_quantity' },
  //   { title: '箱数', dataIndex: 'box_num', key: 'box_num' },
  //   { title: '总价', dataIndex: 'product_amount', key: 'product_amount' },
  // ];

  const totalQuantity = productList.reduce(
    (acc, item) => acc + item.product_quantity,
    0,
  );
  const totalBoxNum = productList.reduce((acc, item) => acc + item.box_num, 0);
  const totalAmount = productList.reduce(
    (acc, item) => acc + item.product_amount,
    0,
  );

  const renderStepContent = (step) => {
    switch (step.title) {
      case '创建订单':
        return <Card>创建订单的具体内容</Card>;
      case '订单确认':
        return <Card>订单确认的具体内容</Card>;
      case '创建合同':
        return (
          <Card>
            {step?.ref_id ? (
              <Button
                onClick={() =>
                  handleButtonClick(`/sales/agreement/edit/${step.ref_id}`)
                }
              >
                编辑合同
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleButtonClick(`/sales/agreement/create/${uuid}`)
                }
              >
                创建合同
              </Button>
            )}
          </Card>
        );
      case '签署合同':
        return <Card>签署合同的具体内容</Card>;
      case '创建定金合同':
        return (
          <Card>
            {step?.ref_id ? (
              <Button
                onClick={() =>
                  handleButtonClick(
                    `/sales/agreement/edit-deposit/${step.ref_id}`,
                  )
                }
              >
                编辑定金合同
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleButtonClick(`/sales/agreement/create-deposit/${uuid}`)
                }
              >
                创建定金合同
              </Button>
            )}
          </Card>
        );
      case '签署定金合同':
        return <Card>签署定金合同的具体内容</Card>;
      case '支付定金':
        return (
          <Card>
            {step?.ref_id ? (
              <Button
                onClick={() =>
                  handleButtonClick(`/sales/payment-bill/edit/${step.ref_id}`)
                }
              >
                编辑支付账单
              </Button>
            ) : (
              <div>
                <Button
                  onClick={() =>
                    handleButtonClick(`/sales/payment-bill/create/${uuid}`)
                  }
                >
                  创建支付账单
                </Button>
              </div>
            )}

            <Button
              onClick={() => {
                setRemittanceBillType('定金');
                setRemittanceBillVisible(true);
              }}
            >
              创建支付付汇单
            </Button>
          </Card>
        );
      case '更新单据信息':
        return (
          <Card>
            <Button type="primary" onClick={showModal}>
              更新单据
            </Button>
            <Modal
              title="更新单据信息"
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
              okText="上传"
              cancelText="取消"
            >
              <Upload
                onRemove={(file) => {
                  const index = docFileList.indexOf(file);
                  const newFileList = docFileList.slice();
                  newFileList.splice(index, 1);
                  setDocFileList(newFileList);
                }}
                beforeUpload={(file) => {
                  setDocFileList([...docFileList, file]);
                  return false;
                }}
                fileList={docFileList}
                onChange={handleFileChange}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>

              {exsitingDocFileList.length > 0 && (
                <div>
                  {exsitingDocFileList.map((file, index) => (
                    <div key={index} className="file-item">
                      <a
                        href={'/public/' + file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{file.name}</span>
                      </a>
                      <Button
                        type="link"
                        onClick={() => handleRemoveFileParams(index)}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Modal>
          </Card>
        );
      case '船期更新':
        return (
          <Card>
            <Button
              onClick={() => {
                history.push(
                  `/purchase/order/edit-futures/${orderInfo.purchase_order_info.order_no}`,
                );
              }}
            >
              {' '}
              去更新船期{' '}
            </Button>
          </Card>
        );
      case '创建尾款合同':
        return (
          <Card>
            {step?.ref_id ? (
              <Button
                onClick={() =>
                  handleButtonClick(
                    `/sales/agreement/edit-final-payment/${step.ref_id}`,
                  )
                }
              >
                编辑尾款合同
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleButtonClick(
                    `/sales/agreement/create-final-payment/${uuid}`,
                  )
                }
              >
                创建尾款合同
              </Button>
            )}
          </Card>
        );
      case '签署尾款合同':
        return <Card>签署尾款合同的具体内容</Card>;
      case '支付尾款':
        return (
          <Card>
            {step?.ref_id ? (
              <Button
                onClick={() =>
                  handleButtonClick(`/sales/payment-bill/edit/${step.ref_id}`)
                }
              >
                编辑支付账单
              </Button>
            ) : (
              <div>
                <Button
                  onClick={() =>
                    handleButtonClick(
                      `/sales/payment-bill/final/create/${uuid}`,
                    )
                  }
                >
                  创建支付账单
                </Button>
              </div>
            )}

            <Button
              onClick={() => {
                setRemittanceBillType('尾款');
                setRemittanceBillVisible(true);
              }}
            >
              创建支付付汇单
            </Button>
          </Card>
        );
      case '等待货物到港清关':
        return <Card>等待货物到港清关的具体内容</Card>;
      case '货物流向':
        return <Card>货物流向的具体内容</Card>;
      case '货物海关放行':
        return <Card>货物海关放行的具体内容</Card>;
      case '入库或倒柜直提':
        return <Card>入库或倒柜直提的具体内容</Card>;
      case '预约提货':
        return <Card>预约提货的具体内容</Card>;
      case '账单结算':
        return (
          <Card>
            {step?.ref_id ? (
              <Button
                onClick={() =>
                  handleButtonClick(`/sales/settlement/edit/${step.ref_id}`)
                }
              >
                编辑结算账单
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleButtonClick(`/sales/settlement/create/${uuid}`)
                }
              >
                创建结算账单
              </Button>
            )}
          </Card>
        );
      case '账单确认':
        return <Card>账单确认的具体内容</Card>;
      case '货款支付':
        return <Card>货款支付的具体内容</Card>;
      case '货物放行':
        return <Card>货物放行的具体内容</Card>;
      case '完成':
        return <Card>订单完成的具体内容</Card>;
      default:
        return <Card>该步骤暂无内容</Card>;
    }
  };

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
            scroll={{ x: 'max-content' }}
            // summary={() => (
            //   <Table.Summary.Row>
            //     <Table.Summary.Cell index={0} colSpan={9}>
            //       总计
            //     </Table.Summary.Cell>
            //     <Table.Summary.Cell index={7}>
            //       {totalQuantity}
            //     </Table.Summary.Cell>
            //     <Table.Summary.Cell index={8}>{totalBoxNum}</Table.Summary.Cell>
            //     <Table.Summary.Cell index={9}>{totalAmount}</Table.Summary.Cell>
            //   </Table.Summary.Row>
            // )}
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
                <Steps
                  current={current}
                  onChange={onChange}
                  className="steps-content"
                >
                  {stepList.map((step, index) => (
                    <Step
                      key={index}
                      title={step.title}
                      description={step.description}
                      status={step.status}
                    />
                  ))}
                </Steps>
                <div style={{ marginTop: 24 }}>
                  {renderStepContent(stepList[current] || {})}
                </div>
              </div>
            )}
          </RouteContext.Consumer>
        </Card>
        <Modal
          title="创建付汇账单"
          open={remittanceBillVisible}
          onCancel={() => setRemittanceBillVisible(false)}
          footer={null}
        >
          <RemittanceBillCreateForm
            orderInfo={orderInfo} // Pass the orderNo if needed
            type={remittanceBillType}
            onSuccess={() => setRemittanceBillVisible(false)}
            onCancel={() => setRemittanceBillVisible(false)}
          />
        </Modal>
      </Card>
    </Spin>
  );
};

export default SalesOrderDetail;
