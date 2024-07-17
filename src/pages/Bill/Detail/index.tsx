import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getBill } from '@/services/bill';
import { message, Spin, Card } from 'antd';

const BillDetail = () => {
  const { uuid } = useParams();
  const [billInfo, setBillInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillDetail(uuid);
  }, [uuid]);

  const fetchBillDetail = async (uuid) => {
    try {
      const response = await getBill({ uuid });
      if (response.code === 200) {
        setBillInfo(response.data);
      } else {
        message.error('获取发票详情失败');
      }
    } catch (error) {
      message.error('获取发票详情失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card bordered={false} title="发票详情">
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="UUID">{billInfo?.uuid}</ProDescriptions.Item>
          <ProDescriptions.Item label="发票公司">{billInfo?.invoice_company}</ProDescriptions.Item>
          <ProDescriptions.Item label="申请人">{billInfo?.applicant}</ProDescriptions.Item>
          <ProDescriptions.Item label="发票号">{billInfo?.invoice_no}</ProDescriptions.Item>
          <ProDescriptions.Item label="发票代码">{billInfo?.invoice_code}</ProDescriptions.Item>
          <ProDescriptions.Item label="发票类型">{billInfo?.invoice_type}</ProDescriptions.Item>
          <ProDescriptions.Item label="开票日期">{billInfo?.invoice_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="金额">{billInfo?.amount}</ProDescriptions.Item>
          <ProDescriptions.Item label="税率">{billInfo?.tax_rate}</ProDescriptions.Item>
          <ProDescriptions.Item label="税额">{billInfo?.tax_amount}</ProDescriptions.Item>
          <ProDescriptions.Item label="价税合计">{billInfo?.total_amount}</ProDescriptions.Item>
          <ProDescriptions.Item label="付款日期">{billInfo?.payment_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="付款方式">{billInfo?.payment_method}</ProDescriptions.Item>
          <ProDescriptions.Item label="备注">{billInfo?.remark}</ProDescriptions.Item>
          <ProDescriptions.Item label="财务人员">{billInfo?.finance_staff}</ProDescriptions.Item>
          <ProDescriptions.Item label="财务审核日期">{billInfo?.finance_audit_date}</ProDescriptions.Item>
          <ProDescriptions.Item label="财务审核状态">
            {billInfo?.finance_audit_status === 1 ? '待审核' : billInfo?.finance_audit_status === 2 ? '已审核' : '已驳回'}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="财务审核备注">{billInfo?.finance_audit_remark}</ProDescriptions.Item>
        </ProDescriptions>
      </Card>
    </Spin>
  );
};

export default BillDetail;
