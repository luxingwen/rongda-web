import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, message, Popconfirm, Select, Tag, Switch  } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getProductCategories, addProductCategory, updateProductCategory, deleteProductCategory } from '@/services/product_category';
import {PageContainer} from '@ant-design/pro-components';

const { Option } = Select;

const ProductCategoryManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCategory = (record) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteProductCategory({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.sort = parseInt(values.sort);
      if (editingCategory) {
        await updateProductCategory({ ...editingCategory, ...values });
        message.success('更新成功');
      } else {
        await addProductCategory(values);
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

  const renderStatus = (status) => (
    <Tag color={status ? 'green' : 'red'}>{status ? '启用' : '未启用'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid', width: 300,  },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '类别属性', dataIndex: 'attribute', key: 'attribute', hideInSearch: true, render: (attribute) => {
        switch(attribute) {
          case "1":
            return "规格";
          case "2":
            return "SKU";
          case "3":
            return "其他";
          default:
            return attribute;
        }
      }
    },

    { title: '排序', dataIndex: 'sort', key: 'sort', hideInSearch: true },
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
            onClick={() => handleEditCategory(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteCategory(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchProductCategories = async (params) => {
    try {
      const response = await getProductCategories(params);
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
    <PageContainer>
      <ProTable
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={fetchProductCategories}
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
            onClick={handleAddCategory}
            type="primary"
          >
            添加产品类别
          </Button>,
        ]}
      />
      <Modal
        title={editingCategory ? '编辑产品类别' : '添加产品类别'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" initialValues={{ attribute: "1" }}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="attribute"
            label="类别属性"
            rules={[{ required: true, message: '请选择类别属性' }]}
          >
            <Select placeholder="请选择类别属性">
              <Option value="1">规格</Option>
              <Option value="2">SKU</Option>
              <Option value="3">其他</Option>
            </Select>
          </Form.Item>
         
          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: false, message: '请输入排序' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProductCategoryManagement;
