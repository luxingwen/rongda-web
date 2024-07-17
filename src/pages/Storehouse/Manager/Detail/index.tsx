import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import ProTable from '@ant-design/pro-table';
import { getStorehouse } from '@/services/storehouse';
import {getStorehouseProducts} from '@/services/storehouse_product';
import { message, Spin, Card, Divider } from 'antd';
import { render } from 'react-dom';

const StorehouseDetail = () => {
  const { uuid } = useParams();
  const [storehouseInfo, setStorehouseInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStorehouseInfo(uuid);
  }, [uuid]);

  const fetchStorehouseInfo = async (uuid) => {
    try {
      const response = await getStorehouse({ uuid });
      if (response.code === 200) {
        setStorehouseInfo(response.data);
      } else {
        message.error('获取仓库详情失败');
      }
    } catch (error) {
      message.error('获取仓库详情失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '商品名称', dataIndex: 'product_uuid', key: 'product_uuid', render: (_, record) => record.product?.name },
    { title: 'SKU', dataIndex: 'sku_uuid', key: 'sku_uuid', render: (_, record) => record.sku?.name },
    { title: '库存数量', dataIndex: 'quantity', key: 'quantity' },
  ];

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="仓库详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="名称">{storehouseInfo?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="UUID">{storehouseInfo?.uuid}</ProDescriptions.Item>
          <ProDescriptions.Item label="地址">{storehouseInfo?.address}</ProDescriptions.Item>
          <ProDescriptions.Item label="联系人">{storehouseInfo?.contact_person}</ProDescriptions.Item>
          <ProDescriptions.Item label="联系电话">{storehouseInfo?.contact_phone}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            {storehouseInfo?.status === 1 ? '启用' : '未启用'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="类型">
            {storehouseInfo?.type === 1 ? '自有仓库' : '第三方仓库'}
          </ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="库存信息" bordered={false}>
          <ProTable
            columns={columns}
            rowKey="id"
            request={async (params) => {
              const response = await getStorehouseProducts({ ...params, storehouse_uuid: uuid });
              if (response.code !== 200) {
                message.error('获取库存信息失败');
                return { data: [], success: false, total: 0 };
              }
              return { data: response.data.data, success: true, total: response.data.total };
            }}
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            search={false}
            toolBarRender={false}
          />
        </Card>
      </Card>
    </Spin>
  );
};

export default StorehouseDetail;
