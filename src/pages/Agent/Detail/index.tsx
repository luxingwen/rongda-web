import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getAgentInfo } from '@/services/agent';
import { message, Spin, Card, Divider, Tag } from 'antd';

const AgentDetail = () => {
  const { uuid } = useParams();
  const [agentInfo, setAgentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentInfo(uuid);
  }, [uuid]);

  const fetchAgentInfo = async (uuid) => {
    try {
      const response = await getAgentInfo({ uuid });
      if (response.code === 200) {
        setAgentInfo(response.data);
      } else {
        message.error('获取代理商信息失败');
      }
    } catch (error) {
      message.error('获取代理商信息失败');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status) => (
    <Tag color={status ? 'green' : 'red'}>{status ? '活跃' : '禁用'}</Tag>
  );

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="代理商详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="UUID">{agentInfo?.uuid}</ProDescriptions.Item>
          <ProDescriptions.Item label="名称">{agentInfo?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="地址">{agentInfo?.address}</ProDescriptions.Item>
          <ProDescriptions.Item label="联系方式">{agentInfo?.contact_info}</ProDescriptions.Item>
          <ProDescriptions.Item label="开户行">{agentInfo?.bank_name}</ProDescriptions.Item>
          <ProDescriptions.Item label="银行账号">{agentInfo?.bank_account}</ProDescriptions.Item>
          <ProDescriptions.Item label="信用状态">{agentInfo?.credit_status}</ProDescriptions.Item>
          <ProDescriptions.Item label="费率">{agentInfo?.rate}</ProDescriptions.Item>
          <ProDescriptions.Item label="状态">{renderStatus(agentInfo?.status)}</ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
      </Card>
    </Spin>
  );
};

export default AgentDetail;
