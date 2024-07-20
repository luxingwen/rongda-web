import React, { useState, useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Switch, message, Tag, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getSysBankInfos, addSysBankInfo, updateSysBankInfo, deleteSysBankInfo } from '@/services/sys/bankinfo';
import { history } from '@umijs/max';

const { Option } = Select;

const SysBankInfoManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSysBankInfo, setEditingSysBankInfo] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();

  const handleAddSysBankInfo = () => {
    setEditingSysBankInfo(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSysBankInfo = (record) => {
    setEditingSysBankInfo(record);
    form.setFieldsValue({
      ...record,
      status: record.status === 1,
    });
    setIsModalVisible(true);
  };

  const handleDeleteSysBankInfo = async (id) => {
    try {
      await deleteSysBankInfo({ uuid: id });
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
      values.status = values.status ? 1 : 2; // Converting switch boolean to status integer
      if (editingSysBankInfo) {
        await updateSysBankInfo({ ...editingSysBankInfo, ...values });
        message.success('更新成功');
      } else {
        await addSysBankInfo(values);
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
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '启用' : '禁用'}</Tag>
  );

  const handleViewDetail = (record) => {
    history.push(`/resource/sysBankInfo/detail/${record.uuid}`);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '银行名称', dataIndex: 'name', key: 'name' },
    { title: '排序', dataIndex: 'sort', key: 'sort', hideInSearch: true },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', hideInSearch: true },
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', hideInSearch: true },
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
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditSysBankInfo(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteSysBankInfo(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchSysBankInfos = async (params) => {
    try {
      const response = await getSysBankInfos(params);
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
        request={fetchSysBankInfos}
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
            onClick={handleAddSysBankInfo}
            type="primary"
          >
            添加银行信息
          </Button>,
        ]}
      />
      <Modal
        title={editingSysBankInfo ? '编辑银行信息' : '添加银行信息'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="银行名称"
            rules={[{ required: true, message: '请输入银行名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
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

export default SysBankInfoManagement;
