import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Tag, Popconfirm, Select, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getStorehouses, addStorehouse, updateStorehouse, deleteStorehouse } from '@/services/storehouse';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { render } from 'react-dom';
import { PageContainer } from '@ant-design/pro-components';

const { Option } = Select;

const StorehouseManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStorehouse, setEditingStorehouse] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();
  const navigate = useNavigate();

  const handleAddStorehouse = () => {
    setEditingStorehouse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditStorehouse = (record) => {
    setEditingStorehouse(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteStorehouse = async (uuid) => {
    try {
      await deleteStorehouse({ uuid });
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
      if (editingStorehouse) {
        await updateStorehouse({ ...editingStorehouse, ...values });
        message.success('更新成功');
      } else {
        await addStorehouse(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };


  const handleViewStorehouse = (uuid) => {
    navigate(`/storehouse/detail/${uuid}`);
  }

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '启用' : '未启用'}</Tag>
  );

  const renderType = (type) => {
    switch (type) {
      case "1":
        return <Badge status="success" text="自有仓库" />;
      case "2":
        return <Badge status="processing" text="第三方仓库" />;
      default:
        return <Badge status="error" text="未知" />;
    }
  };
  

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid', width: 300,  },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', hideInSearch: true },
    { title: '联系人', dataIndex: 'contact_person', key: 'contact_person', hideInSearch: true },
    { title: '联系电话', dataIndex: 'contact_phone', key: 'contact_phone', hideInSearch: true },
    { title: '银行开户行', dataIndex: 'bank_name', key: 'bank_name', hideInSearch: true },
    { title: '银行账户', dataIndex: 'bank_account', key: 'bank_account', hideInSearch: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      hideInSearch: true,
      render: (status) => renderStatus(status),
    },
    { title: '类型', dataIndex: 'type', key: 'type', render: renderType, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
           <Button icon={<EyeOutlined />} onClick={() => handleViewStorehouse(record.uuid)} style={{ marginRight: 8 }} />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditStorehouse(record)}
            style={{ marginRight: 8 }}
          />

          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteStorehouse(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchStorehouses = async (params) => {
    try {
      const response = await getStorehouses(params);
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
        request={fetchStorehouses}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 'max-content' }}
        options={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={handleAddStorehouse}
            type="primary"
          >
            添加仓库
          </Button>,
        ]}
      />
      <Modal
        title={editingStorehouse ? '编辑仓库' : '添加仓库'}
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
            name="contact_phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="bank_name"
            label="开户行"
            rules={[{ required: false, message: '请输入银行开户行' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="bank_account"
            label="银行账户"
            rules={[{ required: false, message: '请输入银行账户' }]}
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
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Option value="1">自有仓库</Option>
              <Option value="2">第三方仓库</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StorehouseManagement;
