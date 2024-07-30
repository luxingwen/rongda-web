import { getUsers } from '@/services/user';
import { PageContainer } from '@ant-design/pro-components';
import ProTable from '@ant-design/pro-table';
import { history } from '@umijs/max';
import { Button, Form, Select, Tag, Typography } from 'antd';
import { useRef } from 'react';

const { Option } = Select;
const { Text } = Typography;

const UserManagement = () => {
  const [form] = Form.useForm();
  const actionRef = useRef();

  const renderStatus = (status) => {
    switch (status) {
      case 1:
        return <Tag color="green">启用</Tag>;
      case 2:
        return <Tag color="grey">禁用</Tag>;
      default:
        return <Tag color="blue">未知</Tag>;
    }
  };

  const renderSex = (sex) => {
    switch (sex) {
      case '0':
        return <Tag color="red">未知</Tag>;
      case '1':
        return <Tag color="green">男</Tag>;
      case '2':
        return <Tag color="grey">女</Tag>;
      default:
        return null;
    }
  };

  const queryUser = async (params, sort, filter) => {
    const queryParams = {
      ...params,
      ...sort,
      ...filter,
    };

    try {
      const response = await getUsers(queryParams);
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

  const handleBindPermissions = (record) => {
    history.push(`/staff/permission/${record.uuid}`);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid', width: 300 },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
    },
    {
      title: '性别',
      dataIndex: 'sex',
      key: 'sex',
      render: (sex) => renderSex(sex),
      hideInSearch: true,
    },
    {
      title: '个性签名',
      dataIndex: 'signed',
      key: 'signed',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_, record) => (
        <span>
          <Button
            onClick={() => handleBindPermissions(record)}
            style={{ marginRight: 8 }}
          >
            授权{' '}
          </Button>
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
        toolBarRender={() => []}
      />
    </PageContainer>
  );
};

export default UserManagement;
