import React, { useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getPaymentBills, deletePaymentBill } from '@/services/payment_bill';
import { history } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';

const PaymentBillList = () => {
  const actionRef = useRef();

  const handleDeletePaymentBill = async (id) => {
    try {
      await deletePaymentBill({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '待付款' : '已付款'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid', width: 300 },
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '合同号', dataIndex: 'agreement_no', key: 'agreement_no', hideInSearch: true },
    { title: 'PI合同号', dataIndex: 'pi_agreement_no', key: 'pi_agreement_no', hideInSearch: true },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no', hideInSearch: true },
    { title: '类型', dataIndex: 'type', key: 'type', hideInSearch: true },
    { title: '原币金额', dataIndex: 'original_amount', key: 'original_amount', hideInSearch: true },
    { title: '原币币种', dataIndex: 'original_currency', key: 'original_currency', hideInSearch: true },
    { title: '汇率', dataIndex: 'exchange_rate', key: 'exchange_rate', hideInSearch: true },
    { title: '应付金额', dataIndex: 'amount', key: 'amount', hideInSearch: true },
    { title: '实际付款金额', dataIndex: 'payment_amount', key: 'payment_amount', hideInSearch: true },
    { title: '未付金额', dataIndex: 'unpaid_amount', key: 'unpaid_amount', hideInSearch: true },
    { title: '可垫资额度', dataIndex: 'advance_amount', key: 'advance_amount', hideInSearch: true },
    { title: '是否垫资', dataIndex: 'is_advance', key: 'is_advance', hideInSearch: true, render: (isAdvance) => (isAdvance ? '是' : '否') },
    { title: '状态', dataIndex: 'status', key: 'status', hideInSearch: true, render: renderStatus },
    { title: '锁汇汇率', dataIndex: 'lock_exchange_rate', key: 'lock_exchange_rate', hideInSearch: true },
    { title: '锁汇开始日期', dataIndex: 'lock_exchange_start_date', key: 'lock_exchange_start_date', hideInSearch: true },
    { title: '锁汇结束日期', dataIndex: 'lock_exchange_end_date', key: 'lock_exchange_end_date', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EyeOutlined />} onClick={() => history.push(`/payment_bill/detail/${record.uuid}`)} style={{ marginRight: 8 }} />
          <Button
            icon={<EditOutlined />}
            onClick={() => history.push(`/sales/payment-bill/edit/${record.uuid}`)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeletePaymentBill(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchPaymentBills = async (params) => {
    try {
      const response = await getPaymentBills(params);
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
        request={fetchPaymentBills}
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
        //   <Button
        //     key="button"
        //     icon={<PlusOutlined />}
        //     onClick={() => history.push('/payment_bill/create')}
        //     type="primary"
        //   >
        //     添加支付账单
        //   </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default PaymentBillList;
