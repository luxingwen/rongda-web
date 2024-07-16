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
      {
        name: '商品管理',
        path: '/resource/product',
        component: './Product',
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
    name: '仓库管理',
    path: '/storehouse',
    routes: [
      {
        name: '仓库信息管理',
        path: '/storehouse/manage',
        component: './Storehouse/Manager',
      },
      {
        name: '库存管理',
        path: '/storehouse/inventory',
        routes: [
          {
            name: '库存查询',
            path: '/storehouse/inventory/query',
            component: './Storehouse/InventoryQuery',
          },
          {
            name: '入库',
            path: '/storehouse/inventory/in',
            component: './Storehouse/InventoryIn',
          },
          {
            name: '出库',
            path: '/storehouse/inventory/out',
            component: './Storehouse/InventoryOut',
          },
          {
            name: '库存盘点',
            path: '/storehouse/inventory/check',
            component: './Storehouse/InventoryCheck',
          }
        ],
      },
    ],
  },
  {
    name: '采购管理',
    path: '/purchase',
    routes: [

      {
        name: '合同管理',
        path: '/purchase/agreement',
        component: './Purchase/Agreement',
      },
     
      {
        name: '采购订单',
        path: '/purchase/order',
        component: './Purchase/Order',
      },
      {
        name: '到库登记',
        path: '/purchase/arrival',
        component: './Purchase/Arrival',
      },
      {
        name: '结算',
        path: '/purchase/settlement',
        component: './Purchase/PurchaseBill',
      },
    ],
  },
  {
    name: '销售管理',
    path: '/sales',
    routes: [

      {
        name: '合同管理',
        path: '/sales/agreement',
        component: './Sales/Agreement',
      },
      {
        name: '销售订单',
        path: '/sales/order',
        component: './Sales/Order',
      },
      {
        name: '出库登记',
        path: '/sales/outbound',
        component: './Sales/OutOfStock',
      },
      {
        name: '结算',
        path: '/sales/settlement',
        component: './Sales/Settlement',
      },
      {
        name: '发票',
        path: '/sales/bill',
        component: './Bill',
      } 
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
