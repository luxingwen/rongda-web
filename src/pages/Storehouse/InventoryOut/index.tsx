import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getOutbounds,
  addOutbound,
  updateOutbound,
  deleteOutbound,
  getProductOptions,
} from '@/services/storehouse_outbound';
import { getStorehouseOptions } from '@/services/storehouse';
import { getProductSkuOptions } from '@/services/product';
import { render } from 'react-dom';

const { Option } = Select;

const StorehouseOutboundManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOutbound, setEditingOutbound] = useState(null);
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

  const handleAddOutbound = () => {
    setEditingOutbound(null);
    form.resetFields();
    setSkuOptions({});
    setIsModalVisible(true);
  };

  const handleEditOutbound = (record) => {
    setEditingOutbound(record);
    form.setFieldsValue(record);
    if (record.detail) {
      record.detail.forEach((item, index) => {
        handleProductChange(item.product_uuid, index);
      });
    }
    setIsModalVisible(true);
  };

  const handleDeleteOutbound = async (id) => {
    try {
      await deleteOutbound({ id });
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
      if (editingOutbound) {
        await updateOutbound({ ...editingOutbound, ...values });
        message.success('更新成功');
      } else {
        await addOutbound(values);
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

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '已出库' : '未出库'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '仓库', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', render: (_, record) => record.storehouse.name },
    { title: '出库类型', dataIndex: 'outbound_type', key: 'outbound_type', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    { title: '出库日期', dataIndex: 'outbound_date', key: 'outbound_date', hideInSearch: true },
    { title: '出库人', dataIndex: 'outbound_by', key: 'outbound_by', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditOutbound(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteOutbound(record.id)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchOutbounds = async (params) => {
    try {
      const response = await getOutbounds(params);
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
        request={fetchOutbounds}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddOutbound} type="primary">
            添加出库
          </Button>,
        ]}
      />
      <Modal title={editingOutbound ? '编辑出库' : '添加出库'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
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
          <Form.Item name="outbound_type" label="出库类型" rules={[{ required: true, message: '请选择出库类型' }]}>
            <Select placeholder="请选择出库类型">
              <Option value="1">销售出库</Option>
              <Option value="2">退货出库</Option>
              <Option value="3">手工出库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select placeholder="请选择状态">
              <Option value="1">已出库</Option>
              <Option value="2">未出库</Option>
            </Select>
          </Form.Item>
          <Form.Item name="outbound_date" label="出库日期">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="detail" label="出库明细" rules={[{ required: true, message: '请填写出库明细' }]}>
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
                          onChange={(value) => handleProductChange(value, key)}
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
                          {(skuOptions[key] || []).map((sku) => (
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
                        <Input placeholder="出库数量" type="number" style={{ width: 150, marginLeft: 8 }} />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(name)} style={{ marginLeft: 8 }}>
                        删除
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加出库明细
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

export default StorehouseOutboundManagement;
