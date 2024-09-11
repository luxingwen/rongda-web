import {
  addEntrustOrder,
  deleteEntrustOrder,
  getEntrustOrders,
  updateEntrustOrder,
} from '@/services/entrust_order';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import ProTable from '@ant-design/pro-table';
import { history } from '@umijs/max';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Tag,
  Tooltip,
} from 'antd';
import { useRef, useState } from 'react';

const EntrustOrderManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();

  const handleAddOrder = () => {
    setEditingOrder(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditOrder = (record) => {
    setEditingOrder(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteOrder = async (id) => {
    try {
      await deleteEntrustOrder({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingOrder) {
        await updateEntrustOrder({ ...editingOrder, ...values });
        message.success('更新成功');
      } else {
        await addEntrustOrder(values);
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

  const handleDetail = (record) => {
    history.push(`/purchase/entrust/detail/${record.order_id}`);
  };

  const handleCreatePurchaseOrder = (record) => {
    // Logic for creating a purchase order
    if (record.purchase_order_no != '') {
      history.push(`/purchase/order/edit-futures/${record.purchase_order_no}`);
      return;
    }
    history.push(`/purchase/order/add-futures/${record.order_id}`);
  };

  const handleCreateSalesOrder = (record) => {
    if (record.sales_order_no != '') {
      history.push(`/sales/order/edit/${record.sales_order_no}`);
      return;
    }

    if (record.purchase_order_no == '') {
      message.error('请先创建采购订单');
      return;
    }

    history.push(`/sales/order/add/${record.purchase_order_no}`);
  };

  const renderStatus = (status) => (
    <Tag color={status ? 'green' : 'red'}>{status}</Tag>
  );

  const renderContent = (content) => (
    <Tooltip title={content}>
      <div
        style={{
          maxWidth: 200,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {content}
      </div>
    </Tooltip>
  );

  const columns = [
    { title: '订单ID', dataIndex: 'order_id', key: 'order_id' },
    { title: '用户UUID', dataIndex: 'user_uuid', key: 'user_uuid' },
    { title: '团队UUID', dataIndex: 'team_uuid', key: 'team_uuid' },
    {
      title: '采购订单',
      dataIndex: 'purchase_order_no',
      key: 'purchase_order_no',
    },
    { title: '销售订单', dataIndex: 'sales_order_no', key: 'sales_order_no' },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: renderContent,
    },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleDetail(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<FileAddOutlined />}
            onClick={() => handleCreatePurchaseOrder(record)}
            style={{ marginRight: 8 }}
          >
            {' '}
            {record.purchase_order_no == '' ? '创建' : '编辑'}期货采购订单
          </Button>
          <Button
            icon={<FileAddOutlined />}
            onClick={() => handleCreateSalesOrder(record)}
            style={{ marginRight: 8 }}
          >
            {' '}
            {record.sales_order_no == '' ? '创建' : '编辑'}期货销售订单
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditOrder(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteOrder(record.order_id)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchOrders = async (params) => {
    try {
      const response = await getEntrustOrders(params);
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
        rowKey="uuid"
        actionRef={actionRef}
        request={fetchOrders}
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
            onClick={handleAddOrder}
            type="primary"
          >
            添加订单
          </Button>,
        ]}
      />
      <Modal
        title={editingOrder ? '编辑订单' : '添加订单'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="order_id"
            label="订单ID"
            rules={[{ required: true, message: '请输入订单ID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="user_uuid"
            label="用户UUID"
            rules={[{ required: true, message: '请输入用户UUID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="team_uuid"
            label="团队UUID"
            rules={[{ required: true, message: '请输入团队UUID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value={1}>完成</Select.Option>
              <Select.Option value={0}>进行中</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default EntrustOrderManagement;
