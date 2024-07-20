import { getProductOptions, getProductSkuOptions } from '@/services/product';
import { getProductCategoryOptions } from '@/services/product_category';
import {
  addProductManage,
  deleteProductManage,
  getProductManages,
  updateProductManage,
} from '@/services/product_manage';
import { getSupplierOptions } from '@/services/supplier';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Switch,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Tag } from 'antd';

const { Option } = Select;

const ProductManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const actionRef = useRef();
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);

  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentSku, setCurrentSku] = useState(null);

  useEffect(() => {
    fetchSupplierOptions();
    fetchProductCategoryOptions();
    fetchProductOptions();
  }, []);

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
  };

  const fetchProductCategoryOptions = async () => {
    try {
      const response = await getProductCategoryOptions();
      if (response.code === 200) {
        setCategoryOptions(response.data);
      } else {
        message.error('获取产品分类选项失败');
      }
    } catch (error) {
      message.error('获取产品分类选项失败');
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

  const handleAddProduct = () => {
    setEditingProduct(null);
    setCurrentProduct(null);
    setCurrentSku(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditProduct = (record) => {
    setEditingProduct(record);
    setCurrentProduct(record.product);
    console.log("sku:", record.sku);
    setCurrentSku(record.sku);
    handleProductChange(record.product, true);
    // form.setFieldsValue(record);
    form.setFieldsValue({sku: renderSkuSelect(record.sku_info), product: record.product_info?.name, ...record});
    setIsModalVisible(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await deleteProductManage({ uuid: id });
      if (res.code !== 200) {
        message.error(res.message);
        return;
      }
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.price = parseFloat(values.price);
      values.cost = parseFloat(values.cost);
      values.status = values.status ? 1 : 0;
      if (editingProduct) {
        await updateProductManage({ ...editingProduct, ...values });
        message.success('更新成功');
      } else {
        await addProductManage(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      hideInSearch: true,
      render: (_, record) => record.supplier_info?.name,
    },
    { 
        title: '类别', 
        dataIndex: 'category', 
        key: 'category', 
        hideInSearch: true,
        render: (text) => (
          <Tag color={text === '期货' ? 'blue' : 'green'}>
            {text}
          </Tag>
        ),
      },
    {
      title: '商品名称',
      dataIndex: 'product',
      key: 'product',
      render: (_, record) => record.product_info?.name,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (_, record) => record.sku_info?.code,
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
      render: (_, record) => record.sku_info?.specification,
    },

    { title: '价格', dataIndex: 'price', key: 'price', hideInSearch: true },
    { title: '成本', dataIndex: 'cost', key: 'cost', hideInSearch: true },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      hideInSearch: true,
    },

    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record)}
            style={{ marginRight: 8 }}
          />
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

  const fetchProducts = async (params) => {
    try {
      const response = await getProductManages(params);
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

  const handleProductChange = async (value, isEdit) => {
    try {
      const response = await getProductSkuOptions({ uuid: value });
      if (response.code === 200) {
        setSkuOptions(response.data);
        setCurrentProduct(value);
        if(!isEdit){
            setCurrentSku(null);
            form.setFieldValue('sku', null);
        }
  
      } else {
        message.error('获取SKU选项失败');
      }
    } catch (error) {
      message.error('获取SKU选项失败');
    }
  };

  const handleSkuChange = async (value) => {
    setCurrentSku(value);
  };

  const renderSkuSelect = (sku) => {
    if (sku.code == '') {
      return '规格：' + sku.specification;
    }
    return 'SKU：' + sku.code;
  };

  return (
    <div>
      <ProTable
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={fetchProducts}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        options={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
            type="primary"
          >
            添加产品
          </Button>,
        ]}
      />
      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: '请选择供应商' }]}
          >
            <Select
              placeholder="请选择供应商"
              showSearch
              allowClear
              mode="combobox"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {supplierOptions.map((supplier) => (
                <Option key={supplier.uuid} value={supplier.uuid}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="类别"
            rules={[{ required: true, message: '请选择类别' }]}
          >
            <Radio.Group>
              <Radio value="期货">期货</Radio>
              <Radio value="现货">现货</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="product"
            label="商品名称"
            rules={[{ required: false, message: '请输入商品名称' }]}
          >
            <Select
              placeholder="请选择商品"
              showSearch
              allowClear
              mode="combobox"
              onChange={(value) => handleProductChange(value)}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {productOptions.map((product) => (
                <Option key={product.uuid} value={product.uuid}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {currentProduct && (
            <Form.Item
              name="sku"
              label="SKU/规格"
              rules={[{ required: false, message: 'SKU/规格名称' }]}
            >
              <Select
                placeholder="请选择SKU/规格"
                showSearch
                allowClear
                mode="combobox"
                onChange={(value) => handleSkuChange(value)}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {skuOptions.map((sku) => (
                  <Option key={sku.uuid} value={sku.uuid}>
                    {renderSkuSelect(sku)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {currentProduct && currentSku && (
            <>
              <Form.Item
                name="price"
                label="销售价格"
                rules={[{ required: true, message: '请输入销售价格' }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="cost"
                label="成本价格"
                rules={[{ required: true, message: '请输入成本价格' }]}
              >
                <Input type="number" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="desc"
            label="描述"
            rules={[{ required: false, message: '请输入描述' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="活跃状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
