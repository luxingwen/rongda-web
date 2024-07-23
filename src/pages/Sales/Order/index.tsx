import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSalesOrders, deleteSalesOrder } from '@/services/sales_order';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

const SalesOrderManagement = () => {
  const [actionRef] = useState(useRef());
  const navigate = useNavigate();

  const handleAddOrder = () => {
    navigate('/sales/order/add');
  };

  const handleEditOrder = (record) => {
    navigate(`/sales/order/edit/${record.order_no}`);
  };


  const handleViewOrder = (record) => {
    navigate(`/sales/order/detail/${record.order_no}`);
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

  const renderStatus = (status) => (
    <Tag color={status === '待支付' ? 'blue' : status === '已支付' ? 'green' : status === '已发货' ? 'orange' : status === '已完成' ? 'cyan' : 'red'}>
      {status}
    </Tag>
  );

  const renderType = (type) => (
    <Tag color={type === '1' ? 'blue' : 'green'}>
      {type === '1' ? '期货订单' : '现货订单'}
    </Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '订单类型', dataIndex: 'order_type', key: 'order_type', render: renderType},
    { title: '订单日期', dataIndex: 'order_date', key: 'order_date', hideInSearch: true },
    { title: '客户', dataIndex: 'customer_uuid', key: 'customer_uuid', hideInSearch: true, render: (_, record) => record.customer?.name },
    { title: '定金', dataIndex: 'deposit_amount', key: 'deposit_amount', hideInSearch: true },
    { title: '订单金额', dataIndex: 'order_amount', key: 'order_amount', hideInSearch: true },
    { title: '税费', dataIndex: 'tax_amount', key: 'tax_amount', hideInSearch: true },
    { title: '销售人', dataIndex: 'salesman', key: 'salesman', hideInSearch: true },
    { title: '状态', dataIndex: 'order_status', key: 'order_status', render: renderStatus, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
           <Button icon={<EyeOutlined />} onClick={() => handleViewOrder(record)} style={{ marginRight: 8 }} />
          <Button icon={<EditOutlined />} onClick={() => handleEditOrder(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteOrder(record.order_no)} okText="是" cancelText="否">
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
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddOrder} type="primary">
            添加销售订单
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default SalesOrderManagement;
