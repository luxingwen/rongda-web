import { getStorehouse, updateStorehouseItem,updateStorehouseItemByMap } from '@/services/storehouse';
import { deleteStorehouseProduct } from '@/services/storehouse_product';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Spin,
  Tag,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const StorehouseDetail = () => {
  const { uuid } = useParams();
  const [storehouseInfo, setStorehouseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);
  const actionRef = useRef();
  const [selectUnit, setSelectUnit] = useState({});
  const [form] = Form.useForm();
  const [refreshKey, setRefreshKey] = useState(0); // 用于强制刷新

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
    return status === 1 ? (
      <Tag color="green">启用</Tag>
    ) : (
      <Tag color="red">未启用</Tag>
    );
  };

  const renderType = (type) => {
    return type === 1 ? (
      <Tag color="blue">自有仓库</Tag>
    ) : (
      <Tag color="purple">第三方仓库</Tag>
    );
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

  // 监听 selectUnit 的变化
  useEffect(() => {
    console.log('Updated selectUnit: ', selectUnit);
  }, [selectUnit]);

  const handleUnitSelect = (key, value) => {
    console.log('key: ', key, ' value: ', value);
    setSelectUnit((pre) => ({
      ...pre,
      [key]: value,
    }));
  };
  const columns = [
    {
      title: '商品名称',
      dataIndex: 'product_uuid',
      key: 'product_uuid',
      render: (_, record) => record.product?.name,
    },
    {
      title: 'SKU代码',
      dataIndex: 'sku_code',
      key: 'sku_code',
      render: (_, record) => record.sku?.code,
      hideInSearch: true,
    },
    {
      title: '规格',
      dataIndex: 'sku_spec',
      key: 'sku_spec',
      render: (_, record) => record.sku?.specification,
      hideInSearch: true,
    },
    {
      title: '商品数量',
      dataIndex: 'quantity',
      key: 'quantity',
      hideInSearch: true,
    },
    {
      title: '商品箱数',
      dataIndex: 'box_num',
      key: 'box_num',
      hideInSearch: true,
    },
    {
      title: '客户名称',
      dataIndex: 'customer_uuid',
      key: 'customer_uuid',
      render: (_, record) => record.customer_info?.name,
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      render: (_, record) => record.sku?.country,
      hideInSearch: true,
    },
    {
      title: '厂号',
      dataIndex: 'factory_no',
      key: 'factory_no',
      render: (_, record) => record.sku?.factory_no,
      hideInSearch: true,
    },
    {
      title: '入库日期',
      dataIndex: 'in_date',
      key: 'in_date',
      hideInSearch: true,
    },
    {
      title: '库存天数',
      dataIndex: 'stock_days',
      key: 'stock_days',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewProduct(record.uuid)}
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

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="仓库详情">
        <ProDescriptions
          column={2}
          editable={{
            editableKeys,
            onChange: setEditableKeys,
            onSave: async (key, record) => {
              const data = {
                key: key,
                value: record[key],
                storehouse_uuid: uuid,
              };

              updateStorehouseItem(data).then((response) => {
                if (response.code === 200) {
                  message.success('保存成功');
                  fetchStorehouseInfo(uuid);
                } else {
                  message.error('保存失败' + response.message);
                }
              });
            },
          }}
        >
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
          <ProDescriptions.Item
            label="签订合同时间"
            dataIndex="contract_date"
            valueType="date"
          >
            {storehouseInfo?.contract_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="合同到期时间"
            dataIndex="contract_expire_date"
            valueType="date"
          >
            {storehouseInfo?.contract_expire_date}
          </ProDescriptions.Item>
          <ProDescriptions.Item
            label="合同到期提醒"
            dataIndex="contract_expire_remind"
          >
            {storehouseInfo?.contract_expire_remind}
          </ProDescriptions.Item>
        </ProDescriptions>

        <Divider />
        <Card title="冷库费用价格" bordered={false}>
          <ProDescriptions
            key={refreshKey}
            layout="vertical"
            bordered
            column={10}
            editable={{
              editableKeys,
              onChange: setEditableKeys,
              onValuesChange: (changedValues) => {
                // 在这里更新表单的 record
                console.log('Changed values: ', changedValues);
              },
              onSave: async (key, record) => {
                let data = {
                  storehouse_uuid: uuid,
                };

                const values = await form.validateFields(); // 验证并获取表单值

                data[key] = values[key]; // 更新表单值

                const typ = `${key}_type`;
                data[typ] = values[typ]; // 更新单位值

                updateStorehouseItemByMap(data).then((response) => {
                  if (response.code === 200) {
                    message.success('保存成功');
                    fetchStorehouseInfo(uuid);
                    setRefreshKey((prevKey) => prevKey + 1);
                  } else {
                    message.error('保存失败' + response.message);
                  }
                });
              },
            }}
          >
            <ProDescriptions.Item
              label="冷藏费"
              dataIndex="cold_storage_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="cold_storage_fee"
                        rules={[{ required: false, message: '请输入冷藏费' }]}
                        initialValue={storehouseInfo?.cold_storage_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="cold_storage_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={storehouseInfo?.cold_storage_fee_type} // 设置初始值
                      >
                        <Select
                          style={{ width: '120px' }}
                          placeholder="单位"
                          onChange={(value) =>
                            handleUnitSelect('cold_storage_fee_type', value)
                          }
                        >
                          <Select.Option value="吨/天">吨/天</Select.Option>
                          <Select.Option value="板/天">板/天</Select.Option>
                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.cold_storage_fee}{' '}
              {storehouseInfo?.cold_storage_fee_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="装卸费/出入库费"
              dataIndex="loading_unloading_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="loading_unloading_fee"
                        rules={[
                          { required: false, message: '装卸费/出入库费' },
                        ]}
                        initialValue={storehouseInfo?.loading_unloading_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="loading_unloading_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={
                          storehouseInfo?.loading_unloading_fee_type
                        } // 设置初始值
                      >
                        <Select style={{ width: '120px' }} placeholder="单位">
                          <Select.Option value="吨">吨</Select.Option>
                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.loading_unloading_fee}{' '}
              {storehouseInfo?.loading_unloading_fee_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="处置费"
              dataIndex="disposal_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="disposal_fee"
                        rules={[{ required: false, message: '处置费' }]}
                        initialValue={storehouseInfo?.disposal_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="disposal_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={storehouseInfo?.disposal_fee_type} // 设置初始值
                      >
                        <Select style={{ width: '120px' }} placeholder="单位">
                          <Select.Option value="吨">吨</Select.Option>

                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.disposal_fee} {storehouseInfo?.disposal_fee_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="搬运费"
              dataIndex="handling_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="handling_fee"
                        rules={[{ required: false, message: '搬运费' }]}
                        initialValue={storehouseInfo?.handling_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="handling_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={storehouseInfo?.handling_fee_type} // 设置初始值
                      >
                        <Select style={{ width: '120px' }} placeholder="单位">
                          <Select.Option value="吨">吨</Select.Option>

                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.handling_fee} {storehouseInfo?.handling_fee_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="货转费"
              dataIndex="goods_transfer_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="goods_transfer_fee"
                        rules={[{ required: false, message: '货转费' }]}
                        initialValue={storehouseInfo?.goods_transfer_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="goods_transfer_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={storehouseInfo?.goods_transfer_fee_type} // 设置初始值
                      >
                        <Select style={{ width: '120px' }} placeholder="单位">
                          <Select.Option value="吨">吨</Select.Option>
                          <Select.Option value="柜">柜</Select.Option>
                          <Select.Option value="次">次</Select.Option>

                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.goods_transfer_fee}{' '}
              {storehouseInfo?.goods_transfer_fee_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="分选费"
              dataIndex="sorting_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="sorting_fee"
                        rules={[{ required: false, message: '分选费' }]}
                        initialValue={storehouseInfo?.sorting_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="sorting_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={storehouseInfo?.sorting_fee_type} // 设置初始值
                      >
                        <Select style={{ width: '120px' }} placeholder="单位">
                          <Select.Option value="吨">吨</Select.Option>
                          <Select.Option value="箱">箱</Select.Option>

                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.sorting_fee} {storehouseInfo?.sorting_fee_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="缠绕膜费"
              dataIndex="wrapping_film_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="wrapping_film_fee"
                        rules={[{ required: false, message: '缠绕膜费' }]}
                        initialValue={storehouseInfo?.wrapping_film_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="wrapping_film_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={storehouseInfo?.wrapping_film_fee_type} // 设置初始值
                      >
                        <Select style={{ width: '120px' }} placeholder="单位">
                          <Select.Option value="吨">吨</Select.Option>
                          <Select.Option value="板">板</Select.Option>
                          <Select.Option value="卷">卷</Select.Option>

                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.wrapping_film_fee}{' '}
              {storehouseInfo?.wrapping_film_fee_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="充电费"
              dataIndex="charging_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="charging_fee"
                        rules={[{ required: false, message: '充电费' }]}
                        initialValue={storehouseInfo?.charging_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="charging_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={storehouseInfo?.charging_fee_type} // 设置初始值
                      >
                        <Select style={{ width: '120px' }} placeholder="单位">
                          <Select.Option value="小时">小时</Select.Option>

                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.charging_fee} {storehouseInfo?.charging_fee_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="抄码费"
              dataIndex="reading_code_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="reading_code_fee"
                        rules={[{ required: false, message: '抄码费' }]}
                        initialValue={storehouseInfo?.reading_code_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="reading_code_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={storehouseInfo?.reading_code_fee_type} // 设置初始值
                      >
                        <Select style={{ width: '120px' }} placeholder="单位">
                          <Select.Option value="吨">吨</Select.Option>
                          <Select.Option value="箱">箱</Select.Option>

                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.reading_code_fee}{' '}
              {storehouseInfo?.reading_code_fee_type}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="打冷费"
              dataIndex="cold_fee"
              renderFormItem={(text, { record }) => (
                <Form form={form}>
                  <Row gutter={8}>
                    <Col>
                      <Form.Item
                        name="cold_fee"
                        rules={[{ required: false, message: '打冷费' }]}
                        initialValue={storehouseInfo?.cold_fee} // 设置初始值
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="cold_fee_type"
                        noStyle
                        rules={[{ required: false, message: '请选择单位' }]}
                        initialValue={storehouseInfo?.cold_fee_type} // 设置初始值
                      >
                        <Select style={{ width: '120px' }} placeholder="单位">
                          <Select.Option value="天">天</Select.Option>

                          {/* 你可以根据需要添加更多单位选项 */}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            >
              {storehouseInfo?.cold_fee} {storehouseInfo?.cold_fee_type}
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
