// src/pages/PurchaseBillDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getPurchaseBill } from '@/services/purchase_bill';
import { message, Spin, Card , Tag} from 'antd';

const PurchaseBillDetail = () => {
  const { uuid } = useParams();
  const [billInfo, setBillInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillDetail(uuid);
  }, [uuid]);

  const fetchBillDetail = async (uuid) => {
    setLoading(true);
    try {
      const response = await getPurchaseBill({ uuid });
      if (response.code === 200) {
        setBillInfo(response.data);
      } else {
        message.error('获取结算详情失败');
      }
    } catch (error) {
      message.error('获取结算详情失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="采购结算详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="采购单号">{billInfo?.purchase_order_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="入库单号">{billInfo?.stock_in_order_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="供应商">{billInfo?.supplier?.name}</ProDescriptions.Item>
          <ProDescriptions.Item label="银行账号">{billInfo?.bank_account}</ProDescriptions.Item>
          <ProDescriptions.Item label="银行名称">{billInfo?.bank_name}</ProDescriptions.Item>
          <ProDescriptions.Item label="银行账户名">{billInfo?.bank_account_name}</ProDescriptions.Item>
          <ProDescriptions.Item label="金额">{billInfo?.amount}</ProDescriptions.Item>
          <ProDescriptions.Item label="付款日期">{billInfo?.payment_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="付款方式">
            {billInfo?.payment_method === 1 ? '现金' : billInfo?.payment_method === 2 ? '转账' : billInfo?.payment_method === 3 ? '支票' : '其他'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="状态">
            <Tag color={billInfo?.status === 1 ? 'blue' : billInfo?.status === 2 ? 'green' : 'red'}>
              {billInfo?.status === 1 ? '待付款' : billInfo?.status === 2 ? '已付款' : '已取消'}
            </Tag>
          </ProDescriptions.Item>
          <ProDescriptions.Item label="备注" span={2}>{billInfo?.remark}</ProDescriptions.Item>
        </ProDescriptions>
      </Card>
    </Spin>
  );
};

export default PurchaseBillDetail;
