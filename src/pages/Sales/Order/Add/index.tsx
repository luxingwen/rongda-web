import { getCustomerOptions } from '@/services/customer';
import { getProductOptions, getProductSkuOptions } from '@/services/product';
import {
  getPurchaseOrderProductList,
  getPurchaseOrdersByStatus,
  getPurchaseOrdersInfo,
} from '@/services/purchase_order';
import {
  addSalesOrder,
  getSalesOrderDetail,
  getSalesOrderProductList,
  updateSalesOrder,
} from '@/services/sales_order';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Popconfirm,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditableProTable, PageContainer } from '@ant-design/pro-components';
import { getSettlementCurrencyOptions } from '@/services/settlement_currency';

const { Option } = Select;

const SalesOrderForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { purchaseOrderId } = useParams();
  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [purchaseOrderProductList, setPurchaseOrderProductList] = useState([]);
  const [purchaseOrderOptions, setPurchaseOrderOptions] = useState([]);
  const [productForm] = Form.useForm();
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState(null);
  const [details, setDetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [currentEditRow, setCurrentEditRow] = useState(null);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  useEffect(() => {
    fetchProductOptions();
    fetchCustomerOptions();
    fetchPurchaseOrderOptions();
    fetchSettlementCurrencyOptions();
  }, []);


  
  const fetchSettlementCurrencyOptions = async () => {
    try {
      const response = await getSettlementCurrencyOptions();
      if (response.code === 200) {
        setCurrencyOptions(response.data);
      } else {
        message.error('获取结算币种失败');
      }
    } catch (error) {
      message.error('获取结算币种失败');
    }
  };


  const fetchPurchaseOrderOptions = async () => {
    const response = await getPurchaseOrdersByStatus({ status_list: ['待处理', '处理中', '已处理', '已审核',  '已完成', '已入库'] });
    if (response.code === 200) {
      setPurchaseOrderOptions(response.data);
      if (purchaseOrderId && purchaseOrderId !== 'new') {
        form.setFieldsValue({ purchase_order_no: purchaseOrderId });
        const currentOrder = response.data.find(order => order.order_no === purchaseOrderId);
    
        form.setFieldsValue({ customer_uuid: currentOrder.customer_uuid });
        fetchPurchaseOrderInfo(purchaseOrderId);
      }
        
    } else {
      message.error('获取采购单选项失败');
    }
  };

  const fetchProductOptions = async () => {
    const response = await getProductOptions();
    if (response.code === 200) {
      setProductOptions(response.data);
    } else {
      message.error('获取产品选项失败');
    }
  };

  const fetchCustomerOptions = async () => {
    const response = await getCustomerOptions();
    if (response.code === 200) {
      setCustomerOptions(response.data);
    } else {
      message.error('获取客户选项失败');
    }
  };

  const handlePuchaseOrderChange = (value) => {
    const currentOrder = purchaseOrderOptions.find(order => order.order_no === value);
    if (currentOrder) {
      form.setFieldsValue({ customer_uuid: currentOrder.customer_uuid });
      fetchPurchaseOrderInfo(value);
    }
  };

  let currentPurchaseOrderInfo = null;

  const fetchPurchaseOrderInfo = async (uuid) => {
    const response = await getPurchaseOrdersInfo({ uuid });
    if (response.code === 200) {
      console.log("response.data 00 ", response.data);
      currentPurchaseOrderInfo = response.data;
      setCurrentPurchaseOrder((pre) => {
        return response.data;
      });
      fetchPurchaseOrderProductList(response.data.order_no, true);
      productForm.setFieldsValue({
        customer_name: response.data.customer_info?.name,
      });
    } else {
      message.error('获取订单详情失败');
    }
  };

  const fetchPurchaseOrderInfo2 = async (uuid) => {
    const response = await getPurchaseOrdersInfo({ uuid });
    if (response.code === 200) {
      currentPurchaseOrderInfo = response.data;
      setCurrentPurchaseOrder((pre) => {
        return response.data;
      });
     
    } else {
      message.error('获取订单详情失败');
    }
  };

  const fetchPurchaseOrderProductList = async (orderNo, isDetailData) => {
    const response = await getPurchaseOrderProductList({ uuid: orderNo });
    if (response.code === 200) {
      setPurchaseOrderProductList(response.data);
      const isFutureOrder = currentPurchaseOrderInfo?.order_type === '1';
      const productList = response.data.map(item => ({
        ...item,
        key: item.purchase_order_product_no,
        box_num: isFutureOrder? item.ci_box_num : item.box_num,
        quantity: isFutureOrder? item.ci_quantity : item.quantity,
      }));
      if (isDetailData) {
        setDetails(productList);
      }
    } else {
      message.error('获取采购单商品列表失败');
    }
  };

  const fetchSalesOrderDetail = async (uuid) => {
    const response = await getSalesOrderDetail({ uuid });
    if (response.code === 200) {
      setEditingOrder(response.data);
      fetchPurchaseOrderInfo2(response.data.purchase_order_no);
      fetchPurchaseOrderProductList(response.data.purchase_order_no, false);
      form.setFieldsValue(response.data);
      fetchSalesOrderProductList(uuid);
    } else {
      message.error('获取订单详情失败');
    }
  };

  const fetchSalesOrderProductList = async (uuid) => {
    const response = await getSalesOrderProductList({ uuid });
    if (response.code === 200) {
      const list = response.data.map((item, index) => ({
        ...item,
        key: index + 1,
        quantity: item.product_quantity,
        amount: item.product_amount,
        price: item.product_price,

      }));
      setDetails(list);
    } else {
      message.error('获取订单商品列表失败');
    }
  };

  const handleProductChange = async (productUuid, index) => {
    const response = await getProductSkuOptions({ uuid: productUuid });
    if (response.code === 200) {
      const newSkuOptions = [...skuOptions];
      newSkuOptions[index] = response.data;
      setSkuOptions(newSkuOptions);
      form.setFieldsValue({
        product_list: form.getFieldValue('product_list').map((item, i) =>
          i === index ? { ...item, sku_uuid: undefined } : item
        ),
      });
    } else {
      message.error('获取SKU选项失败');
    }
  };

  const handleSubmit = async (values) => {
    try {

      values.deposit = parseFloat(values.deposit_amount);
      values.order_amount = parseFloat(values.order_amount);
      values.final_payment_amount = parseFloat(values.final_payment_amount);
      values.deposit_ratio = parseFloat(values.deposit_ratio);


      console.log("value details", values.details);

      values.product_list = details.map(item => ({
        ...item,
        product_quantity: parseFloat(item.quantity),
        product_price: parseFloat(item.price),
        product_amount: parseFloat(item.amount),
        box_num: parseFloat(item.box_num),
      }));

      console.log("details", details);
      console.log("product_list", values.product_list);

      if (currentPurchaseOrder) {
        values.purchase_order_no = currentPurchaseOrder.order_no;
        values.entrust_order_id = currentPurchaseOrder.entrust_order_id;
      }

      if (editingOrder) {
        const res = await updateSalesOrder({ ...editingOrder, ...values });
        if (res.code === 200) {
          message.success('更新成功');
          navigate('/sales/order');
        } else {
          message.error('更新失败');
        }
      } else {
        const res = await addSalesOrder(values);
        if (res.code === 200) {
          message.success('添加成功');
          navigate('/sales/order');
        } else {
          message.error('添加失败,' + res.message);
        }
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const renderProductName = (uuid) => {
    const product = purchaseOrderProductList.find(product => product.product_uuid === uuid);
    return product?.product?.name;
  };

  const handleAddDetail = () => {
    setModalVisible(true);
    setIsEdit(false);
  };

  const handleSelectCurrentProduct = async (value) => {
    const currentProduct = purchaseOrderProductList.find(product => product.purchase_order_product_no === value);
    setCurrentProduct(currentProduct);
    const isFutureOrder = currentPurchaseOrder?.order_type === '1';
    productForm.setFieldsValue({
      sku_uuid: currentProduct.sku_uuid,
      sku_code: currentProduct.sku?.code,
      sku_spec: currentProduct.sku?.specification,
      country: currentProduct.sku?.country,
      factory_no: currentProduct.sku?.factory_no,
      quantity: isFutureOrder? currentProduct.ci_quantity : currentProduct.quantity,
      box_num: isFutureOrder? currentProduct.ci_box_num : currentProduct.box_num,
      cabinet_no: currentProduct.cabinet_no,
    });
  };

  const handleProductSubmit = () => {
    const isFutureOrder = currentPurchaseOrder?.order_type === '1';
    productForm.validateFields()
      .then(values => {
        const originData = purchaseOrderProductList.find(item => item.purchase_order_product_no === values.purchase_order_product_no);

        const quantity = isFutureOrder? originData.ci_quantity : originData.quantity;
        const box_num = isFutureOrder? originData.ci_box_num : originData.box_num;

        if (originData && quantity < parseFloat(values.quantity)) {
          message.error('数量不能大于采购数量 ' + quantity);
          return;
        }
        if (originData && box_num < parseFloat(values.box_num)) {
          message.error('箱数不能大于采购箱数 ' + box_num);
          return;
        }
        if (isEdit) {
          const updatedDetailData = details.map(item =>
            item.product_uuid === values.product_uuid ? { ...item, ...values } : item
          );
          setDetails(updatedDetailData);
        } else {
          if (details.some(item => item.purchase_order_product_no === values.purchase_order_product_no)) {
            message.error('商品已存在');
            return;
          }
          values.key = details.length + 1;
          originData.key = values.key;
          originData.quantity = parseFloat(values.quantity);
          originData.box_num = parseFloat(values.box_num);
          setDetails([...details, { ...originData }]);
        }
        setModalVisible(false);
        productForm.resetFields();
      })
      .catch(info => {
        message.error('验证失败');
      });
  };

  const handleEditDetail = (record) => {
    setSelectedProduct(record);
    setModalVisible(true);
    setIsEdit(true);
    productForm.setFieldsValue(record);
  };

  const handleDeleteDetail = (key) => {
    setDetails(details.filter(item => item.key !== key));
  };

  const handleSave = (row) => {
    const newData = [...details];
    const index = newData.findIndex(item => row.key === item.key);
    if (index > -1) {
      const item = newData[index];
      const updatedRecord = { ...item, ...row };
      newData.splice(index, 1, updatedRecord);
      setDetails(newData);
    } else {
      newData.push(row);
      setDetails(newData);
    }
  };

  const detailColumns = [
    {
      title: '商品名称',
      dataIndex: 'product_uuid',
      key: 'product_uuid',
      render: renderProductName,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: 'SKU代码',
      dataIndex: 'sku_code',
      key: 'sku_code',
      render: (_, record) => record.sku?.code,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '规格',
      dataIndex: 'sku_spec',
      key: 'sku_spec',
      render: (_, record) => record.sku?.specification,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      render: (_, record) => record.sku?.country,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '厂号',
      dataIndex: 'factory_no',
      key: 'factory_no',
      render: (_, record) => record.sku?.factory_no,
      editable: (text, record, index) => {
        return false;
      },
    },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no',
      editable: (text, record, index) => {
        return false;
      },
     },
    { title: '发票号', dataIndex: 'invoice_no', key: 'invoice_no',
      editable: (text, record, index) => {
        return false;
      },
     },
    { title: '合同号', dataIndex: 'contract_no', key: 'contract_no',
      editable: (text, record, index) => {
        return false;
      },
     },
    {
      title: '商品数量',
      dataIndex: 'quantity',
      key: 'quantity',
      editable: true,
      renderFormItem: (_, { record }, form) => {
        const originData = purchaseOrderProductList.find(
          (item) => item.purchase_order_product_no === record.purchase_order_product_no
        );
        return (
          <Form.Item
            // 使用record.key确保唯一性
            noStyle
            name={[record.key, 'quantity']}
            rules={[
              { required: true, message: '请输入商品数量' },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(new Error('数量不能为空'));
                  }
                
                  const isFutureOrder = currentPurchaseOrder?.order_type === '1';

                  const num = isFutureOrder? originData.ci_quantity : originData.quantity;

                  console.log("originData quantity", originData.quantity);
                  console.log("value", value);

                  if (originData && parseFloat(value) > num) {
                    console.log("originData.quantity 111", num);
                    return Promise.reject('数量不能大于采购数量' + num);
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number"  defaultValue={record.quantity}  onChange={(e) => {
              // 当输入改变时，手动触发表格数据更新
              const newQuantity = parseFloat(e.target.value);
              record.quantity = newQuantity;
              setCurrentEditRow(record);
              if (record.quantity <= originData.quantity) {

                
                form.setFieldsValue({
                  [record.key]: {
                    ...record,
                    quantity: newQuantity >= 0 ? newQuantity : 0, // 防止负数
                  },
                });
             }
            }} />
          </Form.Item>
        );
      },
    },
    
    {
      title: '商品箱数',
      dataIndex: 'box_num',
      key: 'box_num',
      renderFormItem: (_, { record }, form) => {
        const originData = purchaseOrderProductList.find(
          (item) => item.purchase_order_product_no === record.purchase_order_product_no
        );
        return (
          <Form.Item
            // 使用record.key确保唯一性
            noStyle
            name={[record.key, 'box_num']}
            rules={[
              { required: true, message: '请输入商品数量' },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(new Error('数量不能为空'));
                  }
                  
                  const isFutureOrder = currentPurchaseOrder?.order_type === '1';
                  const num = isFutureOrder? originData.ci_box_num : originData.box_num;

                  if (originData && parseFloat(value) > num) {
                    console.log("originData.quantity 111", num);
                    return Promise.reject('数量不能大于采购箱数' + num);
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number"  defaultValue={record.box_num}  onChange={(e) => {
              // 当输入改变时，手动触发表格数据更新
              const val = parseFloat(e.target.value);
              record.box_num = val;
              setCurrentEditRow(record);
              if (record.box_num <= originData.box_num) {

              
          
                form.setFieldsValue({
                  [record.key]: {
                    ...record,
                    box_num: val >= 0 ? val : 0, // 防止负数
                  },
                });
             }
            }} />
          </Form.Item>
        );
      },
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      renderFormItem: (_, { record }, form) => {
        const originData = purchaseOrderProductList.find(
          (item) => item.purchase_order_product_no === record.purchase_order_product_no
        );
        return (
          <Form.Item
            // 使用record.key确保唯一性
            noStyle
            name={[record.key, 'price']}
            rules={[
              { required: true, message: '请输入商品单价' },
            ]}
          >
            <Input type="number"  defaultValue={record.price}  onChange={(e) => {
              // 当输入改变时，手动触发表格数据更新
              const val = parseFloat(e.target.value);
              record.price = val;
              setCurrentEditRow(record);
                form.setFieldsValue({
                  [record.key]: {
                    ...record,
                    price: val >= 0 ? val : 0, // 防止负数
                  },
                });
             
            }} />
          </Form.Item>
        );
      },
    },
    {
      title: '总价',
      dataIndex: 'amount',
      key: 'amount',
      renderFormItem: (_, { record }, form) => {
        const originData = purchaseOrderProductList.find(
          (item) => item.purchase_order_product_no === record.purchase_order_product_no
        );
        return (
          <Form.Item
            // 使用record.key确保唯一性
            noStyle
            name={[record.key, 'amount']}
            rules={[
              { required: true, message: '请输入总价' },
            ]}
          >
            <Input type="number"  defaultValue={record.amount}  onChange={(e) => {
              // 当输入改变时，手动触发表格数据更新
              const val = parseFloat(e.target.value);
              record.amount = val;
              setCurrentEditRow(record);
                form.setFieldsValue({
                  [record.key]: {
                    ...record,
                    amount: val >= 0 ? val : 0, // 防止负数
                  },
                });
             
            }} />
          </Form.Item>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      render: (_, record, index, action) => [
        <a key="edit" onClick={() => {
          setCurrentEditRow(record);
          action?.startEditable(record.key)}}>
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
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入订单标题' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="order_type" label="订单类型" initialValue="1" rules={[{ required: true, message: '请选择订单类型' }]}>
        <Select placeholder="请选择订单类型">
          <Option value="1">期货订单</Option>
          <Option value="2">现货订单</Option>
        </Select>
      </Form.Item>
      <Form.Item name="order_date" label="订单日期" rules={[{ required: true, message: '请输入订单日期' }]}>
        <Input type="date" />
      </Form.Item>
      <Form.Item
      initialValue={purchaseOrderId}
      name="purchase_order_no" label="采购订单" rules={[{ required: true, message: '请选择采购订单' }]}>
        <Select 
        showSearch allowClear mode="combobox" onChange={handlePuchaseOrderChange} filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        } placeholder="请选择采购订单">
          {purchaseOrderOptions.map(order => (
            <Option key={order.order_no} value={order.order_no}>
              {order.title} - {order.order_no}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="customer_uuid" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
        <Select placeholder="请选择客户">
          {customerOptions.map(customer => (
            <Option key={customer.uuid} value={customer.uuid}>
              {customer.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="order_amount" label="订单金额" rules={[{ required: true, message: '请输入订单金额' }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name="deposit_amount" label="定金" rules={[{ required: true, message: '请输入定金' }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name="deposit_ratio" label="定金比例" rules={[{ required: true, message: '请输入定金比例' }]}>
        <Input type="number" />
      </Form.Item>
      <Form.Item name="final_payment_amount" label="尾款金额" rules={[{ required: true, message: '请输入尾款金额' }]}>
        <Input type="number" />
      </Form.Item>
   
      <Form.Item
            name="settlement_currency"
            label="结算币种"
            rules={[{ required: true, message: '请选择结算币种' }]}
          >
            <Select>
              {currencyOptions.map((currency) => (
                <Option key={currency.uuid} value={currency.uuid}>
                  {currency.name}
                </Option>
              ))}
            </Select>
      </Form.Item>
      <Form.Item name="remarks" label="备注">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item name="details" label="商品明细" rules={[{ required: false, message: '请填写商品明细' }]}>
        <Button type="dashed" onClick={handleAddDetail} style={{ width: '100%', marginBottom: 16 }}>
          <PlusOutlined /> 添加商品明细
        </Button>
        <EditableProTable<TableFormDetailItem>
          recordCreatorProps={false}
          
          value={details}
          columns={detailColumns}
          rowClassName="editable-row"
          pagination={false}
          onChange={setDetails}
          editable={{
            type: 'multiple',
            editableKeys,
            actionRender: (row, config, dom) => {
              return [
                <Button
                  key="save"
                  onClick={async () => {
                    try {
                      // 执行表单项的验证

                      await form.validateFields();
                      row.quantity = currentEditRow?.quantity;
                      row.box_num = currentEditRow?.box_num;
                      row.price = currentEditRow?.price;
                      row.amount = currentEditRow?.amount;

                      const originData = purchaseOrderProductList.find(
                        (item) => item.purchase_order_product_no === row.purchase_order_product_no
                      );
        
                      const isFutureOrder = currentPurchaseOrder?.order_type === '1';

                      const num_quantity = isFutureOrder? originData.ci_quantity : originData.quantity;
                      const num_box_num = isFutureOrder? originData.ci_box_num : originData.box_num;

                      if(num_quantity < parseFloat(row.quantity)) {
                        message.error('数量不能大于采购数量 ' + num_quantity);
                        return;
                      }
        
                      if(num_box_num < parseFloat(row.box_num)) {
                        message.error('箱数不能大于采购箱数 ' + num_box_num);
                        return;
                      }
                   

                      config.onSave(row.key, row, row);
                    } catch (error) {
                      // 如果验证失败，可以显示错误消息
                      console.error('Validation error:', error);
                      message.error('验证未通过，无法保存');
                    }
                  }}
                >
                  保存
                </Button>,
                dom.cancel,
                dom.delete,
              ];
            },
            onSave: async (rowKey, record, row) => {

                // 先进行表单验证
              await form.validateFields();

             

              setDetails(prevDetails => {
                const index = prevDetails.findIndex((item) => rowKey === item.key);
                if (index > -1) {
                  const newData = [...prevDetails];
                  newData[index] = { ...newData[index], ...record };
                  return newData;
                }
                return prevDetails;
              });
            },
            onChange: setEditableRowKeys,
          }}
          scroll={{ x: 'max-content' }}
          rowKey="key"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">提交</Button>
        <Button type="default" onClick={() => navigate('/sales_order')} style={{ marginLeft: 8 }}>取消</Button>
      </Form.Item>

      <Modal title="添加商品明细" visible={modalVisible} onOk={handleProductSubmit} onCancel={() => setModalVisible(false)}>
        <Form form={productForm} layout="vertical">
          <Form.Item name="purchase_order_product_no" label="商品名称" rules={[{ required: true, message: '请选择商品名称' }]}>
            <Select onChange={handleSelectCurrentProduct} placeholder="请选择商品名称">
              {purchaseOrderProductList.map(product => (
                <Option key={product.purchase_order_product_no} value={product.purchase_order_product_no}>
                  {product.product?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sku_uuid" label="SKU UUID" hidden></Form.Item>
          <Form.Item name="sku_code" label="SKU代码" rules={[{ required: false, message: '请输入SKU代码' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="sku_spec" label="规格" rules={[{ required: false, message: '请输入规格' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="quantity" label="商品数量" rules={[{ required: true, message: '请输入商品数量' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="box_num" label="商品箱数" rules={[{ required: true, message: '请输入商品箱数' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="price" label="价格（单价）" rules={[{ required: false, message: '请输入价格' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="amount" label="总价" rules={[{ required: false, message: '请输入总价' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="country" label="国家" rules={[{ required: false, message: '请输入国家' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="factory_no" label="厂号" rules={[{ required: false, message: '请输入厂号' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="cabinet_no" label="柜号" rules={[{ required: false, message: '请输入柜号' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="invoice_no" label="发票号" rules={[{ required: false, message: '请输入发票号' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="contract_no" label="合同号" rules={[{ required: false, message: '请输入合同号' }]}>
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
};

export default SalesOrderForm;
