// src/pages/PurchaseOrderDetail.jsx
import { getCustomerOptions } from '@/services/customer';
import { getProductOptions, getProductSkuOptions } from '@/services/product';
import {
  deletePurchaseOrderReceiptFile,
  getPurchaseOrderProductList,
  getPurchaseOrdersInfo,
  updatePurchaseOrderFutrues,
  updatePurchaseOrderItem,
  updatePurchaseOrderReceiptFile,
} from '@/services/purchase_order';
import { getStorehouseOptions } from '@/services/storehouse';
import { getSupplierOptions } from '@/services/supplier';
import type { ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ProTable } from '@ant-design/pro-table';
import type { TabsProps } from 'antd';
import Decimal from 'decimal.js';

import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Table,
  Tabs,
  Tag,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';

interface TableFormOrderItem {
  key: string;
  product_uuid?: string;
  sku_uuid?: string;
  sku_code?: string;
  department?: string;
  isNew?: boolean;
  editable?: boolean;
  sku_spec?: string;
  quantity?: number;
  price?: number;
  total_amount?: number;
  pi_box_num?: number;
  pi_quantity?: number;
  pi_unit_price?: number;
  pi_total_amount?: number;
  cabinet_no?: string;
  bill_of_lading_no?: string;
  ship_name?: string;
  voyage?: string;
  ci_invoice_no?: string;
  ci_box_num?: number;
  ci_quantity?: number;
  ci_unit_price?: number;
  ci_total_amount?: number;
  production_date?: string;
  estimated_arrival_date?: string;
  tariff?: number;
  vat?: number;
  payment_date?: string;
}

