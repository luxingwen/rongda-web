import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getPurchaseOrders,
  addPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getProductOptions,
} from '@/services/purchase_order';
import { getProductSkuOptions } from '@/services/product';
import { getSupplierOptions } from '@/services/supplier';
import { render } from 'react-dom';

const { Option } = Select;

const PurchaseOrderManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);
  const [form] = Form.useForm();
  const actionRef = useRef();

  useEffect(() => {
    fetchProductOptions();
    fetchSupplierOptions();
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
      await deletePurchaseOrder({ id });
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
      values.tax = parseFloat(values.tax);
      values.total_amount = parseFloat(values.total_amount);
        values.details = values.details.map((d) => ({
            ...d,
            quantity: parseFloat(d.quantity),
            price: parseFloat(d.price),
            total_amount: parseFloat(d.total_amount),
        }));
      if (editingOrder) {
        await updatePurchaseOrder({ ...editingOrder, ...values });
        message.success('更新成功');
      } else {
        await addPurchaseOrder(values);
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
        form.setFieldsValue({ details: form.getFieldValue('details').map((d, i) => (i === index ? { ...d, sku_uuid: undefined } : d)) });
      } else {
        message.error('获取SKU选项失败');
      }
    } catch (error) {
      message.error('获取SKU选项失败');
    }
  };

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'blue' : status === 2 ? 'green' : status === 3 ? 'red' : 'gray'}>
      {status === 1 ? '待处理' : status === 2 ? '已处理' : status === 3 ? '已取消' : '已完成'}
    </Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '采购单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '供应商', dataIndex: 'supplier_uuid', key: 'supplier_uuid', hideInSearch: true, render:(_, record) => record.supplier.name },
    { title: '采购日期', dataIndex: 'date', key: 'date', hideInSearch: true },
    { title: '定金', dataIndex: 'deposit', key: 'deposit', hideInSearch: true },
    { title: '税费', dataIndex: 'tax', key: 'tax', hideInSearch: true },
    { title: '总金额', dataIndex: 'total_amount', key: 'total_amount', hideInSearch: true },
    { title: '采购人', dataIndex: 'purchaser', key: 'purchaser', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
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

  const fetchPurchaseOrders = async (params) => {
    try {
      const response = await getPurchaseOrders(params);
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
        request={fetchPurchaseOrders}
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
            添加采购单
          </Button>,
        ]}
      />
      <Modal title={editingOrder ? '编辑采购单' : '添加采购单'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="supplier_uuid" label="供应商" rules={[{ required: true, message: '请选择供应商' }]}>
            <Select placeholder="请选择供应商">
              {supplierOptions.map((supplier) => (
                <Option key={supplier.uuid} value={supplier.uuid}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="采购日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="deposit" label="定金" rules={[{ required: true, message: '请输入定金' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="tax" label="税费" rules={[{ required: true, message: '请输入税费' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="total_amount" label="总金额" rules={[{ required: true, message: '请输入总金额' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="details" label="采购单明细" rules={[{ required: true, message: '请填写采购单明细' }]}>
            <Form.List name="details">
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
                        name={[name, 'quantity']}
                        fieldKey={[fieldKey, 'quantity']}
                        rules={[{ required: true, message: '请输入数量' }]}
                      >
                        <Input placeholder="数量" type="number" style={{ width: 100, marginLeft: 8 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'price']}
                        fieldKey={[fieldKey, 'price']}
                        rules={[{ required: true, message: '请输入价格' }]}
                      >
                        <Input placeholder="价格" type="number" style={{ width: 100, marginLeft: 8 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'total_amount']}
                        fieldKey={[fieldKey, 'total_amount']}
                        rules={[{ required: true, message: '请输入总金额' }]}
                      >
                        <Input placeholder="总金额" type="number" style={{ width: 100, marginLeft: 8 }} />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(name)} style={{ marginLeft: 8 }}>
                        删除
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加明细
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

export default PurchaseOrderManagement;
