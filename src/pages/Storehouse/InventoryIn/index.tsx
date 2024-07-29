import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, message, Tag, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getInbounds, deleteInbound } from '@/services/storehouseInbound';
import { getStorehouseOptions } from '@/services/storehouse';
import { EyeOutlined } from '@ant-design/icons';
import { render } from 'react-dom';
import {PageContainer} from '@ant-design/pro-components';
import { getCustomerOptions } from '@/services/customer';
import { getProductOptions } from '@/services/product';

const { Option } = Select;

const StorehouseInboundManagement = () => {
  const navigate = useNavigate();
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const actionRef = useRef();
  const [customerOptions, setCustomerOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  useEffect(() => {
    fetchStorehouseOptions();
    fetchCustomerOptions();
    fetchProductOptions();
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

  const fetchProductOptions = async () => {
    try {
      const response = await getProductOptions();
      if (response.code === 200) {
        setProductOptions(response.data);
      } else {
        message.error('获取产品选项失败');
      }
    } catch (error) {
      message.error('获取产品选项失败');
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
    navigate(`/storehouse/inventory/inbound-detail-info/${record.uuid}`);
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
        str = '期货';
        break;
      case "2":
        str = '现货';
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
  

  const renderStorehouseSearch = () => {
    return (
      <Select
        allowClear
        showSearch
        placeholder="选择仓库"
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {storehouseOptions.map((item) => (
          <Option value={item.uuid} key={item.uuid}>
            {item.name}
          </Option>
        ))}
      </Select>
    );
  }

  const renderPurchaseOrderProductTypeSearch = () => {
    return (
      <Select
        allowClear
        showSearch
        placeholder="选择入库类型"
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        <Option value="1" key="1">
          期货
        </Option>
        <Option value="2" key="2">
          现货
        </Option>
      </Select>
    );
  }

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


  const renderProductSearch = () => {
    return (
      <Select
        allowClear
        showSearch
        placeholder="选择商品"
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {productOptions.map((item) => (
          <Option value={item.uuid} key={item.uuid}>
            {item.name}
          </Option>
        ))}
      </Select>
    );
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '仓库', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', render: (_, record) => record.storehouse.name,  renderFormItem: (_, { defaultRender }) => {
      return renderStorehouseSearch();
    },  },
    { title: '标题', dataIndex: 'title', key: 'title', hideInSearch: true },
    {
       title: '入库类型', dataIndex: 'purchase_order_product_type', key: 'purchase_order_product_type', render: renderInboundType, renderFormItem: (_, { defaultRender }) => {
        return renderPurchaseOrderProductTypeSearch();
      }
    },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no', hideInSearch: true },
    { title: '合同号', dataIndex: 'title', key: 'title', hideInSearch: true },
    { title: '发票号', dataIndex: 'title', key: 'title', hideInSearch: true },
    { title: '商品名称', dataIndex: 'product_uuid', key: 'product_uuid', render: (_, record) => record.product?.name, renderFormItem: (_, { defaultRender }) => {
      return renderProductSearch(); },  },
    { title: 'SKU代码', dataIndex: 'sku_code', key: 'sku_code', render: (_, record) => record.sku?.code, hideInSearch: true },
    { title: '规格', dataIndex: 'sku_spec', key: 'sku_spec', render: (_, record) => record.sku?.specification, hideInSearch: true },
    { title: '商品数量', dataIndex: 'quantity', key: 'quantity', hideInSearch: true },
    { title: '商品箱数', dataIndex: 'box_num', key: 'box_num', hideInSearch: true },
    { title: '客户名称', dataIndex: 'customer_uuid', key: 'customer_uuid', render: (_, record) => record.customer_info?.name, renderFormItem: (_, { defaultRender }) => {
      return renderCustomerSearch();
    },  },
    { title: '国家', dataIndex: 'country', key: 'country', render: (_, record) => record.sku?.country, hideInSearch: true },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no', render: (_, record) => record.sku?.factory_no, hideInSearch: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: renderStatus, hideInSearch: true, },
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
        scroll={{ x: 'max-content' }}
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
