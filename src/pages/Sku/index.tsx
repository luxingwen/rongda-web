import { getProductOptions } from '@/services/product';
import { addSku, deleteSku, getSkus, updateSku } from '@/services/sku';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Tag,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

const { Option } = Select;

const SkuManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSku, setEditingSku] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [productOptions, setProductOptions] = useState([]);

  useEffect(() => {
    fetchProductOptions();
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

  const handleAddSku = () => {
    setEditingSku(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSku = (record) => {
    setEditingSku(record);
    form.setFieldsValue(record);
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
      if (editingSku) {
        await updateSku({ ...editingSku, ...values });
        message.success('更新成功');
      } else {
        await addSku(values);
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
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '单位', dataIndex: 'unit', key: 'unit', hideInSearch: true },
    { title: '数量', dataIndex: 'num', key: 'num', hideInSearch: true },
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

  return (
    <div>
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
            name="product_uuid"
            label="产品"
            rules={[{ required: true, message: '请选择产品' }]}
          >
            <Select placeholder="请选择产品">
              {productOptions.map((product) => (
                <Option key={product.uuid} value={product.uuid}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="num"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SkuManagement;
