// src/pages/PurchaseOrderManagement.jsx
import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import {PageContainer} from '@ant-design/pro-components';
import { Button, Popconfirm, Tag, message, Select, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPurchaseOrders, deletePurchaseOrder,updatePurchaseOrderStatus } from '@/services/purchase_order';
import { EyeOutlined } from '@ant-design/icons';
import { render } from 'react-dom';
import { getCustomerOptions } from '@/services/customer';
import { getSupplierOptions } from '@/services/supplier';
const { Option } = Select;

const PurchaseOrderManagement = () => {
  const navigate = useNavigate();
  const actionRef = useRef();
  const [customerOptions, setCustomerOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);

  useEffect(() => {
    fetchCustomerOptions();
    fetchSupplierOptions();
  }, []);

  const fetchCustomerOptions = async () => {
    try {
      const response = await getCustomerOptions();
      if (response.code === 200) {
        setCustomerOptions(response.data);
      } else {
        message.error('获取客户选项失败');
      }
    } catch (error) {
      message.error('获取客户选项失败');
    }
  };

  const fetchSupplierOptions = async () => {
    try {
      const response = await getSupplierOptions();
      if (response.code === 200) {
        setSupplierOptions(response.data);
      } else {
        message.error('获取供应商选项失败');
      }
    } catch (error) {
      message.error('获取供应商选项失败');
    }
  }

  const handleDeleteOrder = async (id) => {
    try {
      await deletePurchaseOrder({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };


  const handleChangeStatus = async (value, order_no) => {
    Modal.confirm({
      title: '确认更改状态',
      content: `你确定要将订单 ${order_no} 的状态更改为 "${value}" 吗？`,
      onOk: async () => {
        const response = await updatePurchaseOrderStatus({ order_no, status: value });
        if (response.code !== 200) {
          message.error('更改失败');
          return;
        }
        message.success('更改成功');
        actionRef.current?.reload();
      },
      onCancel() {
        console.log('取消');
      },
    });
  }

  const statusColors = {
    '待处理': 'blue',
    '处理中': 'orange',
    '已处理': 'green',
    '已审核': 'purple',
    '已取消': 'red',
    '已完成': 'gold',
    '已入库': 'teal',
  };

  const renderStatus = (status, record) => {

    if(status === '已完成' || status === '已入库') {
      return (<Tag color={statusColors[status]}>{status}</Tag>);
    }

    return (
      <Select
        value={status}
        onChange={(value) => handleChangeStatus(value, record.order_no)}
      >
           {Object.keys(statusColors).map((status) => (
            <Option key={status} value={status} style={{ color: statusColors[status] }}>
              {status}
            </Option>
          ))}
      </Select>);

    };


    const renderCustomerSearch = () => {
      return (
        <Select
          allowClear
          showSearch
          placeholder="选择客户"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {customerOptions.map((item) => (
            <Option value={item.uuid} key={item.uuid}>
              {item.name}
            </Option>
          ))}
        </Select>
      );
    }

    const renderSupplierSearch = () => {
      return (
        <Select
          allowClear
          showSearch
          placeholder="选择供应商"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {supplierOptions.map((item) => (
            <Option value={item.uuid} key={item.uuid}>
              {item.name}
            </Option>
          ))}
        </Select>
      );
    };
  


  

  const handleViewDetail = (record) => {
    if(record.order_type === "1") {
    navigate(`/purchase/order/detail/${record.order_no}`);
    } else {
      navigate(`/purchase/order/detail-spot/${record.order_no}`);
    }
  };

  const handleEditOrder = (record) => {

    if(record.order_type === "1") {
      navigate(`/purchase/order/edit-futures/${record.order_no}`);
    } else {
      // message.info('还未实现,暂不支持编辑');
      navigate(`/purchase/order/edit-spot/${record.order_no}`);
    }

    // navigate(`/purchase/order/edit/${record.uuid}`);
  };

  const columns = [
    { title: '采购单号', dataIndex: 'order_no', key: 'order_no',  width: 300, },
    { title: '标题', dataIndex: 'title', key: 'title' },
    {title:'订单类型', dataIndex:'order_type', key:'order_type', hideInSearch:true, render: (_, record) => (
      <Tag color={record.order_type === "1" ? 'green' : 'blue'}>
        {record.order_type === "1" ? '期货' : '现货'}
      </Tag>
    ),},
    { title: '客户', dataIndex: 'customer_uuid', key: 'customer_uuid', render: (_, record) => record.customer_info?.name,  renderFormItem: (_, { defaultRender }) => {
      return renderCustomerSearch();
    },  },  
    { title: '供应商', dataIndex: 'supplier_uuid', key: 'supplier_uuid', render: (_, record) => record.supplier.name, renderFormItem: (_, { defaultRender }) => { return renderSupplierSearch(); }
    },
    { title: '采购日期', dataIndex: 'date', key: 'date', hideInSearch: true },
    { title: '起运地', dataIndex: 'departure', key: 'departure', hideInSearch: true },
    { title: '目的地', dataIndex: 'destination', key: 'destination', hideInSearch: true },
    { title: '定金金额', dataIndex: 'deposit_amount', key: 'deposit_amount', hideInSearch: true },
    { title: '定金比例', dataIndex: 'deposit_ratio', key: 'deposit_ratio', hideInSearch: true, render: (_, record) => `${record.deposit_ratio}%` },
    { title: '预计装船日期', dataIndex: 'estimated_shipping_date', key: 'estimated_shipping_date', hideInSearch: true },
    { title: '采购人', dataIndex: 'purchaser', key: 'purchaser', hideInSearch: true, render: (_, record) => record.purchaser_info?.nickname },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ marginRight: 8 }} />
           { record.status == "待处理" && <Button icon={<EditOutlined />} onClick={() => handleEditOrder(record)} style={{ marginRight: 8 }} /> }
          <Popconfirm title="确定删除吗?" onConfirm={() => handleDeleteOrder(record.order_no)} okText="是" cancelText="否">
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
    <PageContainer>
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
        scroll={{ x: 'max-content' }}
        options={false}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} onClick={() => navigate('/purchase/order/add-futures/new')} type="primary">
            添加采购单(期货)
          </Button>,
          <Button key="button" icon={<PlusOutlined />} onClick={() => navigate('/purchase/order/add-spot')} style={{color: "green"}}>
          添加采购单(现货)
        </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default PurchaseOrderManagement;
