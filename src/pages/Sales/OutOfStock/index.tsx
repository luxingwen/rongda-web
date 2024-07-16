import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getSalesOutOfStocks,
  addSalesOutOfStock,
  updateSalesOutOfStock,
  deleteSalesOutOfStock,
  getProductOptions,
} from '@/services/sales_out_of_stock';

import { getProductSkuOptions } from '@/services/product';
import { getStorehouseOptions } from '@/services/storehouse';
import { getCustomerOptions } from '@/services/customer';


const { Option } = Select;

const SalesOutOfStockManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOutOfStock, setEditingOutOfStock] = useState(null);
  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);
  const [form] = Form.useForm();
  const actionRef = useRef();

  useEffect(() => {
    fetchProductOptions();
    fetchCustomerOptions();
    fetchStorehouseOptions();
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

  const handleAddOutOfStock = () => {
    setEditingOutOfStock(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditOutOfStock = (record) => {
    setEditingOutOfStock(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteOutOfStock = async (id) => {
    try {
      await deleteSalesOutOfStock({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.status = parseInt(values.status);
      values.items = values.items.map((item) => ({
        ...item,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        total_amount: parseFloat(item.total_amount),
      }));
      if (editingOutOfStock) {
        await updateSalesOutOfStock({ ...editingOutOfStock, ...values });
        message.success('更新成功');
      } else {
        await addSalesOutOfStock(values);
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
        form.setFieldsValue({ items: form.getFieldValue('items').map((d, i) => (i === index ? { ...d, sku_uuid: undefined } : d)) });
      } else {
        message.error('获取SKU选项失败');
      }
    } catch (error) {
      message.error('获取SKU选项失败');
    }
  };

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'red' : 'green'}>{status === 1 ? '未出库' : '已出库'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '出库日期', dataIndex: 'out_of_stock_date', key: 'out_of_stock_date' },
    { title: '销售单号', dataIndex: 'sales_order_no', key: 'sales_order_no' },
    { title: '客户UUID', dataIndex: 'customer_uuid', key: 'customer_uuid', hideInSearch: true },
    { title: '批次号', dataIndex: 'batch_no', key: 'batch_no', hideInSearch: true },
    { title: '登记人', dataIndex: 'registrant', key: 'registrant', hideInSearch: true },
    { title: '仓库UUID', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', hideInSearch: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditOutOfStock(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteOutOfStock(record.uuid)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchSalesOutOfStocks = async (params) => {
    try {
      const response = await getSalesOutOfStocks(params);
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
        request={fetchSalesOutOfStocks}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddOutOfStock} type="primary">
            添加出库
          </Button>,
        ]}
      />
      <Modal title={editingOutOfStock ? '编辑出库' : '添加出库'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="out_of_stock_date" label="出库日期" rules={[{ required: true, message: '请输入出库日期' }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="sales_order_no" label="销售单号" rules={[{ required: true, message: '请输入销售单号' }]}>
            <Input />
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
          <Form.Item name="batch_no" label="批次号" rules={[{ required: true, message: '请输入批次号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="registrant" label="登记人" rules={[{ required: true, message: '请输入登记人' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="storehouse_uuid" label="仓库" rules={[{ required: true, message: '请选择仓库' }]}>
            <Select placeholder="请选择仓库">
              {storehouseOptions.map((storehouse) => (
                <Option key={storehouse.uuid} value={storehouse.uuid}>
                  {storehouse.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="items" label="出库明细" rules={[{ required: true, message: '请填写出库明细' }]}>
            <Form.List name="items">
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
                    添加出库明细
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

export default SalesOutOfStockManagement;
