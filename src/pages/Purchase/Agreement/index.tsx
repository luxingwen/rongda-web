// src/pages/AgreementManagement.jsx
import { deleteAgreement, getAgreements } from '@/services/agreement';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { Button, Popconfirm, message } from 'antd';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AgreementManagement = () => {
  const navigate = useNavigate();
  const actionRef = useRef();

  const handleDeleteAgreement = async (id) => {
    try {
      await deleteAgreement({ uuid: id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleViewDetail = (record) => {
    navigate(`/purchase/agreement/detail/${record.uuid}`);
  };

  const columns = [
    { title: 'UUID', dataIndex: 'uuid', key: 'uuid' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '标题', dataIndex: 'title', key: 'title', hideInSearch: true },
    {
      title: '创建人',
      dataIndex: 'creater',
      key: 'creater',
      hideInSearch: true,
    },
    { title: '合同类型', dataIndex: 'type', key: 'type', hideInSearch: true },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
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
            onClick={() => handleViewDetail(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/purchase/agreement/edit/${record.uuid}`)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDeleteAgreement(record.uuid)}
            okText="是"
            cancelText="否"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const fetchAgreements = async (params) => {
    try {
      const response = await getAgreements(params);
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
    <div>
      <ProTable
        columns={columns}
        rowKey="uuid"
        actionRef={actionRef}
        request={fetchAgreements}
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
            onClick={() => navigate('/purchase/agreement/add')}
            type="primary"
          >
            添加合同
          </Button>,
        ]}
      />
    </div>
  );
};

export default AgreementManagement;
