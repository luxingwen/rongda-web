import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Form, Input, Select, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { addPurchaseOrder, getProductOptions,  } from '@/services/purchase_order';
import { getProductSkuOptions } from '@/services/product';
import { getSupplierOptions } from '@/services/supplier';

const { Option } = Select;

const AddPurchaseOrder = () => {
  const [form] = Form.useForm();
  const [productOptions, setProductOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState({});
  const navigate = useNavigate();

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

  const handleProductChange = async (value, index) => {
    try {
      const response = await getProductSkuOptions({ uuid: value });
      if (response.code === 200) {
        setSkuOptions((prev) => ({
          ...prev,
          [index]: response.data,
        }));
        form.setFieldsValue({ details: form.getFieldValue('details').map((d, i) => (i === index ? { ...d, sku_uuid: undefined } : d)) });
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
      values.deposit = parseFloat(values.deposit);
      values.tax = parseFloat(values.tax);
      values.total_amount = parseFloat(values.total_amount);
      values.details = values.details.map((d) => ({
        ...d,
        quantity: parseFloat(d.quantity),
        price: parseFloat(d.price),
        total_amount: parseFloat(d.total_amount),
      }));
      await addPurchaseOrder(values);
      message.success('添加成功');
      navigate('/purchase/order');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    navigate('/purchase/order');
  };

  return (
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
      <Form.Item>
        <Button type="primary" onClick={handleOk}>
          保存
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
          取消
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddPurchaseOrder;
