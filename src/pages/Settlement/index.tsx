import React, { useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getSettlements, deleteSettlement } from '@/services/settlement';
import { history } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';

const SettlementList = () => {
  const actionRef = useRef();

  const handleDeleteSettlement = async (id) => {
    try {
      await deleteSettlement({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const renderStatus = (status) => (
    <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid', width: 300 },
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '采购订单号', dataIndex: 'purchase_order_no', key: 'purchase_order_no', hideInSearch: true },
    { title: 'PI合同号', dataIndex: 'pi_agreement_no', key: 'pi_agreement_no', hideInSearch: true },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no', hideInSearch: true },
    { title: '目的港口', dataIndex: 'destination_port', key: 'destination_port', hideInSearch: true },
    { title: 'ETA时间', dataIndex: 'eta_date', key: 'eta_date', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', hideInSearch: true, render: renderStatus },
    { title: '备注', dataIndex: 'remarks', key: 'remarks', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EyeOutlined />} onClick={() => history.push(`/settlement/detail/${record.uuid}`)} style={{ marginRight: 8 }} />
          <Button
            icon={<EditOutlined />}
            onClick={() => history.push(`/sales/settlement/edit/${record.uuid}`)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteSettlement(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchSettlements = async (params) => {
    try {
      const response = await getSettlements(params);
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
        request={fetchSettlements}
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
            onClick={() => history.push('/settlement/create')}
            type="primary"
          >
            添加结算单
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default SettlementList;
