import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { addInventoryCheck, getProductOptions } from '@/services/storehouse_inventory_check';
import { getStorehouseOptions } from '@/services/storehouse';
import { getProductSkuOptions } from '@/services/product';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const AddInventoryCheck = () => {
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState({});
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStorehouseOptions();
    fetchProductOptions();
  }, []);

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

  const handleProductChange = async (value, index) => {
    try {
      const response = await getProductSkuOptions({ uuid: value });
      if (response.code === 200) {
        setSkuOptions((prev) => ({
          ...prev,
          [index]: response.data,
        }));
        const details = form.getFieldValue('detail') || [];
        details[index] = {
          ...details[index],
          sku_uuid: undefined,
        };
        form.setFieldsValue({ detail: details });
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
      values.status = parseInt(values.status);
      values.detail = values.detail.map((item) => ({
        ...item,
        quantity: parseInt(item.quantity),
      }));
      const res = await addInventoryCheck(values);
    if (res.code === 200) {
        message.success('添加成功');
        navigate('/storehouse/inventory/check');
    } else {
        message.error('操作失败');
    }
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical">
        <Form.Item name="storehouse_uuid" label="仓库" rules={[{ required: true, message: '请选择仓库' }]}>
          <Select placeholder="请选择仓库">
            {storehouseOptions.map((storehouse) => (
              <Option key={storehouse.uuid} value={storehouse.uuid}>
                {storehouse.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="check_date" label="盘点日期" rules={[{ required: true, message: '请选择盘点日期' }]}>
          <Input type="date" />
        </Form.Item>
        <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
          <Select placeholder="请选择状态">
            <Option value="1">已盘点</Option>
            <Option value="2">未盘点</Option>
          </Select>
        </Form.Item>
        <Form.Item name="detail" label="盘点明细" rules={[{ required: true, message: '请填写盘点明细' }]}>
          <Form.List name="detail">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                  <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'product_uuid']}
                      fieldKey={[fieldKey, 'product_uuid']}
                      rules={[{ required: true, message: '请选择商品' }]}
                    >
                      <Select
                        placeholder="请选择商品"
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
                      rules={[{ required: true, message: '请输入盘点数量' }]}
                    >
                      <Input placeholder="盘点数量" type="number" style={{ width: 150, marginLeft: 8 }} />
                    </Form.Item>
                    <Button type="link" onClick={() => remove(name)} style={{ marginLeft: 8 }}>
                      删除
                    </Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加盘点明细
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleOk}>
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddInventoryCheck;
