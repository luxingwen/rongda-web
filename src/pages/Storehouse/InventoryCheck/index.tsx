import { getStorehouseOptions } from '@/services/storehouse';
import {
  deleteInventoryCheckDetail,
  getInventoryChecks,

} from '@/services/storehouse_inventory_check';
import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import ProTable from '@ant-design/pro-table';
import { Button, Popconfirm, Tag, message, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductOptions } from '@/services/product';
import { render } from 'react-dom';

const { Option } = Select;

const StorehouseInventoryCheckManagement = () => {
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const actionRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStorehouseOptions();
    fetchProductOptions();
  }, []);

  
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

  const handleDeleteInventoryCheck = async (record) => {
    try {
      const res = await deleteInventoryCheckDetail({ uuid: record.uuid, check_order_no: record.check_order_no });
      if (res.code !== 200) {
        message.error('删除失败: ' + res.message);
        return;
      }
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleAddCheck = () => {
    navigate('/storehouse/inventory/check-add');
  };

  const handleViewDetail = (record) => {
    navigate(`/storehouse/inventory/check-detail/${record.check_order_no}`);
  };

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


  const renderStatus = (record) => {
    // 盘盈
    if (record.difference_op === "1") {
      return (
        <Tag color="green">
          盘盈
        </Tag>
      );
    }

    // 盘亏
    if (record.difference_op === "2") {
      return (
        <Tag color="red">
          盘亏
        </Tag>
      );
    }

    return <Tag>正常</Tag>;
    
  };

  const renderQuantity = (record) => {
   // 盘盈
    if (record.difference_op === "1") {
      return (
        <Tag color="green">
          {record.quantity}
        </Tag>
      );
    }
    // 盘亏
    if (record.difference_op === "2") {
      return (
        <Tag color="red">
          { record.quantity}
        </Tag>
      );
    }
    return <Tag>{record.quantity}</Tag>;
  }


  const renderBoxNum = (record) => {
    // 盘盈
    if (record.difference_op === "1") {
      return (
        <Tag color="green">
          {record.box_num}
        </Tag>
      );
    }
    // 盘亏
    if (record.difference_op === "2") {
      return (
        <Tag color="red">
          { record.box_num}
        </Tag>
      );
    }
    return <Tag>{record.box_num}</Tag>;
  }

  const columns = [
    {
      title: '盘点单号',
      dataIndex: 'check_order_no',
      key: 'check_order_no',
      width: 300,
    },
    {
      title: '仓库',
      dataIndex: 'storehouse_uuid',
      key: 'storehouse_uuid',
      render: (_, record) => record.storehouse.name,
      renderFormItem: renderStorehouseSearch,
    },
    {
      title: '盘点日期',
      dataIndex: 'check_date',
      key: 'check_date',
      hideInSearch: true,
      render: (_, record) => record.storehouse_inventory_check?.check_date,
    },
    { title: '商品名称', dataIndex: 'product_uuid', key: 'product_uuid', render: (_, record) => record.product?.name, renderFormItem: renderProductSearch },
    { title: 'SKU代码', dataIndex: 'sku_code', key: 'sku_code', render: (_, record) => record.sku?.code, hideInSearch: true },
    { title: '规格', dataIndex: 'sku_spec', key: 'sku_spec', render: (_, record) => record.sku?.specification, hideInSearch: true },
    { title: '国家', dataIndex: 'country', key: 'country', render: (_, record) => record.sku?.country , hideInSearch: true },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no', render: (_, record) => record.sku?.factory_no , hideInSearch: true },
    { title: '商品数量', dataIndex: 'quantity', key: 'quantity', hideInSearch: true, render: (_, record) => renderQuantity(record) },
    { title: '商品箱数', dataIndex: 'box_num', key: 'box_num', hideInSearch: true, render: (_, record) => renderBoxNum(record) },

    { title: '入库日期', dataIndex: 'in_date', key: 'in_date', hideInSearch: true, render: (_, record) => record.storehouse_product?.in_date },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => renderStatus(record),
      hideInSearch: true,
    },
    {
      title: '盘点人',
      dataIndex: 'check_by',
      key: 'check_by',
      hideInSearch: true,
      render: (_, record) => record.check_by_user?.nickname,
    },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteInventoryCheck(record)}
            okText="是"
            cancelText="否"
          >
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
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={handleAddCheck}
            type="primary"
          >
            添加盘点
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default StorehouseInventoryCheckManagement;
