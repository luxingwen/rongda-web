import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Tag, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAgents, addAgent, updateAgent, deleteAgent } from '@/services/agent';
import { history } from '@umijs/max';
import { EyeOutlined } from '@ant-design/icons';
import {getSysBankInfoOptions} from '@/services/sys/bankinfo';
import {PageContainer} from '@ant-design/pro-components';

const AgentManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [form] = Form.useForm();
  const [bankInfoOptions, setBankInfoOptions] = useState([]);
  const actionRef = useRef();


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

  const handleAddAgent = () => {
    // setEditingAgent(null);
    // form.resetFields();
    // setIsModalVisible(true);
    history.push('/resource/agent/add');
  };

  const handleEditAgent = (record) => {
    // setEditingAgent(record);
    // form.setFieldsValue(record);
    // setIsModalVisible(true);
    history.push(`/resource/agent/edit/${record.uuid}`);
  };

  const handleDeleteAgent = async (id) => {
    try {
      await deleteAgent({ uuid: id });
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
      values.rate = parseFloat(values.rate);
      if (editingAgent) {
        await updateAgent({ ...editingAgent, ...values });
        message.success('更新成功');
      } else {
        await addAgent(values);
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

  const handleViewDetail = (record) => {
    history.push(`/resource/agent/detail/${record.uuid}`);
  };

  const columns = [
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid', width: 300, },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', hideInSearch: true },
    { title: '联系方式', dataIndex: 'contact_info', key: 'contact_info', hideInSearch: true },
    { title: '开户行', dataIndex: 'bank_name', key: 'bank_name', hideInSearch: true },
    { title: '银行账号', dataIndex: 'bank_account', key: 'bank_account', hideInSearch: true },
    { title: '信用状态', dataIndex: 'credit_status', key: 'credit_status', hideInSearch: true },
    { title: '费率', dataIndex: 'rate', key: 'rate', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', hideInSearch: true, render: (status) => renderStatus(status) },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
           <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditAgent(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteAgent(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchAgents = async (params) => {
    try {
      const response = await getAgents(params);
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
        request={fetchAgents}
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
            onClick={handleAddAgent}
            type="primary"
          >
            添加代理
          </Button>,
        ]}
      />
      <Modal
        title={editingAgent ? '编辑代理' : '添加代理'}
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
            name="rate"
            label="费率"
            rules={[{ required: true, message: '请输入费率' }]}
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

export default AgentManagement;
