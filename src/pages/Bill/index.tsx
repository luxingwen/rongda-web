import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getBills, deleteBill } from '@/services/bill';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

const BillManagement = () => {
  const navigate = useNavigate();
  const actionRef = useRef();

  const handleAddBill = () => {
    navigate('/sales/bill/add');
  };

  const handleEditBill = (record) => {
    navigate(`/sales/bill/edit/${record.uuid}`);
  };

  const handleDeleteBill = async (id) => {
    try {
      await deleteBill({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleViewBill = (record) => {
    navigate(`/sales/bill/detail/${record.uuid}`);
  }

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'blue' : status === 2 ? 'green' : 'red'}>
      {status === 1 ? '待付款' : status === 2 ? '已付款' : '已取消'}
    </Tag>
  );

  const columns = [
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid',  width: 300, },
    { title: '发票公司', dataIndex: 'invoice_company', key: 'invoice_company' },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
    { title: '发票号', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: '发票代码', dataIndex: 'invoice_code', key: 'invoice_code', hideInSearch: true },
    { title: '发票类型', dataIndex: 'invoice_type', key: 'invoice_type', hideInSearch: true },
    { title: '开票日期', dataIndex: 'invoice_date', key: 'invoice_date', hideInSearch: true },
    { title: '金额', dataIndex: 'amount', key: 'amount', hideInSearch: true },
    { title: '税率', dataIndex: 'tax_rate', key: 'tax_rate', hideInSearch: true },
    { title: '税额', dataIndex: 'tax_amount', key: 'tax_amount', hideInSearch: true },
    { title: '价税合计', dataIndex: 'total_amount', key: 'total_amount', hideInSearch: true },
    { title: '付款日期', dataIndex: 'payment_date', key: 'payment_date', hideInSearch: true },
    { title: '付款方式', dataIndex: 'payment_method', key: 'payment_method', hideInSearch: true },
    { title: '备注', dataIndex: 'remark', key: 'remark', hideInSearch: true },
    { title: '财务人员', dataIndex: 'finance_staff', key: 'finance_staff', hideInSearch: true },
    { title: '财务审核日期', dataIndex: 'finance_audit_date', key: 'finance_audit_date', hideInSearch: true },
    { title: '财务审核状态', dataIndex: 'finance_audit_status', key: 'finance_audit_status', render: renderStatus, hideInSearch: true },
    { title: '财务审核备注', dataIndex: 'finance_audit_remark', key: 'finance_audit_remark', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
           <Button icon={<EyeOutlined />} onClick={() => handleViewBill(record)} style={{ marginRight: 8 }} />
          <Button icon={<EditOutlined />} onClick={() => handleEditBill(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteBill(record.uuid)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchBills = async (params) => {
    try {
      const response = await getBills(params);
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
        request={fetchBills}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddBill} type="primary">
            添加发票
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default BillManagement;
