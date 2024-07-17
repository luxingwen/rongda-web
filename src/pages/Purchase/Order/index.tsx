// src/pages/PurchaseOrderManagement.jsx
import React, { useState, useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPurchaseOrders, deletePurchaseOrder } from '@/services/purchase_order';
import { EyeOutlined } from '@ant-design/icons';

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
    navigate(`/purchase/order/detail/${record.order_no}`);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '采购单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '供应商', dataIndex: 'supplier_uuid', key: 'supplier_uuid', hideInSearch: true, render: (_, record) => record.supplier.name },
    { title: '采购日期', dataIndex: 'date', key: 'date', hideInSearch: true },
    { title: '定金', dataIndex: 'deposit', key: 'deposit', hideInSearch: true },
    { title: '税费', dataIndex: 'tax', key: 'tax', hideInSearch: true },
    { title: '总金额', dataIndex: 'total_amount', key: 'total_amount', hideInSearch: true },
    { title: '采购人', dataIndex: 'purchaser', key: 'purchaser', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
          <Button icon={<EditOutlined />} onClick={() => navigate(`/purchase/order/edit/${record.uuid}`)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteOrder(record.uuid)} okText="是" cancelText="否">
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
    <div>
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
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={() => navigate('/purchase/order/add')} type="primary">
            添加采购单
          </Button>,
        ]}
      />
    </div>
  );
};

export default PurchaseOrderManagement;
