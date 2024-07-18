// src/pages/PurchaseArrivalManagement.jsx
import React, { useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { EyeOutlined } from '@ant-design/icons';
import {
  getPurchaseArrivals,
  deletePurchaseArrival,
} from '@/services/purchase_arrival';

const PurchaseArrivalManagement = () => {
  const actionRef = useRef();

  const handleDeleteArrival = async (id) => {
    try {
      await deletePurchaseArrival({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '已处理' : '未处理'}</Tag>
  );

  const handleViewDetail = (record) => {
    history.push(`/purchase/arrival/detail/${record.uuid}`);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '采购单号', dataIndex: 'purchase_order_no', key: 'purchase_order_no' },
    { title: '批次', dataIndex: 'batch', key: 'batch', hideInSearch: true },
    { title: '到货日期', dataIndex: 'arrival_date', key: 'arrival_date', hideInSearch: true },
    { title: '验收人', dataIndex: 'acceptor', key: 'acceptor', hideInSearch: true },
    { title: '验收结果', dataIndex: 'acceptance_result', key: 'acceptance_result', hideInSearch: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    { title: '总金额', dataIndex: 'total_amount', key: 'total_amount', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
          <Button
            icon={<EditOutlined />}
            onClick={() => history.push(`/purchase/arrival/edit/${record.uuid}`)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteArrival(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchPurchaseArrivals = async (params) => {
    try {
      const response = await getPurchaseArrivals(params);
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
        request={fetchPurchaseArrivals}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={() => history.push('/purchase/arrival/add')} type="primary">
            添加到货
          </Button>,
        ]}
      />
    </div>
  );
};

export default PurchaseArrivalManagement;
