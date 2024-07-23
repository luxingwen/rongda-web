import { getCustomerOptions } from '@/services/customer';
import { uploadFile } from '@/services/file';
import { getProductOptions, getProductSkuOptions } from '@/services/product';
import {
  addPurchaseOrderFutures,
  uploadImportFutruesExcel,
} from '@/services/purchase_order';
import { getSettlementCurrencyOptions } from '@/services/settlement_currency';
import { getStorehouseOptions } from '@/services/storehouse';
import { getSupplierOptions } from '@/services/supplier';
import {
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Upload,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  inputType,
  productOptions,
  skuOptions,
  setSkuOptions,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = React.useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  const handleProductChange = async (value) => {
    try {
      const response = await getProductSkuOptions({ uuid: value });
      if (response.code === 200) {
        setSkuOptions((prev) => ({
          ...prev,
          [dataIndex]: response.data,
        }));
        form.setFieldsValue({ sku_uuid: undefined });
      } else {
        message.error('获取SKU选项失败');
      }
    } catch (error) {
      message.error('获取SKU选项失败');
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        {dataIndex === 'product_uuid' ? (
          <Select
            ref={inputRef}
            onChange={(value) => {
              handleProductChange(value);
              form.setFieldsValue({ [dataIndex]: value });
              handleSave({ ...record, [dataIndex]: value });
            }}
            onBlur={save}
          >
            {productOptions.map((product) => (
              <Option key={product.uuid} value={product.uuid}>
                {product.name}
              </Option>
            ))}
          </Select>
        ) : dataIndex === 'sku_uuid' ? (
          <Select
            ref={inputRef}
            onChange={(value) => {
              form.setFieldsValue({ [dataIndex]: value });
              handleSave({ ...record, [dataIndex]: value });
            }}
            onBlur={save}
          >
            {(skuOptions[dataIndex] || []).map((sku) => (
              <Option key={sku.uuid} value={sku.uuid}>
                {sku.name}
              </Option>
            ))}
          </Select>
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const AddPurchaseOrder = () => {
  const [form] = Form.useForm();
  const [productOptions, setProductOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState({});
  const [details, setDetails] = useState([]);
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductOptions();
    fetchSupplierOptions();
    fetchSettlementCurrencyOptions();
    fetchStorehouseOptions();
    fetchCustomerOptions();
  }, []);

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
      const response = await uploadImportFutruesExcel(formData);
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
    const url = '/public/采购订单明细-期货-模板.xlsx';
    const link = document.createElement('a');
    link.href = url;
    link.download = '采购订单明细-期货-模板.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      }));

      if (fileList.length > 0) {
        const res = await uploadFile('purchase_order', fileList);
        if (res.code !== 200) {
          message.error(res.message);
          return;
        }
        values.attachment = res.data;
      }

      const res = await addPurchaseOrderFutures(values);
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

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'product_uuid',
      render: (text, record) =>
        productOptions.find((option) => option.uuid === text)?.name || text,
    },
    {
      title: 'SKU/规格',
      dataIndex: 'sku_uuid',
      render: (text, record) => renderSkuTable(record),
    },
    {
      title: '产品数量',
      dataIndex: 'quantity',
      editable: true,
    },
    {
      title: '产品价格',
      dataIndex: 'price',
      editable: true,
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
      title: '生产日期',
      dataIndex: 'production_date',
    },
    {
      title: '预计到港日期',
      dataIndex: 'estimated_arrival_date',
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
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEditDetail(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => handleDeleteDetail(record.key)}
          >
            <Button type="link">删除</Button>
          </Popconfirm>
        </>
      ),
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
          name="pi_agreement_no"
          label="PI合同号"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: 'PI合同号' }]}
        >
          <Input />
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
          name="departure"
          label="起运地"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请输入起运地' }]}
        >
          <Input />
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
          name="estimated_shipping_date"
          label="预计装船日期"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请输入预计装船日期' }]}
        >
          <Input type="date" />
        </Form.Item>
        <Form.Item
          name="estimated_warehouse"
          label="预计入库仓库"
          wrapperCol={{ span: 6 }}
          rules={[{ required: true, message: '请输入预计入库仓库' }]}
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

          <Table
            components={{
              body: {
                row: EditableRow,
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={details}
            columns={columns}
            rowClassName="editable-row"
            pagination={false}
            scroll={{ x: 'max-content' }}
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
            <Form.Item label="PI箱数">
              <Input
                type="number"
                value={editingDetail?.pi_box_num}
                onChange={(e) =>
                  handleDetailChange('pi_box_num', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="PI数量">
              <Input
                type="number"
                value={editingDetail?.pi_quantity}
                onChange={(e) =>
                  handleDetailChange('pi_quantity', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="PI单价">
              <Input
                type="number"
                value={editingDetail?.pi_unit_price}
                onChange={(e) =>
                  handleDetailChange('pi_unit_price', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="PI总金额">
              <Input
                type="number"
                value={editingDetail?.pi_total_amount}
                onChange={(e) =>
                  handleDetailChange('pi_total_amount', e.target.value)
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
            <Form.Item label="提单号">
              <Input
                value={editingDetail?.bill_of_lading_no}
                onChange={(e) =>
                  handleDetailChange('bill_of_lading_no', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="船名">
              <Input
                value={editingDetail?.ship_name}
                onChange={(e) =>
                  handleDetailChange('ship_name', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="航次">
              <Input
                value={editingDetail?.voyage}
                onChange={(e) => handleDetailChange('voyage', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="CI发票号">
              <Input
                value={editingDetail?.ci_invoice_no}
                onChange={(e) =>
                  handleDetailChange('ci_invoice_no', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="CI箱数">
              <Input
                type="number"
                value={editingDetail?.ci_box_num}
                onChange={(e) =>
                  handleDetailChange('ci_box_num', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="CI数量">
              <Input
                type="number"
                value={editingDetail?.ci_quantity}
                onChange={(e) =>
                  handleDetailChange('ci_quantity', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="CI单价">
              <Input
                type="number"
                value={editingDetail?.ci_unit_price}
                onChange={(e) =>
                  handleDetailChange('ci_unit_price', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="CI总金额">
              <Input
                type="number"
                value={editingDetail?.ci_total_amount}
                onChange={(e) =>
                  handleDetailChange('ci_total_amount', e.target.value)
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
            <Form.Item label="预计到港日期">
              <Input
                value={editingDetail?.estimated_arrival_date}
                type="date"
                onChange={(e) =>
                  handleDetailChange('estimated_arrival_date', e.target.value)
                }
              />
            </Form.Item>
            <Form.Item label="关税">
              <Input
                type="number"
                value={editingDetail?.tariff}
                onChange={(e) => handleDetailChange('tariff', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="增值税">
              <Input
                type="number"
                value={editingDetail?.vat}
                onChange={(e) => handleDetailChange('vat', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="缴费日期">
              <Input
                value={editingDetail?.payment_date}
                type="date"
                onChange={(e) =>
                  handleDetailChange('payment_date', e.target.value)
                }
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
      </Form>
    </PageContainer>
  );
};

export default AddPurchaseOrder;