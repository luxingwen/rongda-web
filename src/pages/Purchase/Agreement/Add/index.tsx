// src/pages/AgreementForm.jsx
import React, { useState, useEffect } from 'react';
import {  useParams } from 'react-router-dom';
import { Form, Input, Select, message, Button, Upload, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { addAgreement, updateAgreement, getAgreement } from '@/services/agreement';
import { useNavigate } from 'react-router-dom';
import {deleteFile} from '@/services/file';

const { Option } = Select;

const AgreementForm = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { uuid } = useParams();
  const navigate = useNavigate();
  const isEdit = !!uuid;

  useEffect(() => {
    if (isEdit) {
      fetchAgreementDetail(uuid);
    }
  }, [uuid]);

  const fetchAgreementDetail = async (uuid) => {
    try {
      const response = await getAgreement({ uuid });
      if (response.code === 200) {
        form.setFieldsValue(response.data);
        // 如果有附件，处理附件的展示

        

        if (response.data.attachment) {
          let attachment = JSON.parse(response.data.attachment);
          console.log(attachment);

           attachment.map((file, index) => {
            console.log("file:",file);
            // return {
            //   uid: index,
            //   name: file.name,
            //   status: 'done',
            //   url: file.url,
            // }
          });
         

          setFileList(attachment.map((file, index) => ({
            uid: index,
            name: file.name,
            status: 'done',
            url: file.url,
          })));
        }
      } else {
        message.error('获取合同详情失败');
      }
    } catch (error) {
      message.error('获取合同详情失败');
    }
  };

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });

      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('attachment', file.originFileObj);
        }
      });

      if (isEdit) {
        formData.append('uuid', uuid);
        await updateAgreement(formData);
        message.success('更新成功');
      } else {
        await addAgreement(formData);
        message.success('添加成功');
      }

      navigate('/purchase/agreement');
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Card title={isEdit ? '编辑合同' : '添加合同'}>
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入合同标题' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="date" label="日期" rules={[{ required: true, message: '请输入日期' }]}>
          <Input type="date" />
        </Form.Item>
        <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="type" label="合同类型" rules={[{ required: true, message: '请选择合同类型' }]}>
          <Select placeholder="请选择合同类型">
            <Option value="1">销售合同</Option>
            <Option value="2">采购合同</Option>
            <Option value="3">服务合同</Option>
            <Option value="4">其他</Option>
          </Select>
        </Form.Item>
        <Form.Item name="attachment" label="附件">
          <Upload
            multiple
            listType="picture"
            fileList={fileList}
            onChange={handleFileChange}
          >
            <Button icon={<UploadOutlined />}>上传附件</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit}>
            {isEdit ? '更新合同' : '添加合同'}
          </Button>
          <Button onClick={() => navigate('/purchase/agreement')} style={{ marginLeft: 10 }}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AgreementForm;
