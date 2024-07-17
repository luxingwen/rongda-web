import { getProductOptions, getProductSkuOptions } from '@/services/product';
import { getStorehouseOptions } from '@/services/storehouse';
import { addOutbound } from '@/services/storehouse_outbound';
import { Button, Form, Input, message, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const StorehouseOutboundForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState({});

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

  const handleProductChange = async (value, fieldKey) => {
    try {
      const response = await getProductSkuOptions({ uuid: value });
      if (response.code === 200) {
        setSkuOptions((prevSkuOptions) => ({
          ...prevSkuOptions,
          [fieldKey]: response.data,
        }));
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
      values.detail = values.detail.map((item) => ({
        ...item,
        quantity: parseInt(item.quantity),
      }));

      const res = await addOutbound(values);
      if (res.code === 200) {
        message.success('添加成功');
        navigate('/storehouse/inventory/out');
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item
        name="storehouse_uuid"
        label="仓库"
        rules={[{ required: true, message: '请选择仓库' }]}
      >
        <Select placeholder="请选择仓库">
          {storehouseOptions.map((storehouse) => (
            <Option key={storehouse.uuid} value={storehouse.uuid}>
              {storehouse.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="outbound_type"
        label="出库类型"
        rules={[{ required: true, message: '请选择出库类型' }]}
      >
        <Select placeholder="请选择出库类型">
          <Option value="1">销售出库</Option>
          <Option value="2">退货出库</Option>
          <Option value="3">手工出库</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="status"
        label="状态"
        rules={[{ required: true, message: '请选择状态' }]}
      >
        <Select placeholder="请选择状态">
          <Option value="1">已出库</Option>
          <Option value="2">未出库</Option>
        </Select>
      </Form.Item>
      <Form.Item name="outbound_date" label="出库日期">
        <Input type="date" />
      </Form.Item>
      <Form.Item
        name="detail"
        label="出库明细"
        rules={[{ required: true, message: '请填写出库明细' }]}
      >
        <Form.List name="detail">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
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
                      onChange={(value) => handleProductChange(value, fieldKey)}
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
                    <Select
                      placeholder="请选择SKU"
                      style={{ width: 150, marginLeft: 8 }}
                    >
                      {(skuOptions[fieldKey] || []).map((sku) => (
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
                    rules={[{ required: true, message: '请输入出库数量' }]}
                  >
                    <Input
                      placeholder="出库数量"
                      type="number"
                      style={{ width: 150, marginLeft: 8 }}
                    />
                  </Form.Item>
                  <Button
                    type="link"
                    onClick={() => remove(name)}
                    style={{ marginLeft: 8 }}
                  >
                    删除
                  </Button>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加出库明细
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
          保存
        </Button>
        <Button onClick={() => navigate('/storehouse-outbound')}>取消</Button>
      </Form.Item>
    </Form>
  );
};

export default StorehouseOutboundForm;
