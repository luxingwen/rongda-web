import { getSettlementCurrencyOptions } from '@/services/settlement_currency';
import {
  addSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from '@/services/supplier';
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
  Switch,
  Tag,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

const { Option } = Select;

const SupplierManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [currencyOptions, setCurrencyOptions] = useState([]);

  useEffect(() => {
    fetchSettlementCurrencyOptions();
  }, []);

  const fetchSettlementCurrencyOptions = async () => {
    try {
      const response = await getSettlementCurrencyOptions();
      if (response.code === 200) {
        setCurrencyOptions(response.data);
      } else {
        message.error('获取结算币种失败');
      }
    } catch (error) {
      message.error('获取结算币种失败');
    }
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSupplier = (record) => {
    setEditingSupplier(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteSupplier = async (id) => {
    try {
      await deleteSupplier({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.status = values.status ? 1 : 0;
      values.deposit_rate = parseFloat(values.deposit_rate);
      if (editingSupplier) {
        await updateSupplier({ ...editingSupplier, ...values });
        message.success('更新成功');
      } else {
        await addSupplier(values);
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
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', hideInSearch: true },
    {
      title: '国家厂号',
      dataIndex: 'country_no',
      key: 'country_no',
      hideInSearch: true,
    },
    {
      title: '联系方式',
      dataIndex: 'contact_info',
      key: 'contact_info',
      hideInSearch: true,
    },
    {
      title: '结算币种',
      dataIndex: 'settlement_currency',
      key: 'settlement_currency',
      hideInSearch: true,
      render: (_, record) => {
        return (<span>{record.settlement_currency_info.name}</span>);
      },
    },
    {
      title: '定金比率',
      dataIndex: 'deposit_rate',
      key: 'deposit_rate',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      hideInSearch: true,
      render: (status) => renderStatus(status),
    },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditSupplier(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteSupplier(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchSuppliers = async (params) => {
    try {
      const response = await getSuppliers(params);
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
        request={fetchSuppliers}
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
            onClick={handleAddSupplier}
            type="primary"
          >
            添加供应商
          </Button>,
        ]}
      />
      <Modal
        title={editingSupplier ? '编辑供应商' : '添加供应商'}
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
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country_no"
            label="国家厂号"
            rules={[{ required: true, message: '请输入国家厂号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact_info"
            label="联系方式"
            rules={[{ required: true, message: '请输入联系方式' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="settlement_currency"
            label="结算币种"
            rules={[{ required: true, message: '请选择结算币种' }]}
          >
            <Select>
              {currencyOptions.map((currency) => (
                <Option key={currency.uuid} value={currency.uuid}>
                  {currency.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="deposit_rate"
            label="定金比率"
            rules={[{ required: true, message: '请输入定金比率' }]}
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
    </div>
  );
};

export default SupplierManagement;
