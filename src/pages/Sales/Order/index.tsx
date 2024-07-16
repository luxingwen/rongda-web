import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getSalesOrders,
  addSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  getProductOptions,
} from '@/services/sales_order';
import { getCustomerOptions } from '@/services/customer';
import { getProductSkuOptions } from '@/services/product';

const { Option } = Select;

const SalesOrderManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);
  const [form] = Form.useForm();
  const actionRef = useRef();

  useEffect(() => {
    fetchProductOptions();
    fetchCustomerOptions();
  }, []);

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

  const handleAddOrder = () => {
    setEditingOrder(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditOrder = (record) => {
    setEditingOrder(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteOrder = async (id) => {
    try {
      await deleteSalesOrder({ id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.deposit = parseFloat(values.deposit);
      values.order_amount = parseFloat(values.order_amount);
      values.tax_amount = parseFloat(values.tax_amount);
      values.product_list = values.product_list.map((item) => ({
        ...item,
        product_quantity: parseInt(item.product_quantity),
        product_price: parseFloat(item.product_price),
        product_amount: parseFloat(item.product_amount),
      }));
      if (editingOrder) {
        await updateSalesOrder({ ...editingOrder, ...values });
        message.success('更新成功');
      } else {
        await addSalesOrder(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleProductChange = async (value, index) => {
    try {
      const response = await getProductSkuOptions({ uuid: value });
      if (response.code === 200) {
        const newSkuOptions = [...skuOptions];
        newSkuOptions[index] = response.data;
        setSkuOptions(newSkuOptions);
        form.setFieldsValue({ product_list: form.getFieldValue('product_list').map((item, i) => (i === index ? { ...item, sku_uuid: undefined } : item)) });
      } else {
        message.error('获取SKU选项失败');
      }
    } catch (error) {
      message.error('获取SKU选项失败');
    }
  };

  const renderStatus = (status) => (
    <Tag color={status === '待支付' ? 'blue' : status === '已支付' ? 'green' : status === '已发货' ? 'orange' : status === '已完成' ? 'cyan' : 'red'}>
      {status}
    </Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '订单类型', dataIndex: 'order_type', key: 'order_type' },
    { title: '订单日期', dataIndex: 'order_date', key: 'order_date', hideInSearch: true },
    { title: '客户', dataIndex: 'customer_uuid', key: 'customer_uuid', hideInSearch: true, render: (_, record) => record.customer?.name },
    { title: '定金', dataIndex: 'deposit', key: 'deposit', hideInSearch: true },
    { title: '订单金额', dataIndex: 'order_amount', key: 'order_amount', hideInSearch: true },
    { title: '税费', dataIndex: 'tax_amount', key: 'tax_amount', hideInSearch: true },
    { title: '销售人', dataIndex: 'salesman', key: 'salesman', hideInSearch: true },
    { title: '状态', dataIndex: 'order_status', key: 'order_status', render: renderStatus, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditOrder(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteOrder(record.id)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchSalesOrders = async (params) => {
    try {
      const response = await getSalesOrders(params);
      if (response.code !== 200) {
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
      return {
        data: response.data.data,
        success: true,
        total: response.data.total,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  return (
    <div>
      <ProTable
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={fetchSalesOrders}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddOrder} type="primary">
            添加销售订单
          </Button>,
        ]}
      />
      <Modal title={editingOrder ? '编辑销售订单' : '添加销售订单'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="order_type" label="订单类型" rules={[{ required: true, message: '请选择订单类型' }]}>
            <Select placeholder="请选择订单类型">
              <Option value="1">期货订单</Option>
              <Option value="2">现货订单</Option>
            </Select>
          </Form.Item>
          <Form.Item name="order_date" label="订单日期" rules={[{ required: true, message: '请输入订单日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="customer_uuid" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
            <Select placeholder="请选择客户">
              {customerOptions.map((customer) => (
                <Option key={customer.uuid} value={customer.uuid}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="deposit" label="定金" rules={[{ required: true, message: '请输入定金' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="order_amount" label="订单金额" rules={[{ required: true, message: '请输入订单金额' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="tax_amount" label="税费" rules={[{ required: true, message: '请输入税费' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="product_list" label="商品列表" rules={[{ required: true, message: '请填写商品列表' }]}>
            <Form.List name="product_list">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                    <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'product_uuid']}
                        fieldKey={[fieldKey, 'product_uuid']}
                        rules={[{ required: true, message: '请选择产品' }]}
                      >
                        <Select
                          placeholder="请选择产品"
                          style={{ width: 150 }}
                          onChange={(value) => handleProductChange(value, index)}
                        >
                          {productOptions.map((product) => (
                            <Option key={product.uuid} value={product.uuid}>
                              {product.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'sku_uuid']}
                        fieldKey={[fieldKey, 'sku_uuid']}
                        rules={[{ required: true, message: '请选择SKU' }]}
                      >
                        <Select placeholder="请选择SKU" style={{ width: 150, marginLeft: 8 }}>
                          {(skuOptions[index] || []).map((sku) => (
                            <Option key={sku.uuid} value={sku.uuid}>
                              {sku.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'product_quantity']}
                        fieldKey={[fieldKey, 'product_quantity']}
                        rules={[{ required: true, message: '请输入数量' }]}
                      >
                        <Input placeholder="数量" type="number" style={{ width: 100, marginLeft: 8 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'product_price']}
                        fieldKey={[fieldKey, 'product_price']}
                        rules={[{ required: true, message: '请输入价格' }]}
                      >
                        <Input placeholder="价格" type="number" style={{ width: 100, marginLeft: 8 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'product_amount']}
                        fieldKey={[fieldKey, 'product_amount']}
                        rules={[{ required: true, message: '请输入金额' }]}
                      >
                        <Input placeholder="金额" type="number" style={{ width: 100, marginLeft: 8 }} />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(name)} style={{ marginLeft: 8 }}>
                        删除
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加商品
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalesOrderManagement;
