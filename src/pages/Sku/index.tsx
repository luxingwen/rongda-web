import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, message, Popconfirm, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getProductOptions } from '@/services/product';
import { getProductCategoryOptions } from '@/services/product_category';
import { addSku, deleteSku, getSkus, updateSku } from '@/services/sku';
import {PageContainer} from '@ant-design/pro-components';

const { Option } = Select;

const SkuManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSku, setEditingSku] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [productOptions, setProductOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    fetchProductOptions();
    fetchProductCategoryOptions();
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

  const handleAddSku = () => {
    setEditingSku(null);
    setCurrentCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSku = (record) => {
    setEditingSku(record);
    setCurrentCategory(record.product_category_uuid);
    form.setFieldsValue({name:record.product?.name,  ...record});

    setIsModalVisible(true);
  };

  const handleDeleteSku = async (id) => {
    try {
      await deleteSku({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.num = parseInt(values.num);
      values.name = values.name[0]; // 使用数组的第一个值
      if (editingSku) {
        await updateSku({ ...editingSku, ...values });
        message.success('更新成功');
      } else {
       const res = await addSku(values);
        if (res.code !== 200) {
          message.error(res.message);
          return;
        }
        message.success('添加成功');
        fetchProductOptions();
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

  const renderStatus = (status) => (
    <Tag color={status ? 'green' : 'red'}>{status ? '活跃' : '禁用'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    {
      title: '产品',
      dataIndex: 'product_uuid',
      key: 'product_uuid',
      render: (_, record) => {
        return record.product.name;
      },
    },
    {
      title: '产品分类',
      dataIndex: 'product_category_uuid',
      key: 'product_category_uuid',
      render: (_, record) => {
        return record.product_category?.name;
      },
    },
    { title: 'SKU代码', dataIndex: 'code', key: 'code' },
    { title: '规格', dataIndex: 'specification', key: 'specification' },
    { title: '国家', dataIndex: 'country', key: 'country', hideInSearch: true },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no', hideInSearch: true },
    { title: '单位', dataIndex: 'unit', key: 'unit', hideInSearch: true },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditSku(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteSku(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchSkus = async (params) => {
    try {
      const response = await getSkus(params);
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

  const handleCategoryChange = (value) => {
    setCurrentCategory(value);
  };

  const renderDynamicFields = () => {
    const currentCategoryObject = categoryOptions.find(
      (category) => category.uuid === currentCategory
    );
    if (currentCategoryObject?.attribute === '1') {
      return (
        <Form.Item
          name="specification"
          label="规格"
          rules={[{ required: true, message: '请输入规格' }]}
        >
          <Input />
        </Form.Item>
      );
    } else {
      return (
        <Form.Item
          name="code"
          label="SKU代码"
          rules={[{ required: true, message: '请输入sku代码' }]}
        >
          <Input />
        </Form.Item>
      );
    }
  };

  return (
    <PageContainer>
      <ProTable
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={fetchSkus}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={handleAddSku}
            type="primary"
          >
            添加SKU
          </Button>,
        ]}
      />
      <Modal
        title={editingSku ? '编辑SKU' : '添加SKU'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Select
              placeholder="请输入产品名称"
              showSearch
              allowClear
              mode="tags"
              maxTagCount={1}
              tokenSeparators={[',']}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {productOptions.map((product) => (
                <Option key={product.uuid} value={product.name}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="product_category_uuid"
            label="产品分类"
            rules={[{ required: true, message: '请选择产品分类' }]}
          >
            <Select placeholder="请选择产品分类" onChange={handleCategoryChange}>
              {categoryOptions.map((category) => (
                <Option key={category.uuid} value={category.uuid}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {currentCategory && renderDynamicFields()}
          {currentCategory && (
            <>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="country"
                label="国家"
                rules={[{ required: true, message: '请输入国家' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="factory_no"
                label="厂号"
                rules={[{ required: true, message: '请输入厂号' }]}
              >
                <Input />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SkuManagement;