const PurchaseOrderDetail = () => {
  const { uuid } = useParams();
  const [form] = Form.useForm();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [storehouseOptions, setStorehouseOptions] = useState([]);

  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
  const [fileList, setFileList] = useState([]);
  const [details, setDetails] = useState<readonly TableFormOrderItem[]>([]);
  const [showEditingRowProduct, setShowEditingRowProduct] =
    useState<boolean>(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [skuOptions, setSkuOptions] = useState({});

  const [editableRowKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);

  const [paymentInfoDatas, setPaymentInfoDatas] = useState([]);

  const [process_detail, setProcess_detail] = useState({});
  const [is_customs_clearance, setIs_customs_clearance] = useState<boolean>(false);

  useEffect(() => {
    fetchProductOptions();
    fetchOrderDetail(uuid);
    fetchProductList(uuid);
    fetchSupplierOptions();
    fetchCustomerOptions();
    fetchStorehouseOptions();
  }, [uuid]);

  const forceRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const fetchProductOptions = async () => {
    try {
      const response = await getProductOptions();
      if (response.code === 200) {
        setProductOptions(response.data);
      } else {
        message.error('获取产品选项失败');
      }
    } catch (error) {
      message.error('获取产品选项失败');
    }
  };

  const showEditProductRow = (record: TableFormOrderItem) => {
    setShowEditingRowProduct(true);
    handleProductChange(record.product_uuid);
    setEditingDetail({ ...record });
  };

  const handleEditProductRowCancel = () => {
    setShowEditingRowProduct(false);
  };

  const handleDetailChange = (field, value) => {
    if (field === 'product_uuid') {
      handleProductChange(value);
    }

    setEditingDetail((prevDetail) => ({
      ...prevDetail,
      [field]: value,
    }));
  };

  const renderSkuSelect = (sku) => {
    if (sku.code == '') {
      return '规格：' + sku.specification;
    }
    return 'SKU：' + sku.code;
  };

  const handleEditProductRowOk = () => {
    console.log('handleEditProductRowOk 0');

    const sku = skuOptions[editingDetail.product_uuid]?.find(
      (item) => item.uuid === editingDetail.sku_uuid,
    );

    console.log('handleEditProductRowOk 1');
    const product = productOptions.find(
      (item) => item.uuid === editingDetail.product_uuid,
    );

    const index = details.findIndex((item) => item.key === editingDetail.key);

    if (index === -1) {
      console.log('handleEditProductRowOk 3');
      // Adding a new item
      const newDetail = {
        ...editingDetail,
        product: product,
        sku: sku,
        key: `0${Date.now()}`,
      };

      console.log('old detail:', details);
      console.log('new detail:', newDetail);
      setDetails((prevDetails) => {
        console.log('prevDetails:', prevDetails);
        const list = [...prevDetails, newDetail];
        console.log('list:', list);
        form.setFieldsValue({
          details: list,
        });
        return list;
      });
      forceRefresh();
      console.log('new details:', details);
      setShowEditingRowProduct(false);
      return;
    }

    console.log('handleEditProductRowOk 2');

    let newDetail = details[index];

    newDetail.product_uuid = editingDetail.product_uuid;
    newDetail.sku_uuid = editingDetail.sku_uuid;
    newDetail.product = product;
    newDetail.sku = sku;
    newDetail.key = Date.now();

    details[index] = newDetail;

    setDetails([...details]);

    setShowEditingRowProduct(false);
  };

  const handleProductChange = async (value) => {
    try {
      const response = await getProductSkuOptions({ uuid: value });
      if (response.code === 200) {
        setSkuOptions((prev) => ({
          ...prev,
          [value]: response.data,
        }));
        setEditingDetail((prevDetail) => ({
          ...prevDetail,
          sku_uuid: undefined,
          product_uuid: value,
        }));
      } else {
        message.error('获取SKU选项失败');
      }
    } catch (error) {
      message.error('获取SKU选项失败');
    }
  };

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

        setProcess_detail(prev => ({

          ...prev,
          orders_date: response.data.date,
          deposit_amount_time: response.data.deposit_amount_time,
          residual_amount_time: response.data.residual_amount_time,
          received_copy_time: response.data.received_copy_time,
          received_original_time: response.data.received_original_time,
          customs_clearance_time: response.data.customs_clearance_time,
          storage_time: response.data.storage_time,
        })
        );

        const is_customs_clearance_val = response.data.is_customs_clearance === 'true' ? true : false;
        setIs_customs_clearance(is_customs_clearance_val);

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

  // const fetchProductList = async (uuid) => {
  //   try {
  //     const response = await getPurchaseOrderProductList({ uuid });
  //     if (response.code === 200) {
  //       setProductList(response.data);
  //     } else {
  //       message.error('获取商品列表失败');
  //     }
  //   } catch (error) {
  //     message.error('获取商品列表失败');
  //   }
  // };

  const fetchProductList = async (uuid) => {
    try {
      const response = await getPurchaseOrderProductList({ uuid });
      if (response.code === 200) {
        setProductList(response.data);
        const detailList = response.data.map((item, index) => ({
          ...item,
          key: index,
        }));
        let paymentInfoArr = [];
        detailList.forEach(item => {
          const calculateTotalAmount = () => {
            return new Decimal(item.rmb_deposit_amount || 0)
                .plus(item.rmb_residual_amount || 0)
                .plus(item.tariff || 0)
                .plus(item.vat || 0)
                .plus(item.prepayment_fee || 0)
                .plus(item.residual_fee || 0)
                .toNumber(); // 转为普通数字
          };
          //let toltalAmount = item.rmb_deposit_amount + item.rmb_residual_amount + item.tariff + item.vat + item.prepayment_fee + item.residual_fee;
          let paymentInfo = {
            product_name: item.product.name,
            box_num: item.box_num,
            rmb_deposit_amount: item.rmb_deposit_amount,
            rmb_residual_amount: item.rmb_residual_amount,
            tariff: item.tariff,
            vat: item.vat,
            payment_date: item.payment_date,
            rmb_deposit_amount_time: item.rmb_deposit_amount_time,
            rmb_residual_amount_time: item.rmb_residual_amount_time,
            prepayment_fee: item.prepayment_fee,
            residual_fee: item.residual_fee,
            total_amount: calculateTotalAmount(),
          };
          paymentInfoArr.push(paymentInfo);
        });

        setPaymentInfoDatas(paymentInfoArr);
        
        setDetails(detailList);
        form.setFieldsValue({
          details: detailList,
        });
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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.order_no = uuid;
      values.deposit_amount = parseFloat(values.deposit_amount);
      values.deposit_ratio = parseFloat(values.deposit_ratio);
      values.details = details.map((d) => ({
        ...d,
        quantity: parseFloat(d.quantity),
        price: parseFloat(d.price),
        total_amount: parseFloat(d.total_amount),
        pi_box_num: parseFloat(d.pi_box_num),
        pi_quantity: parseFloat(d.pi_quantity),
        pi_unit_price: parseFloat(d.pi_unit_price),
        pi_total_amount: parseFloat(d.pi_total_amount),
        ci_box_num: parseFloat(d.ci_box_num),
        ci_quantity: parseFloat(d.ci_quantity),
        ci_unit_price: parseFloat(d.ci_unit_price),
        ci_total_amount: parseFloat(d.ci_total_amount),
        ci_residual_amount: parseFloat(d.ci_residual_amount),
        deposit_exchange_rate: parseFloat(d.deposit_exchange_rate),
        residual_exchange_rate: parseFloat(d.residual_exchange_rate),
        rmb_deposit_amount: parseFloat(d.rmb_deposit_amount),
        rmb_residual_amount: parseFloat(d.rmb_residual_amount),
        tariff: parseFloat(d.tariff),
        vat: parseFloat(d.vat),
        prepayment_fee: parseFloat(d.prepayment_fee),
        residual_fee: parseFloat(d.residual_fee),
      }));

      // if (fileList.length > 0) {
      //   const res = await uploadFile('purchase_order', fileList);
      //   if (res.code !== 200) {
      //     message.error(res.message);
      //     return;
      //   }
      //   values.attachment = res.data;

      // }

      // if (fileParams.length > 0) {
      //   values.attachment = values.attachment || [];
      //   values.attachment.push(...fileParams);
      // }

      const res = await updatePurchaseOrderFutrues(values);
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }

     

      message.success('更新成功');
      fetchProductList(uuid);
      //  navigate('/purchase/order');
    } catch (error) {
      console.log('error', error);
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    // navigate('/purchase/order');
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
      key: 'tariff',
    },
    {
      title: '增值税',
      dataIndex: 'vat',
      key: 'vat',
    },
    {
      title: '缴费日期',
      dataIndex: 'payment_date',
      key: 'payment_date',
    },
    {
      title: '预付款手续费',
      dataIndex: 'prepayment_fee',
      key: 'prepayment_fee',
    },
    {
      title: '尾款手续费',
      dataIndex: 'residual_fee',
      key: 'residual_fee',
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
      key: 'other_certificate',
      title: '其它证件',
      value:  orderInfo?.other_certificate,
    },
  ];

  const handleDeleteCertificate = (key, filename, file_url) => {
    // const newCertificateDatas = certificateDatas.filter((item) => item.key !== key);
    //setCertificateDatas(newCertificateDatas);
    deletePurchaseOrderReceiptFile({ key, filename, file_url, order_no: uuid }).then((response) => {
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
        console.log('key:', key);

        // 使用 axios 上传文件和其他数据
        const response = await updatePurchaseOrderReceiptFile(formData);
        if (response.code === 200) {
          message.success('文件上传成功');
          fetchOrderDetail(uuid);
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
       let attachment = [];
       try {
        attachment = JSON.parse(text);
       } catch (error) {
        
       }


      

       
      
        return (
          <div>
            

            {attachment.length > 0 && (
            <div>
              {attachment.map((file, index) => (
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
                    onClick={() =>handleDeleteCertificate(record.key, file.name, file.url)}
                  >
                    删除
                  </Button>
                </div>
              ))}
            </div>
          )}

            <Upload
              beforeUpload={() => false} // 禁用自动上传
              fileList={fileList}
              onChange={({ fileList }) =>
                handleUploadCertificate(fileList, record.key)
              } // 文件选择后自动上传
            >
              <Button>上传证件</Button>
            </Upload>
          </div>
          
        );
      },
    },
  ];

  const columnsHeaderPaymentInfo = [
    {
      title: '产品名称',
      dataIndex: 'product_name',
      
    },
    {
      title: '重量',
      dataIndex: 'weight',
    },
    {
      title: '件数',
      dataIndex: 'box_num',
    },
    {
      title: '预付款时间',
      dataIndex: 'rmb_deposit_amount_time',
    },
    {
      title: '已付预付款金额',
      dataIndex: 'rmb_deposit_amount',
    },
    {
      title: '已付尾款时间',
      dataIndex: 'rmb_residual_amount_time',
    },
    {
      title: '已付尾款金额',
      dataIndex: 'rmb_residual_amount',
    },
    {
      title: '缴税时间',
      dataIndex: 'payment_date',
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
      title: '预付款手续费',
      dataIndex: 'prepayment_fee',
    },
    {
      title: '尾款手续费',
      dataIndex: 'residual_fee',
    },
    {
      title: '合计金额',
      dataIndex: 'total_amount',
    },
  ];




  const columnsDetailEdit: ProColumnType<TableFormOrderItem>[] = [
    {
      title: '产品名称',
      dataIndex: 'product_uuid',
      key: 'product_uuid',
      render: (text, record) =>
        productOptions.find((option) => option.uuid === text)?.name || text,

      renderFormItem: (_, { isEditable, onSelect, record }) => (
        <Button type="link" onClick={() => showEditProductRow(record)}>
          选择产品
        </Button>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku_code',
      key: 'sku_code',
      render: (text, record) => record.sku?.code,

      // 第一行不允许编辑
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '规格',
      dataIndex: 'sku_spec',
      key: 'sku_spec',
      render: (text, record) => record.sku?.specification,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '产品数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '产品价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '产品总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
    },
    {
      title: 'PI箱数',
      dataIndex: 'pi_box_num',
      key: 'pi_box_num',
    },
    {
      title: 'PI数量',
      dataIndex: 'pi_quantity',
      key: 'pi_quantity',
    },
    {
      title: 'PI单价',
      dataIndex: 'pi_unit_price',
      key: 'pi_unit_price',
    },
    {
      title: 'PI总金额',
      dataIndex: 'pi_total_amount',
      key: 'pi_total_amount',
    },
    {
      title: '柜号',
      dataIndex: 'cabinet_no',
      key: 'cabinet_no',
    },
    {
      title: '提单号',
      dataIndex: 'bill_of_lading_no',
      key: 'bill_of_lading_no',
    },
    {
      title: '船名',
      dataIndex: 'ship_name',
      key: 'ship_name',
    },
    {
      title: '航次',
      dataIndex: 'voyage',
      key: 'voyage',
    },
    {
      title: 'CI发票号',
      dataIndex: 'ci_invoice_no',
      key: 'ci_invoice_no',
    },
    {
      title: 'CI箱数',
      dataIndex: 'ci_box_num',
      key: 'ci_box_num',
    },
    {
      title: 'CI数量',
      dataIndex: 'ci_quantity',
      key: 'ci_quantity',
    },
    {
      title: 'CI单价',
      dataIndex: 'ci_unit_price',
      key: 'ci_unit_price',
    },
    {
      title: 'CI总金额',
      dataIndex: 'ci_total_amount',
      key: 'ci_total_amount',
    },
    {
      title: 'CI尾款金额',
      dataIndex: 'ci_residual_amount',
      key: 'ci_residual_amount',
    },
    {
      title: '生产日期',
      dataIndex: 'production_date',
      key: 'production_date',
    },
    {
      title: '预计到港日期',
      dataIndex: 'estimated_arrival_date',
      key: 'estimated_arrival_date',

      render: (text) => text || '-',
      renderFormItem: (item, { defaultRender, record }) => {
        return <Input type="date" />;
      },
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
      key: 'tariff',
    },
    {
      title: '增值税',
      dataIndex: 'vat',
      key: 'vat',
    },
    {
      title: '预付款手续费',
      dataIndex: 'prepayment_fee',
      key: 'prepayment_fee',
    },
    {
      title: '尾款手续费',
      dataIndex: 'residual_fee',
      key: 'residual_fee',
    },
    {
      title: '缴费日期',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (text) => text || '-',
      renderFormItem: (item, { defaultRender, record }) => {
        return <Input type="date" />;
      },
    },
    
    {
      title: '操作',
      key: 'operation',
      valueType: 'option',
      render: (_, record: TableFormOrderItem, index, action) => [
        <a key="edit" onClick={() => action?.startEditable(record.key)}>
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定删除?"
          onConfirm={() => handleDeleteDetail(record.key)}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  // useEffect(() => {
  //   // 检查 details 是否更新
  //   console.log('Current details:', details);
  // }, [details]);

  useEffect(() => {
    console.log('Editable row keys changed:', editableRowKeys);
    // 执行其他逻辑
  }, [editableRowKeys]);

  const itemTabs: TabsProps['items'] = [
    {
      key: '1',
      label: '采购单明细',
      children: (
        <Form form={form} component={false} labelCol={{ span: 2 }}>
          <Form.Item
            name="details"
            label="采购单明细"
            labelCol={{ span: 0 }}
            rules={[{ required: false, message: '请填写采购单明细' }]}
          >
            <EditableProTable<TableFormOrderItem>
              controlled={true}
              recordCreatorProps={{
                record: () => {
                  return {
                    key: `0${Date.now()}`,
                  };
                },
              }}
              value={details}
              columns={columnsDetailEdit}
              rowClassName="editable-row"
              pagination={false}
              onChange={setDetails}
              editable={{
                type: 'multiple',
                editableKeys: editableRowKeys,
                onSave: async (rowKey, data, row) => {
                  console.log(rowKey, data, row);
                  //   await waitTime(2000);
                },
                onChange: setEditableRowKeys,
              }}
              scroll={{ x: 'max-content' }}
              rowKey="key"
              // key={refreshKey}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleOk}>
              保存
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
              取消
            </Button>
          </Form.Item>
        </Form>
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
          dataSource={paymentInfoDatas}
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
        <ProDescriptions layout="vertical" bordered column={8}
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
          <ProDescriptions.Item label="接单时间" dataIndex="orders_date" editable={false}>
            {process_detail?.orders_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="签订合同时间" dataIndex="process_detail" editable={false} >
            -
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="预付款付汇时间"
            dataIndex="deposit_amount_time"
            editable={false}
          >
            {process_detail?.deposit_amount_time}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="尾款付汇时间" dataIndex="residual_amount_time" editable={false}>
            {process_detail?.residual_amount_time}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="收到副本时间" dataIndex="received_copy_time"  valueType="date">
            {process_detail?.received_copy_time}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="收单正本时间" dataIndex="received_original_time"  valueType="date">
            {process_detail?.received_original_time}
          </ProDescriptions.Item>
         { (is_customs_clearance ? 
          <ProDescriptions.Item label="海关放行时间" dataIndex="customs_clearance_time"  valueType="date">
            {process_detail?.customs_clearance_time}
          </ProDescriptions.Item> : 
          <ProDescriptions.Item label="海关放行时间" dataIndex="customs_clearance_time"  valueType="date" editable={false}>
            {process_detail?.customs_clearance_time}
          </ProDescriptions.Item>
          )
        }
          <ProDescriptions.Item label="入库时间" dataIndex="storage_time"  valueType="date">
            {process_detail?.storage_time}
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

        <Modal
          title="选择产品"
          open={showEditingRowProduct}
          onOk={handleEditProductRowOk}
          onCancel={handleEditProductRowCancel}
        >
          {' '}
          <Form
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item label="产品名称">
              <Select
                value={editingDetail?.product_uuid}
                onChange={(value) => handleDetailChange('product_uuid', value)}
              >
                {productOptions.map((product) => (
                  <Option key={product.uuid} value={product.uuid}>
                    {product.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="SKU/规格">
              <Select
                value={editingDetail?.sku_uuid}
                onChange={(value) => handleDetailChange('sku_uuid', value)}
              >
                {(skuOptions[editingDetail?.product_uuid] || []).map((sku) => (
                  <Option key={sku.uuid} value={sku.uuid}>
                    {renderSkuSelect(sku)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </Spin>
  );
};

export default PurchaseOrderDetail;
