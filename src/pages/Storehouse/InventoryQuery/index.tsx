import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getStorehouseProducts,
  addStorehouseProduct,
  updateStorehouseProduct,
  deleteStorehouseProduct,
  getStorehouseOptions,
} from '@/services/storehouse_product';
import {getProductOptions, getProductSkuOptions} from '@/services/product';
import { render } from 'react-dom';

const { Option } = Select;

const StorehouseProductManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);
  const [form] = Form.useForm();
  const actionRef = useRef();

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

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditProduct = (record) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    // fetchProductSkuOptions({ uuid: record.product_uuid });
    setIsModalVisible(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteStorehouseProduct({ id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.quantity = parseInt(values.quantity);
      if (editingProduct) {
        await updateStorehouseProduct({ ...editingProduct, ...values });
        message.success('更新成功');
      } else {
        await addStorehouseProduct(values);
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

  const handleProductChange = async (value) => {
    try {
      const response = await getProductSkuOptions({ uuid: value });
      if (response.code === 200) {
        setSkuOptions(response.data);
        form.setFieldsValue({ sku_uuid: undefined });
      } else {
        message.error('获取SKU选项失败');
      }
    } catch (error) {
      message.error('获取SKU选项失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '仓库', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', render: (_, record) => record.storehouse.name },
    { title: '商品名称', dataIndex: 'product_uuid', key: 'product_uuid', render: (_, record) => record.product.name },
    { title: 'SKU', dataIndex: 'sku_uuid', key: 'sku_uuid', hideInSearch: true, render: (_, record) => record.sku.name },
    { title: '库存数量', dataIndex: 'quantity', key: 'quantity', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditProduct(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteProduct(record.id)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchStorehouseProducts = async (params) => {
    try {
      const response = await getStorehouseProducts(params);
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
        request={fetchStorehouseProducts}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddProduct} type="primary">
            添加仓库物品
          </Button>,
        ]}
      />
      <Modal title={editingProduct ? '编辑仓库物品' : '添加仓库物品'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
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
          <Form.Item name="product_uuid" label="商品" rules={[{ required: true, message: '请选择商品' }]}>
            <Select placeholder="请选择商品" onChange={handleProductChange}>
              {productOptions.map((product) => (
                <Option key={product.uuid} value={product.uuid}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sku_uuid" label="SKU" rules={[{ required: true, message: '请选择SKU' }]}>
            <Select placeholder="请选择SKU">
              {skuOptions.map((sku) => (
                <Option key={sku.uuid} value={sku.uuid}>
                  {sku.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="库存数量" rules={[{ required: true, message: '请输入库存数量' }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StorehouseProductManagement;
