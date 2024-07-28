// src/pages/StorehouseProductDetail.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import ProTable from '@ant-design/pro-table';
import { getStorehouseProductDetail, getStorehouseProductOpLogs } from '@/services/storehouse_product';
import { message } from 'antd';
import { render } from 'react-dom';

const StorehouseProductDetail = () => {
  const { uuid } = useParams();
  const [productDetail, setProductDetail] = useState(null);
  const actionRef = useRef();

  useEffect(() => {
    fetchProductDetail(uuid);
  }, [uuid]);

  const fetchProductDetail = async (uuid) => {
    try {
      const response = await getStorehouseProductDetail({ uuid });
      if (response.code === 200) {
        setProductDetail(response.data);
      } else {
        message.error('获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const renderQuantity = (record) => {
    // 如果是增加
    if (record.quantity > record.before_quantity) {
      return <span style={{ color: 'green' }}>{record.quantity}</span>;
    }
    // 如果是减少
    if (record.quantity < record.before_quantity) {
      return <span style={{ color: 'red' }}>{record.quantity}</span>;
    }
    return record.quantity;
  }


  const renderBoxNum = (record) => {
    // 如果是增加
    if (record.box_num > record.before_box_num) {
      return <span style={{ color: 'green' }}>{record.box_num}</span>;
    }
    // 如果是减少
    if (record.box_num < record.before_box_num) {
      return <span style={{ color: 'red' }}>{record.box_num}</span>;
    }
    return record.box_num;
  }


  const columns = [
    { title: '操作时间', dataIndex: 'created_at', key: 'created_at' },
    { title: '操作类型', dataIndex: 'op_type', key: 'op_type', render: (text) => {
      const types = { 1: '入库', 2: '出库', 3: '盘点', 4: '调拨', 5: '更新库存' };
      return types[text];
    }},
    { title: '操作前数量', dataIndex: 'before_quantity', key: 'before_quantity' },
    { title: '差异数量', dataIndex: 'op_quantity', key: 'op_quantity' },
    { title: '操作后数量', dataIndex: 'quantity', key: 'quantity', render:(_, record) => renderQuantity(record) },
    { title: '操作前箱数', dataIndex: 'before_box_num', key: 'before_box_num' },
    { title: '差异箱数', dataIndex: 'op_box_num', key: 'op_box_num' },
    { title: '操作后箱数', dataIndex: 'box_num', key: 'box_num', render:(_, record) => renderBoxNum(record) },
    { title: '操作人', dataIndex: ['op_by_user', 'name'], key: 'op_by', render:(_, record) => record.op_by_user?.nickname },
    { title: '操作描述', dataIndex: 'op_desc', key: 'op_desc' },
  ];

  const fetchOpLogs = async (params) => {
    try {
      const response = await getStorehouseProductOpLogs({ uuid: uuid, ...params });
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
      <ProDescriptions column={1} title="仓库物品详情">
        <ProDescriptions.Item label="仓库">{productDetail?.storehouse?.name}</ProDescriptions.Item>
        <ProDescriptions.Item label="客户">{productDetail?.customer_info?.name}</ProDescriptions.Item>
        <ProDescriptions.Item label="采购订单号">{productDetail?.purchase_order_no}</ProDescriptions.Item>
        <ProDescriptions.Item label="商品">{productDetail?.product?.name}</ProDescriptions.Item>
        <ProDescriptions.Item label="SKU">{productDetail?.sku?.code}</ProDescriptions.Item>
        <ProDescriptions.Item label="规格">{productDetail?.sku?.specification}</ProDescriptions.Item>
        <ProDescriptions.Item label="库存数量">{productDetail?.quantity}</ProDescriptions.Item>
        <ProDescriptions.Item label="库存箱数">{productDetail?.box_num}</ProDescriptions.Item>
      </ProDescriptions>
      <ProTable
        headerTitle="操作日志"
        columns={columns}
        actionRef={actionRef}
        request={fetchOpLogs}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={false}
        options={false}
      />
    </div>
  );
};

export default StorehouseProductDetail;
