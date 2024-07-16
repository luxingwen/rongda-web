import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getInbounds, addInbound, updateInbound, deleteInbound, getProductOptions } from '@/services/storehouseInbound';
import { getStorehouseOptions } from '@/services/storehouse';
import { getProductSkuOptions } from '@/services/product';
import { render } from 'react-dom';

const { Option } = Select;

const StorehouseInboundManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInbound, setEditingInbound] = useState(null);
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState({});
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

  const handleAddInbound = () => {
    setEditingInbound(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditInbound = (record) => {
    setEditingInbound(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteInbound = async (id) => {
    try {
      await deleteInbound({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
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
      if (editingInbound) {
        await updateInbound({ ...editingInbound, ...values });
        message.success('更新成功');
      } else {
        await addInbound(values);
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
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '已入库' : '未入库'}</Tag>
  );

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

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '仓库', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', render: (_, record) => record.storehouse.name },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '入库类型', dataIndex: 'inbound_type', key: 'inbound_type', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    { title: '入库日期', dataIndex: 'inbound_date', key: 'inbound_date', hideInSearch: true },
    { title: '入库人', dataIndex: 'inbound_by', key: 'inbound_by', hideInSearch: true, render:(_, record) => record.inbound_by_user?.nickname },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditInbound(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteInbound(record.inbound_order_no)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchInbounds = async (params) => {
    try {
      const response = await getInbounds(params);
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
        request={fetchInbounds}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddInbound} type="primary">
            添加入库
          </Button>,
        ]}
      />
      <Modal title={editingInbound ? '编辑入库' : '添加入库'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
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
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="inbound_type" label="入库类型" rules={[{ required: true, message: '请选择入库类型' }]}>
            <Select placeholder="请选择入库类型">
              <Option value="1">采购入库</Option>
              <Option value="2">退货入库</Option>
              <Option value="3">手工入库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select placeholder="请选择状态">
              <Option value="1">已入库</Option>
              <Option value="2">未入库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="inbound_date" label="入库日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="detail" label="入库明细" rules={[{ required: true, message: '请填写入库明细' }]}>
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
                        <Select placeholder="请选择SKU" style={{ width: 150, marginLeft: 8 }}>
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
                        rules={[{ required: true, message: '请输入入库数量' }]}
                      >
                        <Input placeholder="入库数量" type="number" style={{ width: 150, marginLeft: 8 }} />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(name)} style={{ marginLeft: 8 }}>
                        删除
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加入库明细
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StorehouseInboundManagement;
