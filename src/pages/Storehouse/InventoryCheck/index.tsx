import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import {
  getInventoryChecks,
  deleteInventoryCheck,
} from '@/services/storehouse_inventory_check';
import { getStorehouseOptions } from '@/services/storehouse';
import { PageContainer } from '@ant-design/pro-components';

const StorehouseInventoryCheckManagement = () => {
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const actionRef = useRef();
  const navigate = useNavigate();

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

  const handleDeleteInventoryCheck = async (id) => {
    try {
      await deleteInventoryCheck({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleAddCheck = () => {
    navigate('/storehouse/inventory/check-add');
  }

  const handleViewDetail = (record) => {
    navigate(`/storehouse/inventory/check-detail/${record.check_order_no}`);
  }

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '已盘点' : '未盘点'}</Tag>
  );

  const columns = [
    { title: '盘点单号', dataIndex: 'check_order_no', key: 'check_order_no', width: 300,  },
    { title: '仓库', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', render: (_, record) => record.storehouse.name },
    { title: '盘点日期', dataIndex: 'check_date', key: 'check_date', hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    { title: '盘点人', dataIndex: 'check_by', key: 'check_by', hideInSearch: true, render: (_, record) => record.check_by_user?.nickname },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
           <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteInventoryCheck(record.check_order_no)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchInventoryChecks = async (params) => {
    try {
      const response = await getInventoryChecks(params);
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
        request={fetchInventoryChecks}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddCheck} type="primary">
            添加盘点
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default StorehouseInventoryCheckManagement;
