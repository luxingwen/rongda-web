import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getOutbounds,
  deleteOutbound,
} from '@/services/storehouse_outbound';
import { getStorehouseOptions } from '@/services/storehouse';
import { EyeOutlined } from '@ant-design/icons';

const StorehouseOutboundManagement = () => {
  const navigate = useNavigate();
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const actionRef = useRef();

  useEffect(() => {
    fetchStorehouseOptions();
  }, []);

  const fetchStorehouseOptions = async () => {
    try {
      const response = await getStorehouseOptions();
      if (response.code === 200) {
        setStorehouseOptions(response.data);
      } else {
        message.error('获取仓库选项失败');
      }
    } catch (error) {
      message.error('获取仓库选项失败');
    }
  };

  const handleAddOutbound = () => {
    navigate('/storehouse/inventory/outbound-add');
  };

  const handleDeleteOutbound = async (id) => {
    try {
      await deleteOutbound({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleViewDetail = (record) => {
    navigate(`/storehouse/inventory/outbound-detail/${record.outbound_order_no}`);
  };

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '已出库' : '未出库'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '仓库', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', render: (_, record) => record.storehouse.name },
    { title: '出库类型', dataIndex: 'outbound_type', key: 'outbound_type', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    { title: '出库日期', dataIndex: 'outbound_date', key: 'outbound_date', hideInSearch: true },
    { title: '出库人', dataIndex: 'outbound_by', key: 'outbound_by', hideInSearch: true, render: (_, record) => record.outbound_by_user?.nickname },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteOutbound(record.outbound_order_no)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchOutbounds = async (params) => {
    try {
      const response = await getOutbounds(params);
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
        request={fetchOutbounds}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddOutbound} type="primary">
            添加出库
          </Button>,
        ]}
      />
    </div>
  );
};

export default StorehouseOutboundManagement;
