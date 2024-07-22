import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getInbounds, deleteInbound } from '@/services/storehouseInbound';
import { getStorehouseOptions } from '@/services/storehouse';
import { EyeOutlined } from '@ant-design/icons';
import { render } from 'react-dom';
import {PageContainer} from '@ant-design/pro-components';

const StorehouseInboundManagement = () => {
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

  const handleAddInbound = () => {
    navigate('/storehouse/inventory/inbound-add');
  };

  const handleDeleteInbound = async (id) => {
    try {
      await deleteInbound({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };


  const handleViewDetail = (record) => {
    navigate(`/storehouse/inventory/inbound-detail/${record.inbound_order_no}`);
  };


  // 状态 1:待处理 2: 已处理 3:已取消 4:已完成

  const renderStatus = (status) => {
    let str = '';

    switch (status) {
      case 1:
        str = '待处理';
        break;
      case 2:
        str = '已处理';
        break;
      case 3:
        str = '已取消';
        break;
      case 4:
        str = '已完成';
        break;
      default:
        str = '未知状态';
    }

    return (
      <Tag color={status === 1 ? 'blue' : status === 2 ? 'green' : status === 3 ? 'red' : status === 4 ? 'gray' : 'gray'}>
        {str}
      </Tag>
    );
  }

  //入库类型 1:采购入库 2:退货入库 3:手工入库
  const renderInboundType = (inbound_type) => {
    let str = '';
  
    switch (inbound_type) {
      case "1":
        str = '采购入库';
        break;
      case "2":
        str = '退货入库';
        break;
      case "3":
        str = '手工入库';
        break;
      default:
        str = '未知类型';
    }
  
    return (
      <Tag color={inbound_type === "1" ? 'green' : inbound_type === "2" ? 'blue' : inbound_type === "3" ? 'red' : 'gray'}>
        {str}
      </Tag>
    );
  };
  

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '仓库', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', render: (_, record) => record.storehouse.name },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '入库类型', dataIndex: 'inbound_type', key: 'inbound_type', render: renderInboundType, hideInSearch: true },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no' },
    { title: '合同号', dataIndex: 'title', key: 'title' },
    { title: '发票号', dataIndex: 'title', key: 'title' },
    { title: '商品名称', dataIndex: 'product_name', key: 'product_name', render: (_, record) => record.product?.name },
    { title: 'SKU代码', dataIndex: 'sku_code', key: 'sku_code', render: (_, record) => record.sku?.code },
    { title: '规格', dataIndex: 'sku_spec', key: 'sku_spec', render: (_, record) => record.sku?.specification },
    { title: '商品数量', dataIndex: 'quantity', key: 'quantity'},
    { title: '商品箱数', dataIndex: 'box_num', key: 'box_num'},
    { title: '客户名称', dataIndex: 'customer', key: 'customer', render: (_, record) => record.customer_info?.name },
    { title: '国家', dataIndex: 'country', key: 'country', render: (_, record) => record.sku?.country },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no', render: (_, record) => record.sku?.factory_no },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    { title: '入库日期', dataIndex: 'inbound_date', key: 'inbound_date', hideInSearch: true },
    { title: '入库人', dataIndex: 'inbound_by', key: 'inbound_by', hideInSearch: true, render:(_, record) => record.inbound_by_user?.nickname },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
           <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteInbound(record.uuid)} okText="是" cancelText="否">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchInbounds = async (params) => {
    try {
      const response = await getInbounds(params);
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
        request={fetchInbounds}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={handleAddInbound} type="primary">
            添加入库
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default StorehouseInboundManagement;
