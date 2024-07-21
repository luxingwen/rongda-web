// src/pages/PurchaseOrderManagement.jsx
import React, { useState, useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import {PageContainer} from '@ant-design/pro-components';
import { Button, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPurchaseOrders, deletePurchaseOrder } from '@/services/purchase_order';
import { EyeOutlined } from '@ant-design/icons';
import { render } from 'react-dom';

const PurchaseOrderManagement = () => {
  const navigate = useNavigate();
  const actionRef = useRef();

  const handleDeleteOrder = async (id) => {
    try {
      await deletePurchaseOrder({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'blue' : status === 2 ? 'green' : status === 3 ? 'red' : 'gray'}>
      {status === 1 ? '待处理' : status === 2 ? '已处理' : status === 3 ? '已取消' : '已完成'}
    </Tag>
  );

  const handleViewDetail = (record) => {
    if(record.order_type === "1") {
    navigate(`/purchase/order/detail/${record.order_no}`);
    } else {
      navigate(`/purchase/order/detail-spot/${record.order_no}`);
    }
  };

  const handleEditOrder = (record) => {
    message.info('还未实现,暂不支持编辑');
    return;
    navigate(`/purchase/order/edit/${record.uuid}`);
  };

  const columns = [
    { title: '采购单号', dataIndex: 'order_no', key: 'order_no',  width: 300, },
    { title: '标题', dataIndex: 'title', key: 'title' },
    {title:'订单类型', dataIndex:'order_type', key:'order_type', hideInSearch:true, render: (_, record) => (
      <Tag color={record.order_type === "1" ? 'green' : 'blue'}>
        {record.order_type === "1" ? '期货' : '现货'}
      </Tag>
    ),},
    { title: '客户', dataIndex: 'customer_uuid', key: 'customer_uuid', hideInSearch: true, render: (_, record) => record.customer_info?.name },
    { title: '供应商', dataIndex: 'supplier_uuid', key: 'supplier_uuid', hideInSearch: true, render: (_, record) => record.supplier.name },
    { title: '采购日期', dataIndex: 'date', key: 'date', hideInSearch: true },
    { title: '起运地', dataIndex: 'departure', key: 'departure', hideInSearch: true },
    { title: '目的地', dataIndex: 'destination', key: 'destination', hideInSearch: true },
    { title: '定金金额', dataIndex: 'deposit_amount', key: 'deposit_amount', hideInSearch: true },
    { title: '定金比例', dataIndex: 'deposit_ratio', key: 'deposit_ratio', hideInSearch: true },
    { title: '预计装船日期', dataIndex: 'estimated_shipping_date', key: 'estimated_shipping_date', hideInSearch: true },
    { title: '采购人', dataIndex: 'purchaser', key: 'purchaser', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
          <Button icon={<EditOutlined />} onClick={() => handleEditOrder(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteOrder(record.order_no)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchPurchaseOrders = async (params) => {
    try {
      const response = await getPurchaseOrders(params);
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
        request={fetchPurchaseOrders}
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
          <Button key="button" icon={<PlusOutlined />} onClick={() => navigate('/purchase/order/add-futures')} type="primary">
            添加采购单(期货)
          </Button>,
          <Button key="button" icon={<PlusOutlined />} onClick={() => navigate('/purchase/order/add-spot')} style={{color: "green"}}>
          添加采购单(现货)
        </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default PurchaseOrderManagement;
