import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getPurchaseArrivals,
  addPurchaseArrival,
  updatePurchaseArrival,
  deletePurchaseArrival,
  getProductOptions,
} from '@/services/purchase_arrival';
import { getProductSkuOptions } from '@/services/product';
import { getSupplierOptions } from '@/services/supplier';

const { Option } = Select;

const PurchaseArrivalManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingArrival, setEditingArrival] = useState(null);
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState({});
  const [form] = Form.useForm();
  const actionRef = useRef();

  useEffect(() => {
    fetchProductOptions();
    fetchSupplierOptions();
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

  const handleAddArrival = () => {
    setEditingArrival(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditArrival = (record) => {
    setEditingArrival(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteArrival = async (id) => {
    try {
      await deletePurchaseArrival({ id });
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

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '已处理' : '未处理'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '采购单号', dataIndex: 'purchase_order_no', key: 'purchase_order_no' },
    { title: '批次', dataIndex: 'batch', key: 'batch', hideInSearch: true },
    { title: '到货日期', dataIndex: 'arrival_date', key: 'arrival_date', hideInSearch: true },
    { title: '验收人', dataIndex: 'acceptor', key: 'acceptor', hideInSearch: true },
    { title: '验收结果', dataIndex: 'acceptance_result', key: 'acceptance_result', hideInSearch: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    { title: '总金额', dataIndex: 'total_amount', key: 'total_amount', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditArrival(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteArrival(record.id)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchPurchaseArrivals = async (params) => {
    try {
      const response = await getPurchaseArrivals(params);
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
        request={fetchPurchaseArrivals}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddArrival} type="primary">
            添加到货
          </Button>,
        ]}
      />
      <Modal title={editingArrival ? '编辑到货' : '添加到货'} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
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
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseArrivalManagement;
