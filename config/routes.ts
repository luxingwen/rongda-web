export default [
  {
    path: '/',
    redirect: '/home',
  },
  {
    name: '首页1',
    path: '/home',
    component: './Home',

  },
  {
    name: '登录',
    path: '/login',
    component: './User/Login',
    hideInMenu: true,
    layout: false,
  },
  {
    name: '权限演示',
    path: '/access',
    component: './Access',
    hideInMenu: true,
  },
  {
    name: ' CRUD 示例',
    path: '/table',
    component: './Table',
    hideInMenu: true,
  },
  {
    name: '系统管理',
    path: '/system',
    routes: [
      {
        name: '用户管理',
        path: '/system/user',
        component: './User/Maneger',
      },
      {
        name: '角色管理',
        path: '/system/role',
        component: './Role',
      },
      {
        name: '团队管理',
        path: '/system/team',
        component: './Team',
      },
      {
        name: '菜单管理',
        path: '/system/menu',
        component: './Menu',
      },
    ],
  },
];
