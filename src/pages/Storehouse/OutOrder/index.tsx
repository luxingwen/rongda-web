import React, { useState, useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, Form, Input, Select, message, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {getStorehouseOutOrderDetails,deleteStorehouseOutOrder} from '@/services/storehouse_outbound/order';
import { history } from '@umijs/max';

const StorehouseOutboundOrderDetailManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();

  const handleAddDetail = () => {
    setEditingDetail(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditDetail = (record) => {
    setEditingDetail(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteDetail = async (id) => {
    try {
      // Replace with your delete API call
      await deleteStorehouseOutOrder({uuid:id});
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };



  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: '合同单号', dataIndex: 'outbound_order_no', key: 'outbound_order_no', hideInSearch: true, render:(_, record) => {
        return <p>{record.purchase_order_info.pi_agreement_no}</p>
    } },

    { title: '仓库', dataIndex: 'storehouse_uuid', key: 'storehouse_uuid', render:(_, record) => {

        return <p>{record.storehouse_info.name}</p>
    }
    },
    { title: '商品', dataIndex: 'product_uuid', key: 'product_uuid', render:(_, record) => {
        return <p>{record.product.name}</p>
    }
    },
    { title: 'SKU', dataIndex: 'sku_uuid', key: 'sku_uuid', render:(_, record) => {
        return <p>{record.sku.code}</p>
    }
    },
    { title: '规格', dataIndex: 'sku_uuid_spec', key: 'sku_uuid_spec', render:(_, record) => {
        return <p>{record.sku.specification}</p>
    }
    },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no' },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no', render:(_, record) => {
        return <p>{record.sku.factory_no}</p>
    }
    },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '客户', dataIndex: 'customer_uuid', key: 'customer_uuid', render:(_, record) => {
        return <p>{record.customer_info.name}</p>
    }
    },
    { title: '出库数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '箱数', dataIndex: 'box_num', key: 'box_num' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', hideInSearch: true },
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button onClick={()=> {
            history.push(`/sales/outbound/add-logistics/${record.outbound_order_no}`)
          }}>添加物流信息</Button>
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteDetail(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchDetails = async (params) => {
    try {
      // Replace with your fetch API call
      const response = await getStorehouseOutOrderDetails(params);
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
        request={fetchDetails}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 'max-content' }}
       
      />

    </PageContainer>
  );
};

export default StorehouseOutboundOrderDetailManagement;
