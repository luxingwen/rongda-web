import React, { useEffect, useState } from 'react';
import { getStorehouseOptions } from '@/services/storehouse';
import { getStorehouseProducts } from '@/services/storehouse_product';
import { addInventoryCheck } from '@/services/storehouse_inventory_check';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Form, Input, message, Select, Popconfirm  } from 'antd';
import { EditableProTable } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const AddInventoryCheck = () => {
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [details, setDetails] = useState([]);
  const [form] = Form.useForm();
  const [editableKeys, setEditableRowKeys] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStorehouseOptions();
  }, []);

  const fetchStorehouseOptions = async () => {
    const response = await getStorehouseOptions();
    if (response.code === 200) {
      setStorehouseOptions(response.data);
    } else {
      message.error('获取仓库选项失败');
    }
  };

  const fetchStorehouseProducts = async (uuid) => {
    const response = await getStorehouseProducts({ storehouse_uuid: uuid, pageSize: 100 });
    if (response.code === 200) {
      const list = response.data.data.map((item, index) => ({
        ...item,
        key: `key-${index}`,
      }));
      setDetails(list);
    } else {
      message.error('获取商品选项失败');
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    values.status = parseFloat(values.status);
    values.detail = details.map(item => ({
      storehouse_product_uuid: item.uuid,
      product_uuid: item.product_uuid,
      sku_uuid: item.sku_uuid,
      quantity: parseFloat(item.quantity),
      box_num: parseFloat(item.box_num),
    }));
    const res = await addInventoryCheck(values);
    if (res.code === 200) {
      message.success('添加成功');
      navigate('/storehouse/inventory/check');
    } else {
      message.error('操作失败');
    }
  };


  const handleDetailChange = (newData) => {
    console.log("new data", newData);
    setDetails(newData);
  };


  const columns = [
    {
      title: '客户名称',
      dataIndex: 'customer_uuid',
      key: 'customer_uuid',
      render: (_, record) => record.customer_info?.name,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '商品名称',
      dataIndex: 'product_uuid',
      key: 'product_uuid',
      render: (_, record) => record.product?.name,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: 'SKU代码',
      dataIndex: 'sku_code',
      key: 'sku_code',
      render: (_, record) => record.sku?.code,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '规格',
      dataIndex: 'sku_spec',
      key: 'sku_spec',
      render: (_, record) => record.sku?.specification,
      editable: (text, record, index) => {
        return false;
      },
    },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no',
      editable: (text, record, index) => {
        return false;
      },
     },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      render: (_, record) => record.sku?.country,
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '厂号',
      dataIndex: 'factory_no',
      key: 'factory_no',
      render: (_, record) => record.sku?.factory_no,
      editable: (text, record, index) => {
        return false;
      },
    },
    { title: '入库日期', dataIndex: 'in_date', key: 'in_date',

      editable: (text, record, index) => {
        return false;
      },

     },
    { title: '库存天数', dataIndex: 'stock_days', key: 'stock_days',

      editable: (text, record, index) => {
        return false;
      },
     },
    { title: '商品数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '商品箱数', dataIndex: 'box_num', key: 'box_num' },
    {
      title: '操作',
      key: 'operation',
      valueType: 'option',
      render: (_, record: TableFormOrderItem, index, action) => [
        <a key="edit" onClick={() => action?.startEditable(record.key)}>
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定删除?"
          onConfirm={() => handleDeleteDetail(record.key)}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <Form form={form} layout="vertical">
        <Form.Item
          name="storehouse_uuid"
          label="仓库"
          rules={[{ required: true, message: '请选择仓库' }]}
        >
          <Select placeholder="请选择仓库" onChange={fetchStorehouseProducts}>
            {storehouseOptions.map(storehouse => (
              <Option key={storehouse.uuid} value={storehouse.uuid}>{storehouse.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="check_date"
          label="盘点日期"
          rules={[{ required: true, message: '请选择盘点日期' }]}
        >
          <Input type="date" />
        </Form.Item>
        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Option value="1">已盘点</Option>
            <Option value="2">未盘点</Option>
          </Select>
        </Form.Item>
        <EditableProTable
          rowKey="key"
          value={details}
          onChange={handleDetailChange}
          columns={columns}
          editableKeys={editableKeys}
          onEditableChange={setEditableRowKeys}
          recordCreatorProps={false}
        />
        <Form.Item>
          <Button type="primary" onClick={handleOk}>
            提交
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
};

export default AddInventoryCheck;
