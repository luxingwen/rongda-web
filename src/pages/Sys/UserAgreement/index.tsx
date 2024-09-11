// src/components/UserAgreementEditor.js
import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Button, Form, Layout, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getUserAgreement,createUserAgreement } from '@/services/sys/user_agreement';
const { Content } = Layout;

const UserAgreementEditor = () => {
  const [editorData, setEditorData] = useState('<p>请在此输入用户注册协议...</p>');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchgetUserAgreement();
  }, []);


  const fetchgetUserAgreement = async () => {
    try {
      const response = await getUserAgreement();
      if (response.code === 200) {
        setEditorData(response.data.value);
      } else {
        message.error('获取用户注册协议失败');
      }
    } catch (error) {
      message.error('获取用户注册协议失败');
    }
  }

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await createUserAgreement(editorData);
      if (res.code !== 200) {
        message.error('保存失败'+ res.message);
        return;
      }
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    }
    setLoading(false);
  }

  return (
    <PageContainer>
      <Content className="p-6 bg-white">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="" name="agreement" initialValue={editorData}>
            <div className="border border-gray-300 rounded p-2">
              <CKEditor
                editor={ClassicEditor}
                data={editorData}
                style={{height: '500px'}}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setEditorData(data);
                }}
              />
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </PageContainer>
  );
};

export default UserAgreementEditor;
