import { addWxUser, deleteWxUser, getWxUsers, updateWxUser, wxRealnameAuth } from '@/services/user/wx_user';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Tag,
  Typography,
  Progress,
} from 'antd';
import { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';


const { Option } = Select;
const { Text } = Typography;

const UserManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [progressColor, setProgressColor] = useState('#f5222d'); // 初始为红色

  const [form] = Form.useForm();
  const actionRef = useRef();

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (uuid) => {
    try {
      const res = await deleteWxUser({ uuid });
      if (res.code !== 200) {
        message.error('删除失败 :' + res.message);
      } else {
        message.success('删除成功');
        actionRef.current?.reload();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      values.password_strength = passwordStrength;
      if (editingUser) {
        await updateWxUser({ ...editingUser, ...values });
        message.success('更新成功');
      } else {
        const res = await addWxUser(values);
        if (res.code === 200) {
          message.success('添加成功');
        } else {
          message.error('添加失败 :' + res.message);
        }
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

  const renderStatus = (status) => {
    switch (status) {
      case 1:
        return <Tag color="green">启用</Tag>;
      case 2:
        return <Tag color="grey">禁用</Tag>;
      case 3:
        return <Tag color="blue">未激活</Tag>;
      default:
        return <Tag color="blue">未知</Tag>;
    }
  };

  const renderGender = (gender) => {
    switch (gender) {
      case 0:
        return <Tag color="red">未知</Tag>;
      case 1:
        return <Tag color="green">男</Tag>;
      case 2:
        return <Tag color="grey">女</Tag>;
      default:
        return null;
    }
  };

  const checkPasswordStrength = (value) => {
    let strength = 0;
    if (value.length > 5) strength += 20;
    if (value.length > 8) strength += 30;
    if (/[A-Z]/.test(value)) strength += 20;
    if (/[0-9]/.test(value)) strength += 20;
    if (/[^A-Za-z0-9]/.test(value)) strength += 10;

    let label = '弱';
    let color = '#f5222d'; // 红色

    if (strength > 60) {
      label = '中等';
      color = '#faad14'; // 橙色
    }
    if (strength > 80) {
      label = '强';
      color = '#52c41a'; // 绿色
    }

    setPasswordStrength(strength);
    setStrengthLabel(label);
    setProgressColor(color);
    return strength;
  };

  const queryUser = async (params, sort, filter) => {
    const queryParams = {
      ...params,
      ...sort,
      ...filter,
    };

    try {
      const response = await getWxUsers(queryParams);
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

  const handleRealNameToggle = async (record) => {
    Modal.confirm({
      title: '确认操作',
      content: `确定要${record.is_real_name ? '取消' : '进行'}实名认证吗？`,
      onOk: async () => {
        try {
          const updatedUser = { uuid: record.uuid, is_real_name: record.is_real_name ? 0 : 1 };
          const res = await wxRealnameAuth(updatedUser);
          if (res.code === 200) {
            message.success('更新成功');
            actionRef.current?.reload();
          } else {
            message.error('更新失败 :' + res.message);
          }
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid', width: 300 },
    { title: 'OpenID', dataIndex: 'openid', key: 'openid' },
    { title: 'UnionID', dataIndex: 'unionid', key: 'unionid' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '城市', dataIndex: 'city', key: 'city' },
    { title: '邀请码', dataIndex: 'invite_code', key: 'invite_code' },
    { title: '证件类型', dataIndex: 'certificate_type', key: 'certificate_type' },
    { title: '证件号码', dataIndex: 'certificate_number', key: 'certificate_number' },
    { title: '证件图片', dataIndex: 'certificate_image', key: 'certificate_image' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => renderGender(gender),
      hideInSearch: true,
    },
    {
        title: '是否实名认证',
        dataIndex: 'is_real_name',
        key: 'is_real_name',
        render: (_, record) => (
          <Tag
            color={record.is_real_name ? "green" : "red"}
            onClick={() => handleRealNameToggle(record)}
            style={{ cursor: 'pointer' }}
          >
            {record.is_real_name ? "已认证" : "未认证"}
          </Tag>
        ),
      },
    {
      title: '是否删除',
      dataIndex: 'is_deleted',
      key: 'is_deleted',
      render: (is_deleted) => (is_deleted ? <Tag color="red">已删除</Tag> : <Tag color="green">未删除</Tag>),
    },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteUser(record.uuid)}
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
    <PageContainer>
      <ProTable
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={queryUser}
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
            onClick={handleAddUser}
            type="primary"
          >
            添加用户
          </Button>,
        ]}
      />
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="uuid"
            label="UUID"
            rules={[{ required: true, message: '请输入UUID' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="openid"
            label="OpenID"
            rules={[{ required: true, message: '请输入OpenID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="unionid"
            label="UnionID"
            rules={[{ required: true, message: '请输入UnionID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="城市"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="invite_code"
            label="邀请码"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="certificate_type"
            label="证件类型"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="certificate_number"
            label="证件号码"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="certificate_image"
            label="证件图片"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: !editingUser, message: '请输入密码' }]}
          >
            <Input.Password onChange={(e) => checkPasswordStrength(e.target.value)} />
          </Form.Item>
          <div>
            <Text>密码强度: {strengthLabel}</Text>
            <Progress percent={passwordStrength} showInfo={false} strokeColor={progressColor} />
          </div>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue={1}
          >
            <Select>
              <Option value={1}>启用</Option>
              <Option value={2}>禁用</Option>
              <Option value={3}>未激活</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
            initialValue={0}
          >
            <Select>
              <Option value={0}>未知</Option>
              <Option value={1}>男</Option>
              <Option value={2}>女</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="is_real_name"
            label="是否实名认证"
            rules={[{ required: true, message: '请选择是否实名认证' }]}
            initialValue={0}
          >
            <Select>
              <Option value={0}>未认证</Option>
              <Option value={1}>已认证</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="is_deleted"
            label="是否删除"
            rules={[{ required: true, message: '请选择是否删除' }]}
            initialValue={0}
          >
            <Select>
              <Option value={0}>未删除</Option>
              <Option value={1}>已删除</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UserManagement;
