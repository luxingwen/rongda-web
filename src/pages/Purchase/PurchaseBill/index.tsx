// src/pages/PurchaseBillManagement.jsx
import React, { useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import {
  getPurchaseBills,
  deletePurchaseBill,
} from '@/services/purchase_bill';
import { PageContainer } from '@ant-design/pro-components';

const PurchaseBillManagement = () => {

  const actionRef = useRef();

  const handleDeleteBill = async (id) => {
    try {
      await deletePurchaseBill({ uuid:id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };


  const renderStatus = (status) => {
    switch (status) {
      case 1:
        return '待处理';
      case 2:
        return '已处理';
      case 3:
        return '已取消';
      default:
        return '已完成';
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '采购单号', dataIndex: 'purchase_order_no', key: 'purchase_order_no' },
    { title: '入库单号', dataIndex: 'stock_in_order_no', key: 'stock_in_order_no', hideInSearch: true },
    { title: '供应商', dataIndex: 'supplier_uuid', key: 'supplier_uuid', hideInSearch: true, render:(_, record) => record.supplier?.name },
    { title: '银行账号', dataIndex: 'bank_account', key: 'bank_account', hideInSearch: true },
    { title: '银行名称', dataIndex: 'bank_name', key: 'bank_name', hideInSearch: true },
    { title: '银行账户名', dataIndex: 'bank_account_name', key: 'bank_account_name', hideInSearch: true },
    { title: '金额', dataIndex: 'amount', key: 'amount', hideInSearch: true },
    { title: '付款日期', dataIndex: 'payment_date', key: 'payment_date', hideInSearch: true },
    { title: '付款方式', dataIndex: 'payment_method', key: 'payment_method', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EyeOutlined />}
            onClick={() => history.push(`/purchase/settlement/detail/${record.uuid}`)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => history.push(`/purchase/settlement/edit/${record.uuid}`)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteBill(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchPurchaseBills = async (params) => {
    try {
      const response = await getPurchaseBills(params);
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
        request={fetchPurchaseBills}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={() => history.push('/purchase/settlement/add')} type="primary">
            添加采购结算
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default PurchaseBillManagement;
