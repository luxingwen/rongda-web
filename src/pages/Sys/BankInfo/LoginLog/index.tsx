import React, { useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import { Tag, Input, Button, Form, Select, Space } from 'antd';
import { getSysLoginLogs } from '@/services/sys/login_log';

const { Option } = Select;

const SysLoginLogManagement = () => {
  const actionRef = useRef();

  const renderStatus = (status) => (
    <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '成功' : '失败'}</Tag>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', hideInSearch: true },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '登录状态', dataIndex: 'status', key: 'status', hideInSearch: true, render: (status) => renderStatus(status) },
    { title: '消息', dataIndex: 'message', key: 'message', hideInSearch: true },
    { title: '浏览器', dataIndex: 'browser', key: 'browser', hideInSearch: true },
    { title: '操作系统', dataIndex: 'os', key: 'os', hideInSearch: true },
    { title: '登录设备', dataIndex: 'device', key: 'device', hideInSearch: true },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', hideInSearch: true },
  ];

  const fetchSysLoginLogs = async (params) => {
    try {
      const response = await getSysLoginLogs(params);
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
        rowKey="id"
        actionRef={actionRef}
        request={fetchSysLoginLogs}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
          optionRender: (searchConfig, formProps, dom) => [
            ...dom,
            <Button key="reset" onClick={() => { searchConfig.form?.resetFields(); }}>
              重置
            </Button>,
          ],
        }}
        options={false}
        toolBarRender={false}
      />
    </div>
  );
};

export default SysLoginLogManagement;
