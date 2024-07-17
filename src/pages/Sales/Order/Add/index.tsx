import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Form, Input, Select, Button, message } from 'antd';
import { getProductOptions, getProductSkuOptions } from '@/services/product';
import { getCustomerOptions } from '@/services/customer';
import { addSalesOrder, updateSalesOrder, getSalesOrderDetail } from '@/services/sales_order';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const SalesOrderForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [productOptions, setProductOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    fetchProductOptions();
    fetchCustomerOptions();
    if (uuid) {
      fetchSalesOrderDetail(uuid);
    }
  }, [uuid]);

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
        form.setFieldsValue({ product_list: form.getFieldValue('product_list').map((item, i) => (i === index ? { ...item, sku_uuid: undefined } : item)) });
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

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
        <Button type="default" onClick={() => history.push('/sales_order')} style={{ marginLeft: 8 }}>
          取消
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SalesOrderForm;
