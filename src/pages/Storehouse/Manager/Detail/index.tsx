import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import ProTable from '@ant-design/pro-table';
import { getStorehouse } from '@/services/storehouse';
import { getStorehouseProducts } from '@/services/storehouse_product';
import { message, Spin, Card, Divider, Tag, Button, Popconfirm  } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteStorehouseProduct } from '@/services/storehouse_product';

const StorehouseDetail = () => {
  const { uuid } = useParams();
  const [storehouseInfo, setStorehouseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const actionRef = useRef();

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

  const renderStatus = (status) => {
    return status === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">未启用</Tag>;
  };

  const renderType = (type) => {
    return type === 1 ? <Tag color="blue">自有仓库</Tag> : <Tag color="purple">第三方仓库</Tag>;
  };

  const handleViewProduct = (id) => {
    navigate(`/storehouse/inventory/storehouse-product-detail/${id}`);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteStorehouseProduct({ uuid: id });
      message.success('删除成功');
      
    } catch (error) {
      message.error('删除失败');
    }
  };


  const columns = [
    { title: '商品名称', dataIndex: 'product_uuid', key: 'product_uuid', render: (_, record) => record.product?.name,  },
    { title: 'SKU代码', dataIndex: 'sku_code', key: 'sku_code', render: (_, record) => record.sku?.code, hideInSearch: true },
    { title: '规格', dataIndex: 'sku_spec', key: 'sku_spec', render: (_, record) => record.sku?.specification, hideInSearch: true },
    { title: '商品数量', dataIndex: 'quantity', key: 'quantity', hideInSearch: true },
    { title: '商品箱数', dataIndex: 'box_num', key: 'box_num', hideInSearch: true },
    { title: '客户名称', dataIndex: 'customer_uuid', key: 'customer_uuid', render: (_, record) => record.customer_info?.name,},
    { title: '国家', dataIndex: 'country', key: 'country', render: (_, record) => record.sku?.country , hideInSearch: true },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no', render: (_, record) => record.sku?.factory_no , hideInSearch: true },
    { title: '入库日期', dataIndex: 'in_date', key: 'in_date', hideInSearch: true },
    { title: '库存天数', dataIndex: 'stock_days', key: 'stock_days', hideInSearch: true },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
           <Button icon={<EyeOutlined />} onClick={() => handleViewProduct(record.uuid)} style={{ marginRight: 8 }} />
      

          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteProduct(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="仓库详情">

      <ProDescriptions  column={2} >
        <ProDescriptions.Item label="冷库名称" dataIndex="name">
          {storehouseInfo?.name}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="地址" dataIndex="address">
          {storehouseInfo?.address}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="联系人" dataIndex="contact_person">
          {storehouseInfo?.contact_person}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="联系电话" dataIndex="contact_phone">
          {storehouseInfo?.contact_phone}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="银行账户" dataIndex="bank_account">
          {storehouseInfo?.bank_account}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="开户行" dataIndex="bank_name">
          {storehouseInfo?.bank_name}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="类型" dataIndex="type">
          {renderType(storehouseInfo?.type)}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="签订合同时间" dataIndex="contract_date">
          {storehouseInfo?.contract_date}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="合同到期时间" dataIndex="contract_expire_date">
          {storehouseInfo?.contract_expire_date}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="合同到期提醒" dataIndex="contract_expire_remind">
          {storehouseInfo?.contract_expire_remind}
        </ProDescriptions.Item>
      </ProDescriptions>

        <Divider />
        <Card title="冷库费用价格" bordered={false}>
        <ProDescriptions layout='vertical' bordered column={10} >
        <ProDescriptions.Item label="冷藏费" dataIndex="cold_storage_fee">
          {storehouseInfo?.cold_storage_fee}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="装卸费/出入库费" dataIndex="loading_unloading_fee">
          {storehouseInfo?.loading_unloading_fee}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="处置费" dataIndex="disposal_fee">
          {storehouseInfo?.disposal_fee}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="搬运费" dataIndex="handling_fee">
          {storehouseInfo?.handling_fee}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="货转费" dataIndex="goods_transfer_fee">
          {storehouseInfo?.goods_transfer_fee}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="分选费" dataIndex="sorting_fee">
          {storehouseInfo?.sorting_fee}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="缠绕膜费" dataIndex="wrapping_film_fee">
          {storehouseInfo?.wrapping_film_fee}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="充电费" dataIndex="charging_fee">
          {storehouseInfo?.charging_fee}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="抄码费" dataIndex="reading_code_fee">
          {storehouseInfo?.reading_code_fee}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="打冷费" dataIndex="cold_fee">
          {storehouseInfo?.cold_fee}
        </ProDescriptions.Item>
      </ProDescriptions>
      </Card>

        {/* <Card title="库存信息" bordered={false}>
          <ProTable
            columns={columns}
            actionRef={actionRef}
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
        </Card> */}
      </Card>
    </Spin>
  );
};

export default StorehouseDetail;
