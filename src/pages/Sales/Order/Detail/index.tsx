import RemittanceBillCreateForm from '@/components/RemittanceBill/RemittanceBillCreate';
import {
  deleteOrderFile,
  getOrderFileList,
  uploadSalesOrderFile,
} from '@/services/file';
import {
  getSalesOrderDetail,
  getSalesOrderProductList,
  getSalesOrderStepList,
  uploadDocments,
  updateSalesOrderProductItem,
} from '@/services/sales_order';
import { UploadOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ProTable } from '@ant-design/pro-table';
import { history } from '@umijs/max';
import type { TabsProps } from 'antd';
import {
  Button,
  Card,
  Divider,
  Input,
  message,
  Modal,
  Spin,
  Steps,
  Table,
  Tabs,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Decimal from 'decimal.js';
import { EditOutlined } from '@ant-design/icons';
import './SalesOrderDetail.css';

const { Column, ColumnGroup } = Table;

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

  const [logisticsData, setLogisticsData] = useState([]);
  const [processDetail, setProcessDetail] = useState({});
  const [paymentInfoData, setPaymentInfoData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [certificateDatas, setCertificateDatas] = useState([]);
  const [salesPaymentInfo, setSalesPaymentInfo] = useState([]);

  const [editingPaymentInfoIndex, setEditingPaymentInfoIndex] = useState(null);
  const [inputValuePaymentInfo, setInputValuePaymentInfo] = useState('');
  const [isSavingPaymentInfo, setIsSavingPaymentInfo] = useState(false);

  const handleSavePaymentInfo = (uuid0, key) => {
    // 保存操作
    setEditingPaymentInfoIndex(null);
    setIsSavingPaymentInfo(false);
    console.log('保存的值:', inputValuePaymentInfo);
    let val = inputValuePaymentInfo;
    if (key === 'pay_rongda_deposit' || key === 'pay_rongda_final_payment') {
      val = parseFloat(val);
    }

    updateSalesOrderProductItem({ uuid: uuid0, key: key, value: val }).then((res) => {
      if (res.code === 200) {
        message.success('保存成功');
        fetchProductList(uuid);
      } else {
        message.error('保存失败');
      }
    });

    setInputValuePaymentInfo('');
  };

  const handleCancelPaymentInfo = () => {
    // 取消编辑
    setEditingPaymentInfoIndex(null);
    setIsSavingPaymentInfo(false);
    setInputValuePaymentInfo('');
  };



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
    fetchOrderFileList(uuid);
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

        const logisticsDataArr = [
          {
            ship_company: response.data?.purchase_order_info?.ship_company,
            ship_name: response.data?.purchase_order_info?.ship_name,
            voyage: response.data?.purchase_order_info?.voyage,
            bill_of_lading_no:
              response.data?.purchase_order_info?.bill_of_lading_no,
            cabinet_no: response.data?.purchase_order_info?.cabinet_no,
            cabinet_type: response.data?.purchase_order_info?.cabinet_type,
            estimated_shipping_date:
              response.data?.purchase_order_info?.estimated_shipping_date,
            estimated_arrival_date:
              response.data?.purchase_order_info?.estimated_arrival_date,
            departure_port: response.data?.purchase_order_info?.departure_port,
            destination_port:
              response.data?.purchase_order_info?.destination_port,
            actual_arrival_port:
              response.data?.purchase_order_info?.actual_arrival_port,
          },
        ];

        setLogisticsData(logisticsDataArr);

        const processDetailInfo = {
          order_date: response.data?.purchase_order_info?.date,
          deposit_amount_date: response.data?.deposit_amount_date,
          final_payment_amount_date: response.data?.final_payment_amount_date,
          invoice_date: response.data?.invoice_date,
        };

        setProcessDetail(processDetailInfo);
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderFileList = async (uuid) => {
    try {
      const response = await getOrderFileList({ order_no: uuid });
      if (response.code === 200) {
        let fileList = response.data;
        fileList.push({
          name: '',
          url: '',
        });
        setCertificateDatas(response.data);
      } else {
        message.error('获取文件列表失败');
      }
    } catch (error) {
      message.error('获取文件列表失败');
    }
  };

  const handleDeleteCertificate = async (uuid0) => {
    try {
      const response = await deleteOrderFile({ uuid: uuid0 });
      if (response.code === 200) {
        message.success('删除成功');
        fetchOrderFileList(uuid);
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('删除失败');
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

        let salesPaymentInfoArr = [];

        response.data.forEach((item) => {
          // let totalAmount = item.purchase_order_item?.rmb_deposit_amount + item.purchase_order_item?.rmb_residual_amount + item.purchase_order_item?.tariff + item.purchase_order_item?.vat;
          // let totalRongda = item?.pay_rongda_deposit + item?.pay_rongda_final_payment;

          const calculateTotalAmount = () => {
            return new Decimal(item.purchase_order_item?.rmb_deposit_amount || 0)
                .plus(item.purchase_order_item?.rmb_residual_amount || 0)
                .plus(item.purchase_order_item?.tariff || 0)
                .plus(item.purchase_order_item?.vat || 0)
                .toNumber(); // 转为普通数字
          };

          const calculateTotalRongdaAmount = () => {
            return new Decimal(item.pay_rongda_deposit || 0)
                .plus(item.pay_rongda_final_payment || 0)
                .toNumber(); // 转为普通数字
          };
          
          let salesPaymentInfo = {
            uuid: item.uuid,
            product_name: item.product?.name,
            weight: item.purchase_order_item?.weight,
            box_num: item.purchase_order_item?.box_num,
            rmb_deposit_amount: item.purchase_order_item?.rmb_deposit_amount,
            rmb_deposit_amount_time: item.purchase_order_item?.rmb_deposit_amount_time,
            rmb_residual_amount: item.purchase_order_item?.rmb_residual_amount,
            rmb_residual_amount_time: item.purchase_order_item?.rmb_residual_amount_time,
            tariff: item.purchase_order_item?.tariff,
            vat: item.purchase_order_item?.vat,
            payment_date: item.purchase_order_item?.payment_date,
            total_amount: calculateTotalAmount(),
            pay_rongda_deposit: item?.pay_rongda_deposit,
            pay_rongda_deposit_date: item?.pay_rongda_deposit_date,
            pay_rongda_final_payment: item?.pay_rongda_final_payment,
            pay_rongda_final_payment_date: item?.pay_rongda_final_payment_date,
            total_rongda: calculateTotalRongdaAmount(),
          };
          salesPaymentInfoArr.push(salesPaymentInfo);
        });

        setSalesPaymentInfo(salesPaymentInfoArr);

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
      render: (text, record) =>
        record.purchase_order_item?.estimated_arrival_date,
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
      render: (text, record) =>
        record.purchase_order_item?.deposit_exchange_rate,
    },
    {
      title: '尾款汇率',
      dataIndex: 'residual_exchange_rate',
      key: 'residual_exchange_rate',
      render: (text, record) =>
        record.purchase_order_item?.residual_exchange_rate,
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

  const columnsLogisticsPaymentInfo = [
    {
      title: '船公司',
      dataIndex: 'ship_company',
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
      title: '提单号',
      dataIndex: 'bill_of_lading_no',
    },
    {
      title: '柜号',
      dataIndex: 'cabinet_no',
    },
    {
      title: '柜型',
      dataIndex: 'cabinet_type',
    },
    {
      title: '预计装船时间',
      dataIndex: 'estimated_shipping_date',
    },
    {
      title: '预计到港时间',
      dataIndex: 'estimated_arrival_date',
    },
    {
      title: '起运港',
      dataIndex: 'departure_port',
    },
    {
      title: '目的地',
      dataIndex: 'destination_port',
    },
    {
      title: '实际到港时间',
      dataIndex: 'actual_arrival_port',
    },
  ];

  const columnsSettlementInfo = [
    {
      title: '货物名称',
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
      title: '账单金额',
      dataIndex: 'payer',
    },
    {
      title: '已付金额',
      dataIndex: 'remark',
    },
    {
      title: '欠款金额',
      dataIndex: 'remark',
    },
    {
      title: '垫资天数',
      dataIndex: 'remark',
    },
    {
      title: '开票状态',
      dataIndex: 'remark',
    },
  ];

  const handleUploadCertificate = async (fileList0) => {
    // console.log(key);
    setFileList(fileList0);

    if (fileList0.length > 0) {
      const file = fileList0[0].originFileObj;
      try {
        // 获取表单中的其他值

        // 创建 FormData
        const formData = new FormData();
        formData.append('file', file); // 添加文件
        formData.append('order_no', uuid);
        // 使用 axios 上传文件和其他数据
        const response = await uploadSalesOrderFile(formData);
        if (response.code === 200) {
          message.success('文件上传成功');
          fetchOrderFileList(uuid);
        } else {
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
      dataIndex: 'name',
      width: '300px',
    },
    {
      key: '2',
      title: '合同单证',
      dataIndex: 'url',
      render: (text, record) => {
        // 如果是空的，显示按钮上传证件
        console.log(record);
        if (text === '') {
          return (
            <Upload
              beforeUpload={() => false} // 禁用自动上传
              fileList={fileList}
              onChange={({ fileList }) => handleUploadCertificate(fileList)} // 文件选择后自动上传
            >
              <Button>上传证件</Button>
            </Upload>
          );
        }

        return (
          <div>
            <div>
              <div className="file-item">
                <a
                  href={'/public/' + text}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{record.filename}</span>
                </a>
                <Button
                  type="link"
                  onClick={() => handleDeleteCertificate(record.uuid)}
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const itemTabs: TabsProps['items'] = [
    {
      key: '1',
      label: '明细',
      children: (
        <ProTable
          style={{
            marginBottom: 24,
          }}
          columns={columns}
          dataSource={productList}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          search={false}
          toolBarRender={false}
        />
      ),
    },
    {
      key: '2',
      label: '物流信息',
      children: (
        <ProTable
          style={{
            marginBottom: 24,
          }}
          columns={columnsLogisticsPaymentInfo}
          dataSource={logisticsData}
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
      label: '付款明细',
      children: (
        <Table dataSource={salesPaymentInfo} scroll={{ x: 'max-content' }} rowKey='uuid'>
          <ColumnGroup title="货物明细">
            <Column
              title="货物名称"
              dataIndex="product_name"
              key="product_name"
            />
            <Column title="重量" dataIndex="weight" key="weight" />
            <Column title="件数" dataIndex="box_num" key="box_num" />
          </ColumnGroup>
          <ColumnGroup title="支付供应商">
            <Column
              title="支付供应商预付款"
              dataIndex="rmb_deposit_amount"
              key="rmb_deposit_amount"
            />
            <Column
              title="支付供应商预付款时间"
              dataIndex="rmb_deposit_amount_time"
              key="rmb_deposit_amount_time"
            />
            <Column title="支付供应商尾款" dataIndex="rmb_residual_amount" key="rmb_residual_amount" />
            <Column
              title="支付供应商尾款时间"
              dataIndex="rmb_residual_amount_time"
              key="rmb_residual_amount_time"
            />
            <Column title="支付增值税" dataIndex="vat" key="vat" />
            <Column title="支付关税" dataIndex="tariff" key="tariff" />
            <Column title="缴税时间" dataIndex="payment_date" key="payment_date" />
            <Column title="合计金额" dataIndex="total_amount" key="total_amount" />
          </ColumnGroup>
          <ColumnGroup title="支付融大">
            <Column
              title="支付融大预付款"
              dataIndex="pay_rongda_deposit"
              key="pay_rongda_deposit"
              render={(text, record, index) => {
                const indexKey = `${index}_pay_rongda_deposit`; // 组合 index 和 key
                return (
                  <div
                    // onMouseEnter={() => editingPaymentInfoIndex === null && setEditingPaymentInfoIndex(indexKey)}
                    // onMouseLeave={() => !isSavingPaymentInfo && setEditingPaymentInfoIndex(null)}
                  >
                    {editingPaymentInfoIndex  === indexKey ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Input
                          value={inputValuePaymentInfo}
                          onChange={(e) => setInputValuePaymentInfo(e.target.value)}
                          style={{ marginRight: 8 }}
                        />
                        <Button
                          type="primary"
                          onClick={() => {
                            setIsSavingPaymentInfo(true);
                            handleSavePaymentInfo(record.uuid, 'pay_rongda_deposit');
                          }}
                          style={{ marginRight: 8 }}
                        >
                          保存
                        </Button>
                        <Button onClick={handleCancelPaymentInfo}>取消</Button>
                      </div>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => {
                        if (editingPaymentInfoIndex === null) {
                          setEditingPaymentInfoIndex(indexKey)
                        }else{
                          message.error('请先保存当前编辑的数据')
                        }
                      }}>
                      <span>{text || '无数据'}</span>
                      <EditOutlined style={{ marginLeft: 8 }} />
                    </span>
                    )}
                  </div>
                );
              }}
            />
            <Column
              title="支付融大预付款时间"
              dataIndex="pay_rongda_deposit_date"
              key="pay_rongda_deposit_date"
              render={(text, record, index) => {
                const indexKey = `${index}_pay_rongda_deposit_date`; // 组合 index 和 key
                return (
                  <div
                  //  onMouseEnter={() => editingPaymentInfoIndex === null && setEditingPaymentInfoIndex(indexKey)}
                    // onMouseLeave={() => !isSavingPaymentInfo && setEditingPaymentInfoIndex(null)}
                  >
                    {editingPaymentInfoIndex  === indexKey ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Input
                          value={inputValuePaymentInfo}
                          onChange={(e) => setInputValuePaymentInfo(e.target.value)}
                          style={{ marginRight: 8 }}
                          type='date'
                        />
                        <Button
                          type="primary"
                          onClick={() => {
                            setIsSavingPaymentInfo(true);
                            handleSavePaymentInfo(record.uuid, 'pay_rongda_deposit_date');
                          }}
                          style={{ marginRight: 8 }}
                        >
                          保存
                        </Button>
                        <Button onClick={handleCancelPaymentInfo}>取消</Button>
                      </div>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() =>{
                        if (editingPaymentInfoIndex === null) {
                          setEditingPaymentInfoIndex(indexKey)
                        }else{
                          message.error('请先保存当前编辑的数据')
                        }
                      }}>
                      <span>{text || '无数据'}</span>
                      <EditOutlined style={{ marginLeft: 8 }} />
                    </span>
                    )}
                  </div>
                );
              }}
            />
            <Column title="支付融大尾款" dataIndex="pay_rongda_final_payment" key="pay_rongda_final_payment" 
             render={(text, record, index) => {
              const indexKey = `${index}_pay_rongda_final_payment`; // 组合 index 和 key
              return (
                <div
                 // onMouseEnter={() => editingPaymentInfoIndex === null && setEditingPaymentInfoIndex(indexKey)}
                  // onMouseLeave={() => !isSavingPaymentInfo && setEditingPaymentInfoIndex(null)}
                >
                  {editingPaymentInfoIndex  === indexKey ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Input
                        value={inputValuePaymentInfo}
                        onChange={(e) => setInputValuePaymentInfo(e.target.value)}
                        style={{ marginRight: 8 }}
                      />
                      <Button
                        type="primary"
                        onClick={() => {
                          setIsSavingPaymentInfo(true);
                          handleSavePaymentInfo(record.uuid, 'pay_rongda_final_payment');
                        }}
                        style={{ marginRight: 8 }}
                      >
                        保存
                      </Button>
                      <Button onClick={handleCancelPaymentInfo}>取消</Button>
                    </div>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() =>{
                      if (editingPaymentInfoIndex === null) {
                        setEditingPaymentInfoIndex(indexKey)
                      }else{
                        message.error('请先保存当前编辑的数据')
                      }
                    }}>
                      <span>{text || '无数据'}</span>
                      <EditOutlined style={{ marginLeft: 8 }} />
                    </span>
                  )}
                </div>
              );
            }}
            />
            <Column
              title="支付融大尾款时间"
              dataIndex="pay_rongda_final_payment_date"
              key="pay_rongda_final_payment_date"
              render={(text, record, index) => {
                const indexKey = `${index}_pay_rongda_final_payment_date`; // 组合 index 和 key
                return (
                  <div
                    //onMouseEnter={() => editingPaymentInfoIndex === null && setEditingPaymentInfoIndex(indexKey)}
                    // onMouseLeave={() => !isSavingPaymentInfo && setEditingPaymentInfoIndex(null)}
                  >
                    {editingPaymentInfoIndex  === indexKey ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Input
                          value={inputValuePaymentInfo}
                          onChange={(e) => setInputValuePaymentInfo(e.target.value)}
                          style={{ marginRight: 8 }}
                          type='date'
                        />
                        <Button
                          type="primary"
                          onClick={() => {
                            setIsSavingPaymentInfo(true);
                            handleSavePaymentInfo(record.uuid, 'pay_rongda_final_payment_date');
                          }}
                          style={{ marginRight: 8 }}
                        >
                          保存
                        </Button>
                        <Button onClick={handleCancelPaymentInfo}>取消</Button>
                      </div>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() =>{

                        if (editingPaymentInfoIndex === null) {
                          setEditingPaymentInfoIndex(indexKey)
                        }else{
                          message.error('请先保存当前编辑的数据')
                        }
                        
                      }}>
                      <span>{text || '无数据'}</span>
                      <EditOutlined style={{ marginLeft: 8 }} />
                    </span>
                    )}
                  </div>
                );
              }}
            />
            <Column title="合计金额" dataIndex="total_rongda" key="total_rongda" />
          </ColumnGroup>
        </Table>
      ),
    },
    {
      key: '3-1',
      label: '结算',
      children: (
        <ProTable
          style={{
            marginBottom: 24,
          }}
          columns={columnsSettlementInfo}
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
      key: '4',
      label: '进程明细',
      children: (
        <ProDescriptions layout="vertical" bordered column={8}>
          <ProDescriptions.Item label="接单时间" dataIndex="order_date">
            {processDetail?.order_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="签订合同时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="支付预付款时间"
            dataIndex="deposit_amount_date"
          >
            {processDetail?.deposit_amount_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="支付尾款时间"
            dataIndex="final_payment_amount_date"
          >
            {processDetail?.final_payment_amount_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="入库时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item label="提货时间" dataIndex="process_detail">
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item label="开发票时间" dataIndex="invoice_date">
            {processDetail?.invoice_date}
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

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="订单详情">
        <ProDescriptions column={3}>
          <ProDescriptions.Item label="采购单号（合同号）">
            {orderInfo?.order_no}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="供应商">
            {orderInfo?.purchase_order_info?.supplier?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="采购时间">
            {orderInfo?.purchase_order_info?.date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="境内收货人">
            {orderInfo?.customer_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="是否垫资">
            {orderInfo?.is_advance_fund ? '是' : '否'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="是否垫税">
            {orderInfo?.is_advance_tax ? '是' : '否'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="垫资天数">
            {orderInfo?.advance_fund_days || '-'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="是否分期支付">
            {orderInfo?.is_installment_payment ? '是' : '否'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="付款比例">
            {orderInfo?.deposit_ratio}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="PI总金额">
            {orderInfo?.purchase_order_info?.pi_total_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="CI总金额">
            {orderInfo?.purchase_order_info.ci_total_amount}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预计船期">
            {orderInfo?.purchase_order_info?.estimated_arrival_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="起运港">
            {orderInfo?.purchase_order_info?.departure_port}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="目的地">
            {orderInfo?.purchase_order_info?.destination_port}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="预计入库仓库">
            {orderInfo?.purchase_order_info?.estimated_warehouse_info?.name}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="是否海关放行">
            {orderInfo?.purchase_order_info?.is_customs_clearance}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="订单状态">
            {orderInfo?.order_status}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="入库状态">
            {orderInfo?.order_status}
          </ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Tabs defaultActiveKey="1" items={itemTabs} onChange={onTabChange} />
        {/* <Card title="商品列表" bordered={false}>
          <Table
            columns={columns}
            dataSource={productList}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
           
          />
        </Card> */}

        {/* <Card
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
        </Card> */}
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
