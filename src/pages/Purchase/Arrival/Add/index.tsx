// src/pages/PurchaseArrivalForm.jsx
import React, { useState, useEffect } from 'react';
import {  useParams } from 'react-router-dom';
import { history } from '@umijs/max';
import { Form, Input, Select, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  addPurchaseArrival,
  updatePurchaseArrival,
  getPurchaseArrival,
  getProductOptions,
} from '@/services/purchase_arrival';
import { getProductSkuOptions } from '@/services/product';
import { getSupplierOptions } from '@/services/supplier';

const { Option } = Select;

const PurchaseArrivalForm = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const [productOptions, setProductOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState({});
  const [editingArrival, setEditingArrival] = useState(null);

  useEffect(() => {
    fetchProductOptions();
    fetchSupplierOptions();
    if (id) {
      fetchPurchaseArrival(id);
    }
  }, [id]);

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

  const fetchPurchaseArrival = async (id) => {
    try {
      const response = await getPurchaseArrival({ id });
      if (response.code === 200) {
        setEditingArrival(response.data);
        form.setFieldsValue(response.data);
      } else {
        message.error('获取到货详情失败');
      }
    } catch (error) {
      message.error('获取到货详情失败');
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
        const items = form.getFieldValue('items');
        items[index].sku_uuid = undefined;
        form.setFieldsValue({ items });
      } else {
        message.error('获取SKU选项失败');
      }
    } catch (error) {
      message.error('获取SKU选项失败');
    }
  };

  const handleFinish = async (values) => {
    try {
      values.status = parseInt(values.status);
      values.items = values.items.map((item) => ({
        ...item,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        total_amount: parseFloat(item.total_amount),
      }));
      if (editingArrival) {
        await updatePurchaseArrival({ ...editingArrival, ...values });
        message.success('更新成功');
      } else {
        await addPurchaseArrival(values);
        message.success('添加成功');
      }
      history.push('/purchase/arrival');
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item name="purchase_order_no" label="采购单号" rules={[{ required: true, message: '请输入采购单号' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="batch" label="批次" rules={[{ required: true, message: '请输入批次' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="arrival_date" label="到货日期" rules={[{ required: true, message: '请输入到货日期' }]}>
        <Input type="date" />
      </Form.Item>
      <Form.Item name="acceptor" label="验收人" rules={[{ required: true, message: '请输入验收人' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="acceptance_result" label="验收结果" rules={[{ required: true, message: '请选择验收结果' }]}>
        <Select placeholder="请选择验收结果">
          <Option value="1">合格</Option>
          <Option value="2">不合格</Option>
        </Select>
      </Form.Item>
      <Form.Item name="remark" label="备注">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item name="items" label="到货明细" rules={[{ required: true, message: '请填写到货明细' }]}>
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
                    <Input placeholder="数量" type="number" style={{ width: 150, marginLeft: 8 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'price']}
                    fieldKey={[fieldKey, 'price']}
                    rules={[{ required: true, message: '请输入价格' }]}
                  >
                    <Input placeholder="价格" type="number" style={{ width: 150, marginLeft: 8 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'total_amount']}
                    fieldKey={[fieldKey, 'total_amount']}
                    rules={[{ required: true, message: '请输入总金额' }]}
                  >
                    <Input placeholder="总金额" type="number" style={{ width: 150, marginLeft: 8 }} />
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
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PurchaseArrivalForm;
