import { getCustomerOptions } from '@/services/customer';
import { deleteFile, uploadFile } from '@/services/file';
import { getProductOptions, getProductSkuOptions } from '@/services/product';
import {
  getPurchaseOrderProductList,
  getPurchaseOrdersInfo,
  updatePurchaseOrderSpot,
  uploadImportSpotExcel,
} from '@/services/purchase_order';
import { getSettlementCurrencyOptions } from '@/services/settlement_currency';
import { getStorehouseOptions } from '@/services/storehouse';
import { getSupplierOptions } from '@/services/supplier';
import {
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ProColumnType } from '@ant-design/pro-components';
import { EditableProTable, PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Upload,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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

const { Option } = Select;
const EditableContext = React.createContext(null);

const AddPurchaseOrder = () => {
  const { uuid } = useParams();
  const [form] = Form.useForm();
  const [productOptions, setProductOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState({});
  const [details, setDetails] = useState<readonly TableFormOrderItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [settlementCurrencyOptions, setSettlementCurrencyOptions] = useState(
    [],
  );
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [importExcelFileList, setImportExcelFileList] = useState([]);
  const [importExcelModalVisible, setImportExcelModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState({});
  const [fileParams, setFileParams] = useState([]);
  const [productList, setProductList] = useState([]);
  const navigate = useNavigate();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [showEditingRowProduct, setShowEditingRowProduct] =
    useState<boolean>(false);

  useEffect(() => {
    fetchProductOptions();
    fetchSupplierOptions();
    fetchSettlementCurrencyOptions();
    fetchStorehouseOptions();
    fetchCustomerOptions();
    fetchOrderDetail(uuid);
    fetchProductList(uuid);
  }, [uuid]);

  const showEditProductRow = (record: TableFormOrderItem) => {
    setShowEditingRowProduct(true);

    console.log('record', record);
    console.log('details', details);
    handleProductChange(record.product_uuid);
    setEditingDetail({ ...record });
  };

  const handleEditProductRowCancel = () => {
    setShowEditingRowProduct(false);
  };

  const handleEditProductRowChange = (value: string) => {};

  const handleEditProductRowOk = () => {
    const sku = skuOptions[editingDetail.product_uuid]?.find(
      (item) => item.uuid === editingDetail.sku_uuid,
    );

    const product = productOptions.find(
      (item) => item.uuid === editingDetail.product_uuid,
    );

    const index = details.findIndex((item) => item.key === editingDetail.key);

    if (index === -1) {
      // Adding a new item
      const newDetail = {
        ...editingDetail,
        product: product,
        sku: sku,
        key: `0${Date.now()}`,
      };
      setDetails((prevDetails) => [...prevDetails, newDetail]);
      setShowEditingRowProduct(false);
      return;
    }

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

  const fetchOrderDetail = async (uuid) => {
    try {
      const response = await getPurchaseOrdersInfo({ uuid });
      if (response.code === 200) {
        response.data.attachments = [];
        // 如果有附件，处理附件的展示

        if (response.data.attachment) {
          let attachment = JSON.parse(response.data.attachment);
          setFileParams(attachment);
        }

        setOrderInfo(response.data);
        form.setFieldsValue({
          title: response.data.title,
          customer_uuid: response.data.customer_uuid,
          supplier_uuid: response.data.supplier_uuid,
          date: response.data.date,
          pi_agreement_no: response.data.pi_agreement_no,
          order_currency: response.data.order_currency,
          settlement_currency: response.data.settlement_currency,
          departure: response.data.departure,
          deposit_amount: response.data.deposit_amount,
          deposit_ratio: response.data.deposit_ratio,
          estimated_shipping_date: response.data.estimated_shipping_date,
          estimated_warehouse: response.data.estimated_warehouse,
          actual_warehouse: response.data.actual_warehouse,
        });
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
        const detailList = response.data.map((item, index) => ({
          ...item,
          key: index,
        }));
        console.log('detailList', detailList);
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

  const showImportExcelModal = () => {
    setImportExcelModalVisible(true);
  };

  const handleImportExcelChange = (info) => {
    let fileList = [...info.fileList];

    // 只保留最新上传的一个文件
    fileList = fileList.slice(-1);

    setImportExcelFileList(fileList);
  };

  const handleImportExcelCancel = () => {
    setImportExcelModalVisible(false);
    setImportExcelFileList([]);
  };

  const handleImportExcelOk = async () => {
    if (importExcelFileList.length === 0) {
      message.error('请上传文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', importExcelFileList[0].originFileObj);

    try {
      const response = await uploadImportSpotExcel(formData);
      if (response.code !== 200) {
        message.error('上传失败:' + response.message);
        return;
      }

      response.data.forEach((item, index) => {
        // 获取sku 是否存在
        const issku =
          skuOptions[item.product_uuid] === undefined ? false : true;
        if (!issku) {
          handleProductChange(item.product_uuid);
        }
      });

      setDetails(response.data);

      message.success('导入成功');
      setImportExcelModalVisible(false);
      //navigate('/purchase/order');
    } catch (error) {
      message.error('导入失败');
    }
  };

  const downloadTemplate = () => {
    // 模板下载链接，可以是一个存放模板的静态文件链接
    const url = '/public/采购订单明细-现货-模板.xlsx';
    const link = document.createElement('a');
    link.href = url;
    link.download = '采购订单明细-现货-模板.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const fetchSettlementCurrencyOptions = async () => {
    try {
      const response = await getSettlementCurrencyOptions();
      if (response.code === 200) {
        setSettlementCurrencyOptions(response.data);
      } else {
        message.error('获取结算币种选项失败');
      }
    } catch (error) {
      message.error('获取结算币种选项失败');
    }
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
        tariff: parseFloat(d.tariff),
        vat: parseFloat(d.vat),
        box_num: parseFloat(d.box_num),
      }));

      if (fileList.length > 0) {
        const res = await uploadFile('purchase_order', fileList);
        if (res.code !== 200) {
          message.error(res.message);
          return;
        }
        values.attachment = res.data;
      }

      const res = await updatePurchaseOrderSpot(values);
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('添加成功');
      navigate('/purchase/order');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    navigate('/purchase/order');
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleAddDetail = () => {
    setEditingDetail({
      key: details.length,
      product_uuid: '',
      sku_uuid: '',
      product_name: '',
      sku_name: '',
      quantity: 0,
      price: 0,
      total_amount: 0,
      box_num: 0,
      pi_box_num: 0,
      pi_quantity: 0,
      pi_unit_price: 0,
      pi_total_amount: 0,
      cabinet_no: '',
      bill_of_lading_no: '',
      ship_name: '',
      voyage: '',
      ci_invoice_no: '',
      ci_box_num: 0,
      ci_quantity: 0,
      ci_unit_price: 0,
      ci_total_amount: 0,
      production_date: '',
      estimated_arrival_date: '',
      tariff: 0,
      vat: 0,
      payment_date: '',
    });
    setIsModalVisible(true);
  };

  const handleEditDetail = (record) => {
    setEditingDetail({ ...record });
    setIsModalVisible(true);
  };

  const handleDeleteDetail = (key) => {
    setDetails(details.filter((item) => item.key !== key));
  };

  const handleModalOk = () => {
    if (editingDetail.key === details.length) {
      setDetails([...details, editingDetail]);
    } else {
      setDetails(
        details.map((item) =>
          item.key === editingDetail.key ? editingDetail : item,
        ),
      );
    }
    setIsModalVisible(false);
    setEditingDetail(null);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingDetail(null);
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

  const renderSkuTable = (record) => {
    const list = skuOptions[record.product_uuid] || [];
    const sku = list.find((option) => option.uuid === record.sku_uuid);
    if (sku) {
      return renderSkuSelect(sku);
    }
    return record.sku_uuid;
  };

  const handleRemove = (file) => {
    setFileList((prevFileList) =>
      prevFileList.filter((item) => item.uid !== file.uid),
    );
  };

  const handleRemoveFileParams = async (index) => {
    const newFileParams = [...fileParams];
    const file = newFileParams[index];
    if (file.url) {
      try {
        const res = await deleteFile({ filename: file.url });
        if (res.code === 200) {
          message.success('删除成功');
        } else {
          message.error('删除失败');
        }
      } catch (error) {
        message.error('删除失败');
      }
    }
    newFileParams.splice(index, 1);
    setFileParams(newFileParams);
  };

  const columns: ProColumnType<TableFormOrderItem>[] = [
    {
      title: '产品名称',
      dataIndex: 'product_uuid',
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
      render: (text, record) => record.sku?.code,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '规格',
      dataIndex: 'sku_spec',
      render: (text, record) => record.sku?.specification,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '产品数量',
      dataIndex: 'quantity',
    },
    {
      title: '箱数',
      dataIndex: 'box_num',
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
      title: '柜号',
      dataIndex: 'cabinet_no',
    },

    {
      title: '生产日期',
      dataIndex: 'production_date',
    },
    {
      title: '备注',
      dataIndex: 'desc',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      valueType: 'option',
      render: (_, record: TableFormOrderItem, index, action) => [
        <a key="edit" onClick={() => action?.startEditable(record.key)}>
          编辑
        </a>,
        <span key="divider" style={{ margin: '0 8px' }}>
          |
        </span>,
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

  return (
    <PageContainer>
      <Form form={form} component={false} labelCol={{ span: 2 }}>
        <Form.Item
          name="title"
          label="标题"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="customer_uuid"
          label="客户名称"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请选择客户' }]}
        >
          <Select placeholder="请选择客户">
            {customerOptions.map((customer) => (
              <Option key={customer.uuid} value={customer.uuid}>
                {customer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="supplier_uuid"
          label="供应商"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请选择供应商' }]}
        >
          <Select placeholder="请选择供应商">
            {supplierOptions.map((supplier) => (
              <Option key={supplier.uuid} value={supplier.uuid}>
                {supplier.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 6 }} name="date" label="采购日期">
          <Input type="date" />
        </Form.Item>

        <Form.Item
          name="order_currency"
          label="订单币种"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请输入订单币种' }]}
        >
          <Select>
            {settlementCurrencyOptions.map((currency) => (
              <Option key={currency.uuid} value={currency.uuid}>
                {currency.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="settlement_currency"
          label="结算币种"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请输入结算币种' }]}
        >
          <Select>
            {settlementCurrencyOptions.map((currency) => (
              <Option key={currency.uuid} value={currency.uuid}>
                {currency.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="deposit_amount"
          label="定金金额"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请输入定金金额' }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          name="deposit_ratio"
          label="定金比例"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请输入定金比例' }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="actual_warehouse"
          label="入库仓库"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请输入入库仓库' }]}
        >
          <Select>
            {storehouseOptions.map((storehouse) => (
              <Option key={storehouse.uuid} value={storehouse.uuid}>
                {storehouse.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="attachment" label="附件">
          <Upload
            multiple
            fileList={fileList}
            onChange={handleFileChange}
            itemRender={(originNode, file) => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {originNode}
              </div>
            )}
          >
            <Button icon={<UploadOutlined />}>上传附件</Button>
          </Upload>
          {fileParams.length > 0 && (
            <div>
              {fileParams.map((file, index) => (
                <div key={index} className="file-item">
                  <span>{file.name}</span>
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
        </Form.Item>

        <Form.Item
          name="details"
          label="采购单明细"
          labelCol={{ span: 0 }}
          rules={[{ required: false, message: '请填写采购单明细' }]}
        >
          <Button
            onClick={handleAddDetail}
            type="primary"
            style={{ marginBottom: 16 }}
            icon={<PlusOutlined />}
          >
            添加明细
          </Button>
          <Button
            onClick={showImportExcelModal}
            style={{ marginLeft: '20px', color: 'green' }}
          >
            从Excel文件导入
          </Button>
          <EditableProTable<TableFormOrderItem>
            recordCreatorProps={{
              record: () => {
                return {
                  key: `0${Date.now()}`,
                  product_uuid: '',
                  sku_uuid: '',
                };
              },
            }}
            value={details}
            columns={columns}
            rowClassName="editable-row"
            pagination={false}
            onChange={setDetails}
            editable={{
              type: 'multiple',
              editableKeys,
              onSave: async (rowKey, data, row) => {
                console.log(rowKey, data, row);
                //   await waitTime(2000);
              },
              onChange: setEditableRowKeys,
            }}
            scroll={{ x: 'max-content' }}
            rowKey="key"
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
        <Modal
          title="编辑明细"
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
        >
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

            <Form.Item label="产品数量">
              <Input
                type="number"
                value={editingDetail?.quantity}
                onChange={(e) => handleDetailChange('quantity', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="箱数">
              <Input
                type="number"
                value={editingDetail?.box_num}
                onChange={(e) => handleDetailChange('box_num', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="产品价格">
              <Input
                type="number"
                value={editingDetail?.price}
                onChange={(e) => handleDetailChange('price', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="产品总金额">
              <Input
                type="number"
                value={editingDetail?.total_amount}
                onChange={(e) =>
                  handleDetailChange('total_amount', e.target.value)
                }
              />
            </Form.Item>

            <Form.Item label="柜号">
              <Input
                value={editingDetail?.cabinet_no}
                onChange={(e) =>
                  handleDetailChange('cabinet_no', e.target.value)
                }
              />
            </Form.Item>

            <Form.Item label="生产日期">
              <Input
                value={editingDetail?.production_date}
                onChange={(e) =>
                  handleDetailChange('production_date', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="描述">
              <Input
                value={editingDetail?.desc}
                onChange={(e) => handleDetailChange('desc', e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          width={200}
          title="导入Excel文件"
          visible={importExcelModalVisible}
          onOk={handleImportExcelOk}
          onCancel={handleImportExcelCancel}
        >
          <Upload
            accept=".xlsx"
            fileList={importExcelFileList}
            beforeUpload={() => false} // 阻止默认的上传行为，改为手动上传
            onChange={handleImportExcelChange}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
          <Button
            icon={<DownloadOutlined />}
            style={{ marginTop: 16 }}
            onClick={downloadTemplate}
          >
            下载模板
          </Button>
        </Modal>

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
      </Form>
    </PageContainer>
  );
};

export default AddPurchaseOrder;
