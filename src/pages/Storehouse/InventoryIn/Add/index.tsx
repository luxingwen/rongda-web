import {
  getAllPurchaseOrdersOptions,
  getPurchaseOrderProductList,
  getPurchaseOrdersInfo,
} from '@/services/purchase_order';
import { getStorehouseOptions } from '@/services/storehouse';
import { addInbound } from '@/services/storehouseInbound';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
} from 'antd';
import { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const StorehouseInboundForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [storehouseOptions, setStorehouseOptions] = useState([]);
  const [purchaseOrderOptions, setPurchaseOrderOptions] = useState([]);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState(null);
  const [purchaseOrderProductList, setPurchaseOrderProductList] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm] = Form.useForm();
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchStorehouseOptions();
    fetchPurchaseOrderOptions();
  }, []);

  const fetchPurchaseOrderOptions = async () => {
    try {
      const response = await getAllPurchaseOrdersOptions();
      if (response.code === 200) {
        setPurchaseOrderOptions(response.data);
      } else {
        message.error('获取采购单选项失败');
      }
    } catch (error) {
      message.error('获取采购单选项失败');
    }
  };

  const fetchPurchaseOrderProductList = async (uuid) => {
    try {
      const response = await getPurchaseOrderProductList({ uuid });
      if (response.code === 200) {
        setPurchaseOrderProductList(response.data);

        setDetailData(response.data.map((item, index) => ({ ...item, key: index + 1 })));

      } else {
        message.error('获取采购单商品列表失败');
      }
    } catch (error) {
      message.error('获取采购单商品列表失败');
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

  const fetchPurchaseOrderInfo = async (uuid) => {
    try {
      const response = await getPurchaseOrdersInfo({ uuid });
      if (response.code === 200) {
        const currentOrder = response.data;
        setCurrentPurchaseOrder(response.data);

        if (currentOrder.order_type === '1') {
          form.setFieldsValue({
            storehouse_uuid: currentOrder.estimated_warehouse,
          });
        } else {
          form.setFieldsValue({
            storehouse_uuid: currentOrder.actual_warehouse,
          });
        }
        fetchPurchaseOrderProductList(currentOrder.order_no);

        productForm.setFieldsValue({
          customer_name: currentOrder.customer_info?.name,
        });
      } else {
        message.error('获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败');
    }
  };

  const handlePuchaseOrderChange = (value) => {
    const currentOrder = purchaseOrderOptions.find(
      (order) => order.order_no === value,
    );

    if (currentOrder) {
      fetchPurchaseOrderInfo(value);
    }
  };

  const handleAddDetail = () => {
    setModalVisible(true);
    setIsEdit(false);
  };

  const handleSelectCurrentProduct = async (value) => {
    const currentProduct = purchaseOrderProductList.find(
      (product) => product.product_uuid === value,
    );
    setCurrentProduct(currentProduct);
    productForm.setFieldsValue({
      sku_uuid: currentProduct.sku_uuid,
      sku_code: currentProduct.sku?.code,
      sku_spec: currentProduct.sku?.specification,
      country: currentProduct.sku?.country,
      factory_no: currentProduct.sku?.factory_no,
      quantity: currentProduct.quantity,
      box_num: currentProduct.box_num,
      cabinet_no: currentProduct.cabinet_no,
    });
  };

  const handleSave = (row) => {

    const newData = [...detailData];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      const item = newData[index];

      const citem = purchaseOrderProductList.find( (product) => product.purchase_order_product_no === item.purchase_order_product_no);
      const quantity = parseInt(row.quantity);
      const box_num = parseInt(row.box_num);
      if (citem.quantity < quantity) {
        console.log("citem.quantity", quantity);
        row.quantity = citem.quantity;
      }

      if (citem.box_num < box_num) {
        row.box_num = citem.box_num;
      }

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

    const handleBlur = (e) => {
      const value = e.target.value;
     
      const updatedRecord = { ...record, [dataIndex]: value };
      const citem = purchaseOrderProductList.find(
        (product) => product.purchase_order_product_no === record.purchase_order_product_no
      );
      const quantity = parseInt(updatedRecord.quantity);
      const box_num = parseInt(updatedRecord.box_num);
  
      if (citem.quantity < quantity) {
        message.error('入库数量不能大于采购数量' + citem.quantity);
        e.target.focus();
      }
  
      if (citem.box_num < box_num) {
        message.error('入库箱数不能大于采购箱数' + citem.box_num);
        e.target.focus();

      }

  
      handleSave(updatedRecord);
    };

    return (
      <td {...restProps}>
        {editable ? (
          <Form.Item
            name={[record.key, dataIndex]} // Ensure unique name for each field
            style={{ margin: 0 }}
            initialValue={record[dataIndex]} // Set initial value
            rules={[{ required: true, message: `${title} 是必填项` }]}
          >
            <Input
              onBlur={handleBlur}
              
            />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const handleFinish = async (values) => {
    try {
      values.status = parseInt(values.status);
      values.customer_uuid = currentPurchaseOrder.customer_uuid;
      values.purchase_order_product_type = currentPurchaseOrder.order_type;
      values.detail = detailData.map((item) => ({
        ...item,
        quantity: parseInt(item.quantity),
        box_num: parseInt(item.box_num),
      }));

      // 判断数量是否超过采购数量
      const isExceed = values.detail.some((item) => {
        const originData = purchaseOrderProductList.find(
          (product) => product.purchase_order_product_no === item.purchase_order_product_no,
        );
        return originData.quantity < item.quantity;
      });

      if (isExceed) {
        message.error('入库数量不能大于采购数量');
        return;
      }

      // 判断箱数是否超过采购箱数
      const isBoxExceed = values.detail.some((item) => {
        const originData = purchaseOrderProductList.find(
          (product) => product.purchase_order_product_no === item.purchase_order_product_no,
        );
        console.log("originData.box_num", originData.box_num);
        console.log("item.box_num", item.box_num);
        return originData.box_num < item.box_num;
      });

      if (isBoxExceed) {
        message.error('入库箱数不能大于采购箱数');
        return;
      }

      const res = await addInbound(values);
      if (res.code === 200) {
        message.success('添加成功');
        navigate('/storehouse/inventory/in');
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleProductSubmit = () => {
    productForm
      .validateFields()
      .then((values) => {
        // 获取原始数据
        const originData = purchaseOrderProductList.find(
          (item) => item.product_uuid === values.product_uuid,
        );

        // 判断数量是否超过采购数量
        if (originData && originData.quantity < parseInt(values.quantity)) {
          message.error('入库数量不能大于采购数量' + originData.quantity);
          return;
        }

        // 判断箱数是否超过采购箱数
        if (originData && originData.box_num < parseInt(values.box_num)) {
          message.error('入库箱数不能大于采购箱数' + originData.box_num);
          return;
        }

        if (isEdit) {
          const updatedDetailData = detailData.map((item) =>
            item.product_uuid === values.product_uuid
              ? { ...item, ...values }
              : item,
          );
          setDetailData(updatedDetailData);
        } else {
          // 如果已经存在相同的商品，则不添加
          const isExist = detailData.some(
            (item) => item.product_uuid === values.product_uuid,
          );

          if (!isExist) {
            values.key = detailData.length + 1;
          } else {
            message.error('商品已存在');
            return;
          }

          setDetailData([...detailData, values]);
        }

        setModalVisible(false);
        productForm.resetFields();
      })
      .catch((info) => {
        message.error('验证失败');
      });
  };

  const renderProductName = (uuid) => {
    const product = purchaseOrderProductList.find(
      (product) => product.product_uuid === uuid,
    );
    return product?.product?.name;
  };

  const detailColumns = [
    {
      title: '商品名称',
      dataIndex: 'product_uuid',
      key: 'product_uuid',
      render: renderProductName,
    },
    { title: 'SKU代码', dataIndex: 'sku_code', key: 'sku_code', render: (_, record) => record.sku?.code  },
    { title: '规格', dataIndex: 'sku_spec', key: 'sku_spec', render: (_, record) => record.sku?.specification },
    { title: '客户名称', dataIndex: 'customer_name', key: 'customer_name', render: (_, record) => currentPurchaseOrder.customer_info?.name  },
    { title: '国家', dataIndex: 'country', key: 'country', render: (_, record) => record.sku?.country  },
    { title: '厂号', dataIndex: 'factory_no', key: 'factory_no', render: (_, record) => record.sku?.factory_no },
    { title: '柜号', dataIndex: 'cabinet_no', key: 'cabinet_no' },
    { title: '发票号', dataIndex: 'invoice_no', key: 'invoice_no' },
    { title: '合同号', dataIndex: 'contract_no', key: 'contract_no' },
    { title: '商品数量', dataIndex: 'quantity', key: 'quantity', editable: true, },
    { title: '商品箱数', dataIndex: 'box_num', key: 'box_num', editable: true, },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEditDetail(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => handleDeleteDetail(record.key)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleEditDetail = (record) => {
    setSelectedProduct(record);
    setModalVisible(true);
    setIsEdit(true);
    productForm.setFieldsValue(record);
  };

  const handleDeleteDetail = (key) => {
    setDetailData(detailData.filter((item) => item.key !== key));
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
        name="purchase_order_no"
        label="采购订单"
        rules={[{ required: true, message: '请选择采购订单' }]}
      >
        <Select
          showSearch
          allowClear
          mode="combobox"
          onChange={handlePuchaseOrderChange}
          filterOption={(input, option) => {
            const children = option.children;
            const childrenString = Array.isArray(children)
              ? children.join('')
              : children.toString();
            return (
              childrenString.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
          }}
          placeholder="请选择采购订单"
        >
          {purchaseOrderOptions.map((order) => (
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
        <Select placeholder="请选择仓库">
          {storehouseOptions.map((storehouse) => (
            <Option key={storehouse.uuid} value={storehouse.uuid}>
              {storehouse.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="title"
        label="标题"
        rules={[{ required: true, message: '请输入标题' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="inbound_type"
        label="入库类型"
        initialValue="1"
        rules={[{ required: true, message: '请选择入库类型' }]}
      >
        <Select placeholder="请选择入库类型" disabled>
          <Option value="1">采购入库</Option>
          <Option value="2">退货入库</Option>
          <Option value="3">手工入库</Option>
        </Select>
      </Form.Item>
      <Form.Item name="in_date" label="入库日期">
        <Input type="date" />
      </Form.Item>
      <Form.Item
        name="detail"
        label="入库明细"
        rules={[{ required: false, message: '请填写入库明细' }]}
      >
        <Button
          type="dashed"
          onClick={handleAddDetail}
          style={{ width: '100%', marginBottom: 16 }}
        >
          <PlusOutlined /> 添加入库明细
        </Button>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          columns={mergedColumns}
          dataSource={detailData}
          pagination={false}
          rowClassName="editable-row"
          rowKey="key"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
          保存
        </Button>
        <Button onClick={() => navigate('/storehouse-inventory-in')}>
          取消
        </Button>
      </Form.Item>
      <Modal
        title="添加入库明细"
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
              {purchaseOrderProductList.map((product) => (
                <Option key={product.product_uuid} value={product.product_uuid}>
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
          ></Form.Item>

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
          <Form.Item
            name="box_num"
            label="商品箱数"
            rules={[{ required: true, message: '请输入商品箱数' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="customer_name"
            label="客户名称"
            rules={[{ required: false, message: '请输入客户名称' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="country"
            label="国家"
            rules={[{ required: false, message: '请输入国家' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="factory_no"
            label="厂号"
            rules={[{ required: false, message: '请输入厂号' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="cabinet_no"
            label="柜号"
            rules={[{ required: false, message: '请输入柜号' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="invoice_no"
            label="发票号"
            rules={[{ required: false, message: '请输入发票号' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="contract_no"
            label="合同号"
            rules={[{ required: false, message: '请输入合同号' }]}
          >
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
};

export default StorehouseInboundForm;
