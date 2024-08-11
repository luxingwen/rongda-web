import {
  deleteSalesOrder,
  getSalesOrders,
  updateSalesOrderStatus,
} from '@/services/sales_order';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import ProTable from '@ant-design/pro-table';
import { Button, message, Modal, Popconfirm, Select, Tag } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const SalesOrderManagement = () => {
  const [actionRef] = useState(useRef());
  const navigate = useNavigate();

  const handleAddOrder = () => {
    navigate('/sales/order/add/new');
  };

  const handleEditOrder = (record) => {
    navigate(`/sales/order/edit/${record.order_no}`);
  };

  const handleViewOrder = (record) => {
    navigate(`/sales/order/detail/${record.order_no}`);
  };

  // 创建销售合同
  const handleCreateSalesOrderAgreement = (record) => {

    if (record.agreement_uuid !== '') {
      navigate(`/sales/agreement/edit/${record.agreement_uuid}`);
      return;
    }

    navigate(`/sales/agreement/create/${record.order_no}`);
  };

  const handleDeleteOrder = async (id) => {
    try {
      await deleteSalesOrder({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleChangeStatus = async (value, order_no) => {
    console.log(value, order_no);
    Modal.confirm({
      title: '确认更改状态',
      content: `你确定要将订单 ${order_no} 的状态更改为 "${value}" 吗？`,
      onOk: async () => {
        const response = await updateSalesOrderStatus({
          order_no,
          status: value,
        });
        if (response.code !== 200) {
          message.error('更改失败');
          return;
        }
        message.success('更改成功');
        actionRef.current?.reload();
      },
      onCancel() {
        console.log('取消');
      },
    });
  };

  const statusColors = {
    待处理: 'blue',
    处理中: 'orange',
    待确认: 'volcano',
    已确认: 'green',
    待付头款: 'cyan',
    已付头款: 'geekblue',
    待付尾款: 'purple',
    已付尾款: 'magenta',
    清关中: 'gold',
    已放行: 'lime',
    已完成: 'green',
  };

  const renderStatus = (status, record) => {
    if (status === '已完成' || status === '已发货' || status === '已取消') {
      return <Tag color={statusColors[status]}>{status}</Tag>;
    }

    return (
      <Select
        value={status}
        style={{ width: 120 }}
        onChange={(value) => handleChangeStatus(value, record.order_no)}
      >
        {Object.keys(statusColors).map((status) => (
          <Option
            key={status}
            value={status}
            style={{ color: statusColors[status] }}
          >
            {status}
          </Option>
        ))}
      </Select>
    );
  };

  const renderType = (type) => (
    <Tag color={type === '1' ? 'blue' : 'green'}>
      {type === '1' ? '期货订单' : '现货订单'}
    </Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    {
      title: '订单类型',
      dataIndex: 'order_type',
      key: 'order_type',
      render: renderType,
    },
    {
      title: '订单日期',
      dataIndex: 'order_date',
      key: 'order_date',
      hideInSearch: true,
    },
    {
      title: '客户',
      dataIndex: 'customer_uuid',
      key: 'customer_uuid',
      hideInSearch: true,
      render: (_, record) => record.customer_info?.name,
    },
    {
      title: '定金',
      dataIndex: 'deposit_amount',
      key: 'deposit_amount',
      hideInSearch: true,
    },
    {
      title: '订单金额',
      dataIndex: 'order_amount',
      key: 'order_amount',
      hideInSearch: true,
    },
    {
      title: '税费',
      dataIndex: 'tax_amount',
      key: 'tax_amount',
      hideInSearch: true,
    },
    {
      title: '销售人',
      dataIndex: 'salesman',
      key: 'salesman',
      hideInSearch: true,
      render: (_, record) => record.salesman_info?.name,
    },
    {
      title: '状态',
      dataIndex: 'order_status',
      key: 'order_status',
      render: renderStatus,
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<FileAddOutlined />}
            onClick={() => handleCreateSalesOrderAgreement(record)}
            style={{ marginRight: 8 }}
          >
            {' '}
            {record.agreement_uuid == '' ? '创建' : '编辑'}销售合同
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditOrder(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteOrder(record.order_no)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchSalesOrders = async (params) => {
    try {
      const response = await getSalesOrders(params);
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
        request={fetchSalesOrders}
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
            onClick={handleAddOrder}
            type="primary"
          >
            添加销售订单
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default SalesOrderManagement;
