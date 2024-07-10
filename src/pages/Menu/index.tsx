import React, { useState, useEffect } from 'react';
import { Tree, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { getMenus, addMenu, updateMenu, deleteMenu } from '@/services/menu';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [parentUUID, setParentUUID] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await getMenus({});
      setMenus(formatMenuTree(response.data.data));
    } catch (error) {
      message.error('获取菜单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const formatMenuTree = (menus) => {
    const map = {};
    const roots = [];
    menus.forEach((menu) => {
      map[menu.uuid] = { ...menu, key: menu.uuid, title: menu.name, children: [] };
    });
    menus.forEach((menu) => {
      if (menu.parent_uuid) {
        map[menu.parent_uuid].children.push(map[menu.uuid]);
      } else {
        roots.push(map[menu.uuid]);
      }
    });
    return roots;
  };

  const handleAddMenu = (parentUUID0 = null) => {
    console.log("handleAddMenu:", parentUUID0);
    setEditingMenu(null);
    setParentUUID(parentUUID0);
    console.log("parentUUID:", parentUUID);
    form.resetFields();
    if (parentUUID0) {
        form.setFieldsValue({ parent_uuid: parentUUID0 });
    }
    setIsModalVisible(true);
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    form.setFieldsValue(menu);
    setIsModalVisible(true);
  };

  const handleDeleteMenu = async (id) => {
    setLoading(true);
    try {
      await deleteMenu(id);
      message.success('删除成功');
      fetchMenus();
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (parentUUID) {
        values.parent_uuid = parentUUID;
      }
      if (editingMenu) {
        await updateMenu({ ...editingMenu, ...values });
        message.success('更新成功');
      } else {
        await addMenu(values);
        message.success('添加成功');
      }
      setIsModalVisible(false);
      fetchMenus();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderTreeNodes = (data) =>
    data.map((item) => ({
      title: (
        <div>
          {item.title}
          <span style={{ marginLeft: 8 }}>
            <EditOutlined onClick={() => handleEditMenu(item)} />
            <DeleteOutlined
              style={{ marginLeft: 8 }}
              onClick={() => handleDeleteMenu(item.key)}
            />
            <PlusOutlined
              style={{ marginLeft: 8 }}
              onClick={() => handleAddMenu(item.uuid)}
            />
          </span>
        </div>
      ),
      key: item.key,
      children: item.children.length ? renderTreeNodes(item.children) : null,
    }));

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleAddMenu(null)}
        style={{ marginBottom: 16 }}
      >
        添加菜单
      </Button>
      <Tree
        treeData={renderTreeNodes(menus)}
        loading={loading}
        defaultExpandAll
        switcherIcon={(props) =>
            props.expanded ? <DownOutlined /> : <UpOutlined />
          }
        showLine={{ showLeafIcon: false }}
      />
      <Modal
        title={editingMenu ? '编辑菜单' : '添加菜单'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
    
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="link" label="链接">
            <Input />
          </Form.Item>
          <Form.Item name="parent_uuid" label="父菜单UUID">
            <Input disabled value={parentUUID || ''} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;
