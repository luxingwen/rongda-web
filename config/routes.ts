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
    name: '个人中心',
    path: '/user/profile',
    component: './User/PersonalCenter',
    hideInMenu: true,
  },
  {
    name: '个人中心',
    path: '/user/setting',
    component: './User/Setting',
    hideInMenu: true,
  },

  {
    name: '资料管理',
    path: '/resource',
    routes: [
      {
        name: '客户管理',
        path: '/resource/customer',
        component: './Customer',
      },
      {
        name: '代理机构',
        path: '/resource/agent',
        component: './Agent',
      },
      {
        name: '供应商管理',
        path: '/resource/supplier',
        component: './Supplier',
      },
      {
        name: 'SKU管理',
        path: '/resource/sku',
        component: './Sku',
      },

    ],
  },

  {
    name: '员工管理',
    path: '/staff',
    routes: [
      {
        name: '部门管理',
        path: '/staff/department',
        component: './Department',
      },
      {
        name: '用户管理',
        path: '/staff/user',
        component: './User/Maneger',
      },
      {
        name: '权限管理',
        path: '/staff/permission',
        component: './User/Maneger',
      },
    ],
  },

  {
    name: '系统管理',
    path: '/system',
    routes: [

      {
        name: '菜单管理',
        path: '/system/menu',
        component: './Menu',
      },
     
      {
        name: '结算币种',
        path: '/system/currency',
        component: './SettlementCurrency',
      },
    ],
  },
];
