import {
  addDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from '@/services/department';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import ProTable from '@ant-design/pro-table';
import { Button, Form, Input, message, Modal, Popconfirm, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [srcDepartments, setSrcDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [parentUUID, setParentUUID] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await getDepartments({});
      setSrcDepartments(response.data.data);
      setDepartments(formatDepartmentTree(response.data.data));
    } catch (error) {
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDepartmentTree = (departments) => {
    const map = {};
    departments.forEach((department) => {
      map[department.uuid] = {
        ...department,
        key: department.uuid,
        value: department.uuid,
        label: department.name,
        children: [],
      };
    });
    departments.forEach((department) => {
      if (department.parent_uuid && map[department.parent_uuid]) {
        map[department.parent_uuid].children.push(map[department.uuid]);
      }
    });
    const result = Object.values(map).filter(
      (department) => !department.parent_uuid,
    );
    return result;
  };

  const getParentName = (uuid) => {
    if (!uuid) return '';

    const parent = srcDepartments.find((item) => item.uuid === uuid);
    return parent ? parent.name : '';
  };

  const handleAddDepartment = (parentUUID0 = null) => {
    setEditingDepartment(null);

    setParentUUID(parentUUID0);
    form.resetFields();
    form.setFieldsValue({ parent_uuid: getParentName(parentUUID0) });
    setIsModalVisible(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setParentUUID(department.parent_uuid);
    form.setFieldsValue(department);
    setIsModalVisible(true);
  };

  const handleDeleteDepartment = async (uuid) => {
    setLoading(true);
    try {
      await deleteDepartment({ uuid });
      message.success('删除成功');
      fetchDepartments();
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.status = values.status ? 1 : 0;
      values.parent_uuid = parentUUID;
      if (editingDepartment) {
        await updateDepartment({ ...editingDepartment, ...values });
        message.success('更新成功');
      } else {
        await addDepartment(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      fetchDepartments();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Switch checked={status} disabled />,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditDepartment(record)}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteDepartment(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} style={{ marginLeft: 8 }} />
          </Popconfirm>
          <Button
            icon={<PlusOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => handleAddDepartment(record.uuid)}
          />
          <Button
            type="link"
            onClick={() => navigate(`/staff/department/${record.uuid}`)}
          >
            查看详情
          </Button>
        </span>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable
        columns={columns}
        dataSource={departments}
        loading={loading}
        rowKey="key"
        pagination={false}
        search={false}
        expandable={{
          childrenColumnName: 'children',
        }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => handleAddDepartment()}
            type="primary"
          >
            添加部门
          </Button>,
        ]}
      />
      <Modal
        title={editingDepartment ? '编辑部门' : '添加部门'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="manager"
            label="负责人"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
          <Form.Item name="parent_uuid" label="上级部门">
            <Input
              value={parentUUID ? getParentName(parentUUID) : ''}
              readOnly
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DepartmentManagement;
