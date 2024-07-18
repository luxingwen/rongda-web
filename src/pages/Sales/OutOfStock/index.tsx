// src/pages/SalesOutOfStockManagement.jsx
import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Popconfirm, message, Tag } from 'antd';
import { history } from '@umijs/max';
import {
  getSalesOutOfStocks,
  deleteSalesOutOfStock,
} from '@/services/sales_out_of_stock';

const SalesOutOfStockManagement = () => {

  const actionRef = useRef();

  const handleDeleteOutOfStock = async (id) => {
    try {
      await deleteSalesOutOfStock({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'red' : 'green'}>{status === 1 ? '未出库' : '已出库'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '出库日期', dataIndex: 'out_of_stock_date', key: 'out_of_stock_date' },
    { title: '销售单号', dataIndex: 'sales_order_no', key: 'sales_order_no' },
    { title: '客户UUID', dataIndex: 'customer_uuid', key: 'customer_uuid', hideInSearch: true },
    { title: '批次号', dataIndex: 'batch_no', key: 'batch_no', hideInSearch: true },
    { title: '登记人', dataIndex: 'registrant', key: 'registrant', hideInSearch: true },
    { title: '仓库UUID', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', hideInSearch: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EyeOutlined />}
            onClick={() => history.push(`/sales/outbound/detail/${record.uuid}`)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => history.push(`/sales/outbound/edit/${record.uuid}`)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteOutOfStock(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchSalesOutOfStocks = async (params) => {
    try {
      const response = await getSalesOutOfStocks(params);
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
        request={fetchSalesOutOfStocks}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={() => history.push('/sales/outbound/add')} type="primary">
            添加出库
          </Button>,
        ]}
      />
    </div>
  );
};

export default SalesOutOfStockManagement;
