import {
  addEmployee,
  deleteEmployee,
  getDepartmentDetails,
  getDepartmentStaffList,
  updateEmployee,
} from '@/services/department';
import { getUserOptions } from '@/services/user';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const { Option } = Select;

const DepartmentDetails = () => {
  const { uuid } = useParams();

  const [department, setDepartment] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [userOptions, setUserOptions] = useState([]);
  const actionRef = useRef();

  useEffect(() => {
    fetchDepartmentDetails();
    fetchUserOptions();
  }, [uuid]);

  const fetchUserOptions = async () => {
    const response = await getUserOptions();
    if (response.code === 200) {
      setUserOptions(response.data);
    } else {
      message.error('获取用户选项失败');
    }
  };

  const fetchDepartmentDetails = async () => {
    setLoading(true);
    try {
      const response = await getDepartmentDetails({ uuid: uuid });
      setDepartment(response.data);
    } catch (error) {
      message.error('获取部门详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async (params, sort, filter) => {
    const queryParams = {
      ...params,
      ...sort,
      ...filter,
      department_uuid: uuid,
    };
    setLoading(true);
    try {
      const response = await getDepartmentStaffList(queryParams);
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
      message.error('获取员工列表失败');
      return {
        data: [],
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  const [editingEmployee, setEditingEmployee] = useState(null);

  const showEditModal = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      staff_uuid: employee.staff_uuid,
      staff_name: employee.staff_name,
      staff_position: employee.staff_position,
    });
    setIsModalVisible(true);
  };

  const handleEditEmployee = async (values) => {
    try {
      setLoading(true);
      await updateEmployee({ ...editingEmployee, ...values });
      message.success('员工信息更新成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('更新员工信息失败');
    } finally {
      setLoading(false);
      setIsModalVisible(false);
    }
  };

  const handleAddEmployee = async (values) => {
    try {
      values.department_uuid = uuid;
      const res = await addEmployee({ ...values, uuid });
      if (res.code !== 200) {
        message.error('员工添加失败: ' + res.message);
        return;
      }
      message.success('员工添加成功');
      setIsModalVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      message.error('添加员工失败');
    }
  };

  const showAddEmployeeModal = () => {
    setEditingEmployee(null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDeleteEmployee = async (uuid) => {
    try {
      setLoading(true);
      await deleteEmployee({ uuid });
      message.success('员工删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除员工失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    if (editingEmployee) {
      form.submit();
    } else {
      form.submit();
    }
  };

  const columns = [
    { title: '姓名', dataIndex: 'staff_name', key: 'staff_name' },
    { title: '职位', dataIndex: 'staff_position', key: 'staff_position' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => showEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这名员工吗？"
            onConfirm={() => handleDeleteEmployee(record.uuid)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const getNickname = (user) => {
    if(user?.nickname && user?.nickname !== '') {
      return user.nickname;
    }
    return user?.username;
  };

  return (
    <div>
      <PageContainer>
        <Card
          title={department.name}
          extra={
            <Button icon={<PlusOutlined />} onClick={showAddEmployeeModal}>
              添加员工
            </Button>
          }
          bordered={false}
        >
          <p>描述: {department.description}</p>
          <p>负责人: {department.manager}</p>

          <ProTable
            actionRef={actionRef}
            columns={columns}
            request={fetchEmployees}
            rowKey="uuid"
            pagination={{
              showQuickJumper: true,
              pageSize: 5,
            }}
            search={false}
            dateFormatter="string"
            headerTitle="员工列表"
            toolBarRender={false}
            loading={loading}
          />
        </Card>
        <Modal
          title={editingEmployee ? '编辑员工' : '添加员工'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form
            form={form}
            onFinish={editingEmployee ? handleEditEmployee : handleAddEmployee}
            layout="vertical"
          >
            <Form.Item
              name="staff_uuid"
              label="用户"
              rules={[{ required: true, message: '请选择用户' }]}
            >
              <Select
                disabled={!!editingEmployee} // 如果editingEmployee存在，则禁用Select
                placeholder="请选择用户"
              >
                {userOptions.map((user) => (
                  <Option key={user.uuid} value={user.uuid}>
                    {getNickname(user)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="staff_name"
              label="姓名"
              rules={[{ required: true, message: '请输入员工姓名' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="staff_position"
              label="职位"
              rules={[{ required: true, message: '请输入员工职位' }]}
            >
              <Input />
            </Form.Item>
            {/* 用户不可编辑状态，不显示在表单中 */}
          </Form>
        </Modal>
      </PageContainer>
    </div>
  );
};

export default DepartmentDetails;
