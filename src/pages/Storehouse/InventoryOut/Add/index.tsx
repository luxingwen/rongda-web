import { getProductOptions, getProductSkuOptions } from '@/services/product';
import { getStorehouseOptions } from '@/services/storehouse';
import { addOutbound } from '@/services/storehouse_outbound';
import { Button, Form, Input, message, Select, Table, Modal, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSalesOrderOptions, getSalesOrderProductList } from '@/services/sales_order';
import { getStorehouseProductBySalesOrder } from '@/services/storehouse_product';
import { render } from 'react-dom';

const { Option } = Select;

const StorehouseOutboundForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [productForm] = Form.useForm();
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [salesOrderOptions, setSalesOrderOptions] = useState([]);
  const [salesOrderProductList, setSalesOrderProductList] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [storehouseUuid, setStorehouseUuid] = useState('');
  const [salesOrderUuid, setSalesOrderUuid] = useState('');
  const [currentSalesOrder, setCurrentSalesOrder] = useState(null);

  useEffect(() => {
    fetchStorehouseOptions();
    fetchSalesOrderOptions();
  }, []);

  useEffect(() => {
    if (salesOrderUuid && storehouseUuid) {
      fetchProductOptions();
    }
  }, [salesOrderUuid, storehouseUuid]);

  const fetchSalesOrderOptions = async () => {
    try {
      const response = await getSalesOrderOptions();
      if (response.code === 200) {
        setSalesOrderOptions(response.data);
      } else {
        message.error('获取销售订单选项失败');
      }
    } catch (error) {
      message.error('获取销售订单选项失败');
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

  const fetchProductOptions = async () => {
    try {
      const response = await getStorehouseProductBySalesOrder({ sales_order_no: salesOrderUuid, storehouse_uuid: storehouseUuid });

      if (response.code === 200) {
        setSalesOrderProductList(response.data);
        setDetailData(response.data.map((item, index) => ({
          ...item,
          key: index + 1,
          quantity: item.quantity || 0, // Set initial quantity if not already set
        })));
      } else {
        message.error('获取产品选项失败');
      }
    } catch (error) {
      message.error('获取产品选项失败');
    }
  };

  const handleSalesOrderChange = (value) => {
    setSalesOrderUuid(value);
    const currentSalesOrder = salesOrderOptions.find((order) => order.order_no === value);
    setCurrentSalesOrder(currentSalesOrder);
    fetchProductOptions();
  };

  const handleAddDetail = () => {
    setModalVisible(true);
    setIsEdit(false);
    productForm.resetFields();
  };

  const handleSelectCurrentProduct = (value) => {
    const currentProduct = salesOrderProductList.find(
      (product) => product.uuid === value
    );
    setCurrentProduct(currentProduct);
    productForm.setFieldsValue({
      sku_uuid: currentProduct.sku?.uuid,
      sku_code: currentProduct.sku?.code,
      sku_spec: currentProduct.sku?.specification,
      quantity: currentProduct.quantity,
    });
  };

  const handleProductSubmit = () => {
    productForm.validateFields().then((values) => {
      if (isEdit) {
        const updatedDetailData = detailData.map((item) =>
          item.uuid === values.product_uuid ? { ...item, ...values } : item
        );
        setDetailData(updatedDetailData);
      } else {
        const isExist = detailData.some(
          (item) => item.uuid === values.product_uuid
        );

        if (!isExist) {
          values.key = detailData.length + 1;

          const product = salesOrderProductList.find(
            (product) => product.uuid === values.product_uuid
          );

          setDetailData([...detailData, product]);
        } else {
          message.error('商品已存在');
        }
      }

      setModalVisible(false);
      productForm.resetFields();
    }).catch(() => {
      message.error('验证失败');
    });
  };

  const renderProductName = (uuid) => {
    const product = salesOrderProductList.find(
      (product) => product.product_uuid === uuid
    );
    return product?.product?.name;
  };

  const handleSave = (row) => {
    const newData = [...detailData];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      setDetailData(newData);
    } else {
      newData.push(row);
      setDetailData(newData);
    }
  };

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    return (
      <td {...restProps}>
        {editable ? (
          <Form.Item
            name={[record.key, dataIndex]} // Ensure unique name for each field
            style={{ margin: 0 }}
            initialValue={record[dataIndex]} // Set initial value
            rules={[{ required: true, message: `${title} 是必填项` }]}
          >
            <Input onBlur={(e) => handleSave({ ...record, [dataIndex]: e.target.value })} />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const detailColumns = [
    {
      title: '商品名称',
      dataIndex: 'product_uuid',
      key: 'product_uuid',
      render: renderProductName,
    },
    { title: 'SKU代码', dataIndex: 'sku_code', key: 'sku_code', render: (_, record) => record.sku?.code },
    { title: '规格', dataIndex: 'sku_spec', key: 'sku_spec', render: (_, record) => record.sku?.specification },
    { title: '入库日期', dataIndex: 'in_date', key: 'in_date',  },
    { title: '库存天数', dataIndex: 'stock_days', key: 'stock_days',   },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no', render: (_, record) => record.cabinet_no  },
    { title: '国家', dataIndex: 'country', key: 'country', render: (_, record) => record.sku?.country  },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no', render: (_, record) => record.sku?.factory_no },
    { title: '箱数', dataIndex: 'box_num', key: 'box_num',  editable: true, },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      editable: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {/* <Button type="link" onClick={() => handleEditDetail(record)}>
            编辑
          </Button> */}
          <Button type="link" onClick={() => handleDeleteDetail(record.uuid)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleEditDetail = (record) => {
    setCurrentProduct(record);
    setModalVisible(true);
    setIsEdit(true);
    productForm.setFieldsValue(record);
  };

  const handleDeleteDetail = (key) => {
    setDetailData(detailData.filter((item) => item.uuid !== key));
  };

  const handleFinish = async (values) => {
    try {
      values.status = parseInt(values.status, 10);

      values.sales_order_product_type = currentSalesOrder.order_type;
      values.customer_uuid = currentSalesOrder.customer_uuid;

      values.detail = detailData.map((item) => ({
        ...item,
        quantity: parseInt(item.quantity, 10),
      }));

      const res = await addOutbound(values);
      if (res.code === 200) {
        message.success('添加成功');
        navigate('/storehouse/inventory/out');
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const mergedColumns = detailColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item
        name="sales_order_no"
        label="销售订单"
        rules={[{ required: true, message: '请选择销售订单' }]}
      >
        <Select
          showSearch
          allowClear
          onChange={handleSalesOrderChange}
          placeholder="请选择销售订单"
        >
          {salesOrderOptions.map((order) => (
            <Option key={order.order_no} value={order.order_no}>
              {order.title} - {order.order_no}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="storehouse_uuid"
        label="仓库"
        rules={[{ required: true, message: '请选择仓库' }]}
      >
        <Select onChange={(value) => setStorehouseUuid(value)} placeholder="请选择仓库">
          {storehouseOptions.map((storehouse) => (
            <Option key={storehouse.uuid} value={storehouse.uuid}>
              {storehouse.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="outbound_date" label="出库日期">
        <Input type="date" />
      </Form.Item>
      <Form.Item
        name="detail"
        label="出库明细"
        rules={[{ required: false, message: '请填写出库明细' }]}
      >
        <Button
          type="dashed"
          onClick={handleAddDetail}
          style={{ width: '100%', marginBottom: 16 }}
        >
          <PlusOutlined /> 添加出库明细
        </Button>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={detailData}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
          rowKey="key"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
          保存
        </Button>
        <Button onClick={() => navigate('/storehouse-outbound')}>
          取消
        </Button>
      </Form.Item>
      <Modal
        title={isEdit ? "编辑出库明细" : "添加出库明细"}
        visible={modalVisible}
        onOk={handleProductSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={productForm} layout="vertical">
          <Form.Item
            name="product_uuid"
            label="商品名称"
            rules={[{ required: true, message: '请选择商品名称' }]}
          >
            <Select
              onChange={handleSelectCurrentProduct}
              placeholder="请选择商品名称"
            >
              {salesOrderProductList.map((product) => (
                <Option key={product.uuid} value={product.uuid}>
                  {product.product?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="sku_uuid"
            label="SKU UUID"
            hidden
            rules={[{ required: false, message: '请输入SKU代码' }]}
          />
          <Form.Item
            name="sku_code"
            label="SKU代码"
            rules={[{ required: false, message: '请输入SKU代码' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="sku_spec"
            label="规格"
            rules={[{ required: false, message: '请输入规格' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="商品数量"
            rules={[{ required: true, message: '请输入商品数量' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
};

export default StorehouseOutboundForm;
