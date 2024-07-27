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
import type { ProColumnType } from '@ant-design/pro-components';
import { EditableProTable, PageContainer } from '@ant-design/pro-components';


interface SKU {
  uuid?: string;
  code?: string;
  specification?: string;
  country?: string;
  factory_no?: string;
}

interface TableFormDetailItem {
  key: string;
  product_uuid?: string;
  sku_code?: string;
  sku_spec?: string;
  country?: string;
  factory_no?: string;
  cabinet_no?: string;
  invoice_no?: string;
  contract_no?: string;
  quantity?: number;
  box_num?: number;
  price?: number;
  amount?: number;
  sku?: SKU;
}

const { Option } = Select;

const SalesOrderForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { uuid } = useParams();
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
  const [details, setDetails] = useState<readonly TableFormDetailItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [currentEditRow, setCurrentEditRow] = useState<TableFormDetailItem | undefined>(undefined);
  

  useEffect(() => {
    fetchProductOptions();
    fetchCustomerOptions();
    fetchPurchaseOrderOptions();
    if (uuid) {
      fetchSalesOrderDetail(uuid);
    }
    console.log("Details updated:", details);
    
  }, [uuid, details]);

  const fetchPurchaseOrderOptions = async () => {
    try {
      const response = await getPurchaseOrdersByStatus({
        status_list: ['已完成', '已入库'],
      });
      if (response.code === 200) {
        setPurchaseOrderOptions(response.data);
      } else {
        message.error('获取采购单选项失败');
      }
    } catch (error) {
      message.error('获取采购单选项失败');
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

  const handlePuchaseOrderChange = (value) => {
    const currentOrder = purchaseOrderOptions.find(
      (order) => order.order_no === value,
    );

    if (currentOrder) {
      form.setFieldsValue({ customer_uuid: currentOrder.customer_uuid });
      fetchPurchaseOrderInfo(value);
    }
  };

  const fetchPurchaseOrderInfo = async (uuid) => {
    try {
      const response = await getPurchaseOrdersInfo({ uuid });
      if (response.code === 200) {
        const currentOrder = response.data;
        setCurrentPurchaseOrder(response.data);

        if (currentOrder.order_type === '1') {
          form.setFieldsValue({
            storehouse_uuid: currentOrder.estimated_warehouse,
          });
        } else {
          form.setFieldsValue({
            storehouse_uuid: currentOrder.actual_warehouse,
          });
        }
        fetchPurchaseOrderProductList(currentOrder.order_no, true);

        productForm.setFieldsValue({
          customer_name: currentOrder.customer_info?.name,
        });
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败');
    }
  };

  const fetchPurchaseOrderProductList = async (uuid, isDetailData) => {
    try {
      const response = await getPurchaseOrderProductList({ uuid });
      if (response.code === 200) {
        setPurchaseOrderProductList(response.data);
        const productList = response.data.map((item) => ({
          ...item,
          key: item.purchase_order_product_no,
        }));
        if(isDetailData) {
          setDetails(productList);
        }
     
        productForm.resetFields();
      } else {
        message.error('获取采购单商品列表失败');
      }
    } catch (error) {
      message.error('获取采购单商品列表失败');
    }
  };

  const fetchSalesOrderDetail = async (uuid) => {
    try {
      const response = await getSalesOrderDetail({ uuid });
      if (response.code === 200) {
        
        setEditingOrder(response.data);
        fetchPurchaseOrderProductList(response.data.purchase_order_no, false);
        form.setFieldsValue(response.data);
        fetchSalesOrderProductList(uuid);
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败');
    }
  };

  const fetchSalesOrderProductList = async (uuid) => {
    try {
      const response = await getSalesOrderProductList({ uuid });
      if (response.code === 200) {
        const list = response.data.map((item, index) => ({
          ...item,
          quantity: item.product_quantity,
          amount: item.product_amount,
          key: index + 1,
        }));
        console.log('list:', list);
        setDetails(list);
      } else {
        message.error('获取订单商品列表失败');
      }
    } catch (error) {
      message.error('获取订单商品列表失败');
    }
  };

  const handleProductChange = async (value, index) => {
    try {
      const response = await getProductSkuOptions({ uuid: value });
      if (response.code === 200) {
        const newSkuOptions = [...skuOptions];
        newSkuOptions[index] = response.data;
        setSkuOptions(newSkuOptions);
        form.setFieldsValue({
          product_list: form
            .getFieldValue('product_list')
            .map((item, i) =>
              i === index ? { ...item, sku_uuid: undefined } : item,
            ),
        });
      } else {
        message.error('获取SKU选项失败');
      }
    } catch (error) {
      message.error('获取SKU选项失败');
    }
  };

  const handleSubmit = async (values) => {
    try {

        values.order_no = uuid ? uuid : "";
      values.deposit = parseFloat(values.deposit_amount);
      values.order_amount = parseFloat(values.order_amount);
      values.tax_amount = parseFloat(values.tax_amount);
      console.log("submit details:", details);
      values.product_list = details.map((item) => ({
        ...item,
        product_quantity: parseInt(item.quantity),
        product_price: parseFloat(item.price),
        product_amount: parseFloat(item.amount),
        box_num: parseInt(item.box_num),
      }));

      if (currentPurchaseOrder) {
        values.purchase_order_no = currentPurchaseOrder.order_no;
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
          message.error('添加失败');
        }
      }
    } catch (error) {
      console.log("error:", error);
      message.error('操作失败');
    }
  };

  const renderProductName = (uuid) => {
    console.log('purchaseOrderProductList:', purchaseOrderProductList);
    console.log('uuid:', uuid);
    const product = purchaseOrderProductList.find(
      (product) => product.product_uuid === uuid,
    );
    return product?.product?.name;
  };

  const handleAddDetail = () => {
    setModalVisible(true);
    setIsEdit(false);
  };

  const handleSelectCurrentProduct = async (value) => {
    const currentProduct = purchaseOrderProductList.find(
      (product) => product.purchase_order_product_no === value,
    );
    setCurrentProduct(currentProduct);
    productForm.setFieldsValue({
      sku_uuid: currentProduct.sku_uuid,
      sku_code: currentProduct.sku?.code,
      sku_spec: currentProduct.sku?.specification,
      country: currentProduct.sku?.country,
      factory_no: currentProduct.sku?.factory_no,
      quantity: currentProduct.quantity,
      box_num: currentProduct.box_num,
      cabinet_no: currentProduct.cabinet_no,
    });
  };

  const handleProductSubmit = () => {
    productForm
      .validateFields()
      .then((values) => {
        // 获取原始数据
        const originData = purchaseOrderProductList.find(
          (item) =>
            item.purchase_order_product_no === values.purchase_order_product_no,
        );

        // 判断数量是否超过采购数量
        if (originData && originData.quantity < parseInt(values.quantity)) {
          message.error('数量不能大于采购数量' + originData.quantity);
          return;
        }

        // 判断箱数是否超过采购箱数
        if (originData && originData.box_num < parseInt(values.box_num)) {
          message.error('箱数不能大于采购箱数' + originData.box_num);
          return;
        }

        if (isEdit) {
          const updatedDetailData = detailData.map((item) =>
            item.product_uuid === values.product_uuid
              ? { ...item, ...values }
              : item,
          );
          setDetails(updatedDetailData);
        } else {
          // 如果已经存在相同的商品，则不添加
          const isExist = detailData.some(
            (item) =>
              item.purchase_order_product_no ===
              values.purchase_order_product_no,
          );

          if (!isExist) {
            values.key = detailData.length + 1;
          } else {
            message.error('商品已存在');
            return;
          }

          let citem = purchaseOrderProductList.find(
            (product) =>
              product.purchase_order_product_no ===
              values.purchase_order_product_no,
          );

          console.log('citem', citem);

          citem.quantity = parseInt(values.quantity);
          citem.box_num = parseInt(values.box_num);
          citem.price = parseFloat(values.price);
          citem.amount = parseFloat(values.amount);

          setDetails([...detailData, citem]);
        }

        setModalVisible(false);
        productForm.resetFields();
      })
      .catch((info) => {
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
    setDetails(detailData.filter((item) => item.key !== key));
  };

  const handleSave = (row) => {
    const newData = [...detailData];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      const item = newData[index];

      const citem = purchaseOrderProductList.find(
        (product) =>
          product.purchase_order_product_no === item.purchase_order_product_no,
      );
      const quantity = parseInt(row.quantity);
      const box_num = parseInt(row.box_num);
      if (citem.quantity < quantity) {
        console.log('citem.quantity', quantity);
        row.quantity = citem.quantity;
      }

      if (citem.box_num < box_num) {
        row.box_num = citem.box_num;
      }

      newData.splice(index, 1, { ...item, ...row });
      setDetails(newData);
    } else {
      newData.push(row);
      setDetails(newData);
    }
  };

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const handleBlur = (e) => {
      const value = e.target.value;

      const updatedRecord = { ...record, [dataIndex]: value };
      const citem = purchaseOrderProductList.find(
        (product) =>
          product.purchase_order_product_no ===
          record.purchase_order_product_no,
      );
      const quantity = parseInt(updatedRecord.quantity);
      const box_num = parseInt(updatedRecord.box_num);

      if (citem.quantity < quantity) {
        message.error('不能大于采购数量' + citem.quantity);
        e.target.focus();
      }

      if (citem.box_num < box_num) {
        message.error('不能大于采购箱数' + citem.box_num);
        e.target.focus();
      }

      handleSave(updatedRecord);
    };

    const isNumber = ['quantity', 'box_num', 'price', 'amount'].includes(
      dataIndex,
    );

    return (
      <td {...restProps}>
        {editable ? (
          <Form.Item
            name={[record.key, dataIndex]} // Ensure unique name for each field
            style={{ margin: 0 }}
            initialValue={record[dataIndex]} // Set initial value
            rules={[{ required: true, message: `${title} 是必填项` }]}
          >
            <Input onBlur={handleBlur} type={isNumber ? 'number' : 'text'} />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const detailColumns: ProColumnType<TableFormDetailItem>[] = [
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
      renderFormItem: (_, { isEditable, record }, ) => (
        <Form.Item
          name={`quantity-${record.key}`}
          noStyle 
          rules={[
            {
              required: true,
              message: '请输入商品数量',
            },
            {
              validator: (_, value) => {

                // 先获取原始数据
                const originData = purchaseOrderProductList.find(
                  (item) =>
                    item.purchase_order_product_no === record.purchase_order_product_no,
                );

                // 判断数量是否超过采购数量
                if (originData && originData.quantity < parseInt(value)) {
                  return Promise.reject('数量不能大于采购数量' + originData.quantity);
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type="number"
            defaultValue={record.quantity}
            onChange={(e) => {
              const value = Number(e.target.value);
              record.quantity = value > 0 ? value : 0; // Ensure non-negative values
              record.product_quantity =  record.quantity;
              setCurrentEditRow(record);
            }}
          />
        </Form.Item>
      ),

    },
    { title: '商品箱数', dataIndex: 'box_num', key: 'box_num',

      renderFormItem: (_, { isEditable, record }, form) => (
        <Form.Item
          name="box_num"
          noStyle 
          rules={[
            {
              required: true,
              message: '请输入商品箱数',
            },
            {
              validator: (_, value) => {

                // 先获取原始数据
                const originData = purchaseOrderProductList.find(
                  (item) =>
                    item.purchase_order_product_no === record.purchase_order_product_no,
                );

                // 判断数量是否超过采购数量
                if (originData && originData.box_num < parseInt(value)) {
                  return Promise.reject('数量不能大于采购数量' + originData.box_num);
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type="number"
            defaultValue={record.box_num}
            onChange={(e) => {
              const value = Number(e.target.value);
              record.box_num = value > 0 ? value : 0; // Ensure non-negative values
              setCurrentEditRow(record);
            }}
          />
        </Form.Item>
      ),
    },
    { title: '单价', dataIndex: 'price', key: 'price', editable: true },
    { title: '总价', dataIndex: 'amount', key: 'amount', editable: true },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      render: (_, record: TableFormDetailItem, index, action) => [
        <a key="edit" onClick={() => {
          setCurrentEditRow(record);
          action?.startEditable(record.key)
          }}>
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

  const mergedColumns = detailColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="title"
        label="标题"
        rules={[{ required: true, message: '请输入订单标题' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="order_type"
        label="订单类型"
        initialValue={'1'}
        rules={[{ required: true, message: '请选择订单类型' }]}
      >
        <Select placeholder="请选择订单类型">
          <Option value="1">期货订单</Option>
          <Option value="2">现货订单</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="order_date"
        label="订单日期"
        rules={[{ required: true, message: '请输入订单日期' }]}
      >
        <Input type="date" />
      </Form.Item>

      <Form.Item
        name="purchase_order_no"
        label="采购订单"
        rules={[{ required: true, message: '请选择采购订单' }]}
      >
        <Select
          showSearch
          allowClear
          mode="combobox"
          onChange={handlePuchaseOrderChange}
          filterOption={(input, option) => {
            const children = option.children;
            const childrenString = Array.isArray(children)
              ? children.join('')
              : children.toString();
            return (
              childrenString.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
          }}
          placeholder="请选择采购订单"
        >
          {purchaseOrderOptions.map((order) => (
            <Option key={order.order_no} value={order.order_no}>
              {order.title} - {order.order_no}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="customer_uuid"
        label="客户"
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
        name="deposit_amount"
        label="定金"
        rules={[{ required: true, message: '请输入定金' }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item
        name="order_amount"
        label="订单金额"
        rules={[{ required: true, message: '请输入订单金额' }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item
        name="tax_amount"
        label="税费"
        rules={[{ required: true, message: '请输入税费' }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item name="remarks" label="备注">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item
        name="details"
        label="商品明细"
        rules={[{ required: false, message: '请填写商品明细' }]}
      >
        <Button
          type="dashed"
          onClick={handleAddDetail}
          style={{ width: '100%', marginBottom: 16 }}
        >
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
              onValuesChange: (record, recordList) => {
                
              },
              onSave: (rowKey, record, row) => {
                console.log('rowKey:', rowKey);
                console.log('record:', record);
                setDetails(prevDetails => {
                  const index = prevDetails.findIndex((item) => rowKey === item.key);
                  if (index > -1) {
                    const newData = [...prevDetails];
                    newData[index] = { ...newData[index], ...record }; // Merge new record data
                    console.log("Updated newData:", newData);
                    return newData; // Return new state directly
                  }
                  return prevDetails; // Return old state if no changes
                });
                
                //   await waitTime(2000);
              },
              onChange: setEditableRowKeys,
            }}
            scroll={{ x: 'max-content' }}
            rowKey="key"
          />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
        <Button
          type="default"
          onClick={() => history.push('/sales_order')}
          style={{ marginLeft: 8 }}
        >
          取消
        </Button>
      </Form.Item>

      <Modal
        title="添加商品明细"
        visible={modalVisible}
        onOk={handleProductSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={productForm} layout="vertical">
          <Form.Item
            name="purchase_order_product_no"
            label="商品名称"
            rules={[{ required: true, message: '请选择商品名称' }]}
          >
            <Select
              onChange={handleSelectCurrentProduct}
              placeholder="请选择商品名称"
            >
              {purchaseOrderProductList.map((product) => (
                <Option
                  key={product.purchase_order_product_no}
                  value={product.purchase_order_product_no}
                >
                  {product.product?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="sku_uuid"
            label="SKU UUID"
            hidden
            rules={[{ required: false, message: '请输入SKU代码' }]}
          ></Form.Item>

          <Form.Item
            name="sku_code"
            label="SKU代码"
            rules={[{ required: false, message: '请输入SKU代码' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="sku_spec"
            label="规格"
            rules={[{ required: false, message: '请输入规格' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="商品数量"
            rules={[{ required: true, message: '请输入商品数量' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="box_num"
            label="商品箱数"
            rules={[{ required: true, message: '请输入商品箱数' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格（单价）"
            rules={[{ required: false, message: '请输入价格' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="总价"
            rules={[{ required: false, message: '请输入总价' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label="国家"
            rules={[{ required: false, message: '请输入国家' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="factory_no"
            label="厂号"
            rules={[{ required: false, message: '请输入厂号' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="cabinet_no"
            label="柜号"
            rules={[{ required: false, message: '请输入柜号' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="invoice_no"
            label="发票号"
            rules={[{ required: false, message: '请输入发票号' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="contract_no"
            label="合同号"
            rules={[{ required: false, message: '请输入合同号' }]}
          >
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
};

export default SalesOrderForm;
