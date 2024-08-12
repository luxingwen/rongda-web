// src/pages/AddSalesOutOfStock.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { history } from '@umijs/max';
import { PlusOutlined } from '@ant-design/icons';
import { addSalesOutOfStock  } from '@/services/sales_out_of_stock';

import { getProductOptions } from '@/services/product';
import { getCustomerOptions } from '@/services/customer';
import { getStorehouseOptions } from '@/services/storehouse';
import { getProductSkuOptions } from '@/services/product';

const { Option } = Select;

const AddSalesOutOfStock = () => {
  const [form] = Form.useForm();
  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);

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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.status = parseFloat(values.status);
      values.items = values.items.map((item) => ({
        ...item,
        quantity: parseFloat(item.quantity),
        price: parseFloat(item.price),
        total_amount: parseFloat(item.total_amount),
      }));
      await addSalesOutOfStock(values);
      message.success('添加成功');
      history.push('/sales/outbound');
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleOk}>
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
      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddSalesOutOfStock;
