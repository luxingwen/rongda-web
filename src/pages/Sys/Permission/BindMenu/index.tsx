import React, { useState, useEffect } from 'react';
import { Button, Tree, message } from 'antd';
import { history } from '@umijs/max';
import { useParams } from 'react-router-dom';
import { getMenus } from '@/services/menu';
import { addPermissionMenu, getPermissionMenuInfoByPermissionUuid } from '@/services/permission_menu';

const BindMenusPage = () => {
  const [menuTree, setMenuTree] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const { permissionId } = useParams(); // 从路由获取权限ID

  useEffect(() => {
    fetchPermissionMenus(permissionId);
    fetchMenus();
  }, [permissionId]);

  const fetchMenus = async () => {
    try {
      const response = await getMenus({});
      setMenuTree(formatMenuTree(response.data.data));
    } catch (error) {
      message.error('获取菜单列表失败');
    }
  };

  const fetchPermissionMenus = async (uuid) => {
    try {
      const response = await getPermissionMenuInfoByPermissionUuid({ uuid });
      const menuuuids = response.data.map((menu) => menu.menu_uuid);
      setSelectedKeys(menuuuids);
    } catch (error) {
      message.error('获取权限已绑定菜单失败');
    }
  };

  const formatMenuTree = (menus) => {
    const map = {};
    menus.forEach((menu) => {
      map[menu.uuid] = { ...menu, key: menu.uuid, title: menu.name, children: [] };
    });
    menus.forEach((menu) => {
      if (menu.parent_uuid && map[menu.parent_uuid]) {
        map[menu.parent_uuid].children.push(map[menu.uuid]);
      }
    });
    return Object.values(map).filter(menu => !menu.parent_uuid);
  };

  const handleBindMenus = async () => {
    try {
      await addPermissionMenu({ permission_uuid: permissionId, menu_uuids: selectedKeys });
      message.success('菜单绑定成功');
      history.push('/system/permission'); // 绑定完成后返回权限列表
    } catch (error) {
      message.error('菜单绑定失败');
    }
  };

  return (
    <div>
      <h1>绑定菜单到权限</h1>
      <Tree
        checkable
        checkedKeys={selectedKeys}
        onCheck={(checkedKeys) => setSelectedKeys(checkedKeys)}
        treeData={menuTree}
      />
      <Button type="primary" onClick={handleBindMenus} style={{ marginTop: 16 }}>
        绑定菜单
      </Button>
    </div>
  );
};

export default BindMenusPage;
