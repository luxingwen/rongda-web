import React, { useState, useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Tag, Popconfirm, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { getAgreements, addAgreement, updateAgreement, deleteAgreement } from '@/services/agreement';

const { Option } = Select;

const AgreementManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [fileList, setFileList] = useState([]);

  const handleAddAgreement = () => {
    setEditingAgreement(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEditAgreement = (record) => {
    setEditingAgreement(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteAgreement = async (id) => {
    try {
      await deleteAgreement({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });

      fileList.forEach(file => {
        formData.append('attachment', file.originFileObj);
      });

      if (editingAgreement) {
        formData.append('uuid', editingAgreement.uuid);
        await updateAgreement(formData);
        message.success('更新成功');
      } else {
        await addAgreement(formData);
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

  const columns = [
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '标题', dataIndex: 'title', key: 'title', hideInSearch: true },
    { title: '创建人', dataIndex: 'creater', key: 'creater', hideInSearch: true },
    { title: '合同类型', dataIndex: 'type', key: 'type', hideInSearch: true },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', hideInSearch: true },
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditAgreement(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteAgreement(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchAgreements = async (params) => {
    try {
      const response = await getAgreements(params);
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

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  return (
    <div>
      <ProTable
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={fetchAgreements}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddAgreement} type="primary">
            添加合同
          </Button>,
        ]}
      />
      <Modal title={editingAgreement ? '编辑合同' : '添加合同'} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
        <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入合同标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true, message: '请输入日期' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        
          <Form.Item name="type" label="合同类型" rules={[{ required: true, message: '请选择合同类型' }]}>
            <Select placeholder="请选择合同类型">
              <Option value="1">销售合同</Option>
              <Option value="2">采购合同</Option>
              <Option value="3">服务合同</Option>
              <Option value="4">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="attachment" label="附件">
            <Upload
              multiple
              listType="picture"
              fileList={fileList}
              onChange={handleFileChange}
            >
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgreementManagement;
