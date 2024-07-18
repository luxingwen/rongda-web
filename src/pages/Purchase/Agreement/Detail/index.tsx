// src/pages/AgreementDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getAgreement } from '@/services/agreement';
import { message, Spin, Card, Divider, List } from 'antd';

const AgreementDetail = () => {
  const { uuid } = useParams();
  const [agreementInfo, setAgreementInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgreementDetail(uuid);
  }, [uuid]);

  const fetchAgreementDetail = async (uuid) => {
    try {
      const response = await getAgreement({ uuid });
      if (response.code === 200) {
        response.data.attachments = JSON.parse(response.data.attachment);
        response.data.attachments  = response.data.attachments.map((file, index) => ({
            uid: index,
            name: file,
            status: 'done',
            url: file,
            }));
        setAgreementInfo(response.data);
      } else {
        message.error('获取合同详情失败');
      }
    } catch (error) {
      message.error('获取合同详情失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="合同详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="UUID">{agreementInfo?.uuid}</ProDescriptions.Item>
          <ProDescriptions.Item label="日期">{agreementInfo?.date}</ProDescriptions.Item>
          <ProDescriptions.Item label="标题">{agreementInfo?.title}</ProDescriptions.Item>
          <ProDescriptions.Item label="创建人">{agreementInfo?.creater}</ProDescriptions.Item>
          <ProDescriptions.Item label="合同类型">
            {agreementInfo?.type === 1 ? '销售合同' : agreementInfo?.type === 2 ? '采购合同' : agreementInfo?.type === 3 ? '服务合同' : '其他'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="创建时间">{agreementInfo?.created_at}</ProDescriptions.Item>
          <ProDescriptions.Item label="更新时间">{agreementInfo?.updated_at}</ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <Card title="合同内容" bordered={false}>
          <p>{agreementInfo?.content}</p>
        </Card>
        <Divider />
        <Card title="附件列表" bordered={false}>
          <List
            itemLayout="horizontal"
            dataSource={agreementInfo?.attachments || []}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>}
                  description={`上传时间: ${item.upload_time}`}
                />
              </List.Item>
            )}
          />
        </Card>
      </Card>
    </Spin>
  );
};

export default AgreementDetail;
