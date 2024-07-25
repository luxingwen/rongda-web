import { getCustomerOptions } from '@/services/customer';
import { getProductOptions, getProductSkuOptions } from '@/services/product';
import {
  getAllPurchaseOrdersOptions,
  getPurchaseOrderProductList,
  getPurchaseOrdersInfo,
  getPurchaseOrdersByStatus,
} from '@/services/purchase_order';
import {
  addSalesOrder,
  getSalesOrderDetail,
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
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  const [detailData, setDetailData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProductOptions();
    fetchCustomerOptions();
    fetchPurchaseOrderOptions();
    if (uuid) {
      fetchSalesOrderDetail(uuid);
    }
  }, [uuid]);

  const fetchPurchaseOrderOptions = async () => {
    try {
      const response = await getPurchaseOrdersByStatus({ status_list: ['已完成', '已入库'] });
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
        fetchPurchaseOrderProductList(currentOrder.order_no);

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

  const fetchPurchaseOrderProductList = async (uuid) => {
    try {
      const response = await getPurchaseOrderProductList({ uuid });
      if (response.code === 200) {
        setPurchaseOrderProductList(response.data);
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
        form.setFieldsValue(response.data);
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败');
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
      values.deposit = parseFloat(values.deposit);
      values.order_amount = parseFloat(values.order_amount);
      values.tax_amount = parseFloat(values.tax_amount);
      values.product_list = detailData.map((item) => ({
        ...item,
        product_quantity: parseInt(item.quantity),
        product_price: parseFloat(item.price),
        product_amount: parseFloat(item.amount),
      }));

      if(currentPurchaseOrder) {
        values.purchase_order_no = currentPurchaseOrder.order_no;
      }

      if (editingOrder) {
        await updateSalesOrder({ ...editingOrder, ...values });
        message.success('更新成功');
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
      message.error('操作失败');
    }
  };

  const renderProductName = (uuid) => {
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
      (product) => product.product_uuid === value,
    );
    console.log('currentProduct', currentProduct);
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
          (item) => item.product_uuid === values.product_uuid,
        );

        // 判断数量是否超过采购数量
        if (originData && originData.quantity < parseInt(values.quantity)) {
          message.error('销售数量不能大于采购数量' + originData.quantity);
          return;
        }

        // 判断箱数是否超过采购箱数
        if (originData && originData.box_num < parseInt(values.box_num)) {
          message.error('销售箱数不能大于采购箱数' + originData.box_num);
          return;
        }

        if (isEdit) {
          const updatedDetailData = detailData.map((item) =>
            item.product_uuid === values.product_uuid
              ? { ...item, ...values }
              : item,
          );
          setDetailData(updatedDetailData);
        } else {
          // 如果已经存在相同的商品，则不添加
          const isExist = detailData.some(
            (item) => item.product_uuid === values.product_uuid,
          );

          if (!isExist) {
            values.key = detailData.length + 1;
          } else {
            message.error('商品已存在');
            return;
          }

          setDetailData([...detailData, values]);
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
    setDetailData(detailData.filter((item) => item.key !== key));
  };

  const detailColumns = [
    {
      title: '商品名称',
      dataIndex: 'product_uuid',
      key: 'product_uuid',
      render: renderProductName,
    },
    { title: 'SKU代码', dataIndex: 'sku_code', key: 'sku_code' },
    { title: '规格', dataIndex: 'sku_spec', key: 'sku_spec' },
    { title: '商品数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '商品箱数', dataIndex: 'box_num', key: 'box_num' },
    { title: '单价', dataIndex: 'price', key: 'price' },
    { title: '总价', dataIndex: 'amount', key: 'amount' },
    { title: '国家', dataIndex: 'country', key: 'country' },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no' },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no' },
    { title: '发票号', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: '合同号', dataIndex: 'contract_no', key: 'contract_no' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEditDetail(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => handleDeleteDetail(record.key)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

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
        initialValue={"1"}
        rules={[{ required: true, message: '请选择订单类型' }]}
      >
        <Select
        placeholder="请选择订单类型">
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
        name="deposit"
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
        name="detail"
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
        <Table
          columns={detailColumns}
          dataSource={detailData}
          pagination={false}
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
            name="product_uuid"
            label="商品名称"
            rules={[{ required: true, message: '请选择商品名称' }]}
          >
            <Select
              onChange={handleSelectCurrentProduct}
              placeholder="请选择商品名称"
            >
              {purchaseOrderProductList.map((product) => (
                <Option key={product.product_uuid} value={product.product_uuid}>
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
