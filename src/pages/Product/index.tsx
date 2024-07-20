import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Tag, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/services/product';
import { getProductCategoryOptions } from '@/services/product_category';
import { getSupplierOptions } from '@/services/supplier';
import { render } from 'react-dom';

const { Option } = Select;

const ProductManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    fetchSupplierOptions();
    fetchProductCategoryOptions();
  }, []);

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

  const fetchProductCategoryOptions = async () => {
    try {
      const response = await getProductCategoryOptions();
      if (response.code === 200) {
        setCategoryOptions(response.data);
      } else {
        message.error('获取产品分类选项失败');
      }
    } catch (error) {
      message.error('获取产品分类选项失败');
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
    setIsModalVisible(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await deleteProduct({ uuid: id });
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };
  

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.price = parseFloat(values.price);
      values.cost = parseFloat(values.cost);
      values.status = values.status ? 1 : 0;
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...values });
        message.success('更新成功');
      } else {
        await addProduct(values);
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

  const columns = [

    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '类别', dataIndex: 'category', key: 'category', hideInSearch: true },
    { title: '描述', dataIndex: 'description', key: 'description', hideInSearch: true },
    { title: '价格', dataIndex: 'price', key: 'price', hideInSearch: true },
    { title: '成本', dataIndex: 'cost', key: 'cost', hideInSearch: true },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier', hideInSearch: true , render: (_, record) => record.supplier_info.name },
    { title: '创建者', dataIndex: 'creater', key: 'creater', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteProduct(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchProducts = async (params) => {
    try {
      const response = await getProducts(params);
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
        request={fetchProducts}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
            type="primary"
          >
            添加产品
          </Button>,
        ]}
      />
      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="类别"
            rules={[{ required: true, message: '请输入类别' }]}
          >
            <Select placeholder="请选择产品类别">
              {categoryOptions.map((category) => (
                <Option key={category.uuid} value={category.uuid}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="cost"
            label="成本"
            rules={[{ required: true, message: '请输入成本' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: '请选择供应商' }]}
          >
            <Select placeholder="请选择供应商">
              {supplierOptions.map((supplier) => (
                <Option key={supplier.uuid} value={supplier.uuid}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: false, message: '请输入描述' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="活跃状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
