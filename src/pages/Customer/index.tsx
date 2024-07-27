import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Tag, Popconfirm,Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/services/customer';
import { EyeOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import {getSysBankInfoOptions} from '@/services/sys/bankinfo';
import {PageContainer} from '@ant-design/pro-components';

const CustomerManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [bankInfoOptions, setBankInfoOptions] = useState([]);


  useEffect(() => {
    fetchBankInfoOptions();
  }, []);

  const fetchBankInfoOptions = async () => {
    try {
      const response = await getSysBankInfoOptions();
      if (response.code === 200) {
        setBankInfoOptions(response.data);
      } else {
        message.error('获取银行信息选项失败');
      }
    } catch (error) {
      message.error('获取银行信息选项失败');
    }
  };


  const handleAddCustomer = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCustomer = (record) => {
    setEditingCustomer(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await deleteCustomer(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.bank_name = values.bank_name[0];
      values.status = values.status ? 1 : 0;
      values.discount = parseFloat(values.discount);
      if (editingCustomer) {
        const res = await updateCustomer({ ...editingCustomer, ...values });
        if (res.code !== 200) {
          message.error(res.message);
          return;
        }
        message.success('更新成功');
      } else {
        const res = await addCustomer(values);
        if (res.code !== 200) {
          message.error(res.message);
          return;
        }
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

  const renderIsActive = (isActive) => (
    <Tag color={isActive ? 'green' : 'red'}>{isActive ? '活跃' : '禁用'}</Tag>
  );

  const handleViewDetail = (record) => {
    history.push(`/resource/customer/detail/${record.uuid}`);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid', width: 300,  },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', hideInSearch: true },
    { title: '联系方式', dataIndex: 'contact_info', key: 'contact_info', hideInSearch: true },
    { title: '开户行', dataIndex: 'bank_name', key: 'bank_name', hideInSearch: true },
    { title: '银行账号', dataIndex: 'bank_account', key: 'bank_account', hideInSearch: true },
    { title: '信用状态', dataIndex: 'credit_status', key: 'credit_status', hideInSearch: true },
    { title: '折扣', dataIndex: 'discount', key: 'discount', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', hideInSearch: true, render: renderIsActive },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditCustomer(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteCustomer(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchCustomers = async (params) => {
    try {
      const response = await getCustomers(params);
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
        request={fetchCustomers}
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
            onClick={handleAddCustomer}
            type="primary"
          >
            添加客户
          </Button>,
        ]}
      />
      <Modal
        title={editingCustomer ? '编辑客户' : '添加客户'}
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
            name="contact_person"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
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
            name="bank_account"
            label="银行账号"
            rules={[{ required: true, message: '请输入银行账号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="bank_name"
            label="开户行"
            rules={[{ required: true, message: '请输入开户行' }]}
          >
            <Select
            showSearch
            placeholder="请选择开户行"
            optionFilterProp="children"
            maxCount={1}
            mode='tags'
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
           >
            {bankInfoOptions.map((bankInfo) => (
              <Select.Option key={bankInfo.uuid} value={bankInfo.name}>
                {bankInfo.name}
              </Select.Option>
            ))}
          </Select>
          </Form.Item>
          <Form.Item
            name="credit_status"
            label="信用状态"
            rules={[{ required: true, message: '请输入信用状态' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="discount"
            label="折扣"
            rules={[{ required: true, message: '请输入折扣' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
            initialValue={true}
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default CustomerManagement;
