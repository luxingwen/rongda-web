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
        name: '仓库信息详情',
        path: '/storehouse/detail/:uuid',
        component: './Storehouse/Manager/Detail',
        hideInMenu: true,
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
            name: '库存详情',
            path: '/storehouse/inventory/storehouse-product-detail/:uuid',
            component: './Storehouse/InventoryQuery/Detail',
            hideInMenu: true,
          },
          {
            name: '入库',
            path: '/storehouse/inventory/in',
            component: './Storehouse/InventoryIn',
          },
          {
            name: '入库详情',
            path: '/storehouse/inventory/inbound-detail/:uuid',
            component: './Storehouse/InventoryIn/Detail',
            hideInMenu: true,
          },
          {
            name: '添加入库',
            path: '/storehouse/inventory/inbound-add',
            component: './Storehouse/InventoryIn/Add',
            hideInMenu: true,
          },
          {
            name: '出库',
            path: '/storehouse/inventory/out',
            component: './Storehouse/InventoryOut',
          },
          {
            name: '添加出库',
            path: '/storehouse/inventory/outbound-add',
            component: './Storehouse/InventoryOut/Add',
            hideInMenu: true,
          },
          {
            name: '出库详情',
            path: '/storehouse/inventory/outbound-detail/:uuid',
            component: './Storehouse/InventoryOut/Detail',
            hideInMenu: true,
          },
         
          {
            name: '库存盘点',
            path: '/storehouse/inventory/check',
            component: './Storehouse/InventoryCheck',
          },
          {
            name: '添加盘点',
            path: '/storehouse/inventory/check-add',
            component: './Storehouse/InventoryCheck/Add',
            hideInMenu: true,
          },
          {
            name: '盘点明细',
            path: '/storehouse/inventory/check-detail/:uuid',
            component: './Storehouse/InventoryCheck/Detail',
            hideInMenu: true,
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
        name: '创建采购订单',
        path: '/purchase/order/add',
        component: './Purchase/Order/Add',
        hideInMenu: true,
      },
      {
        name: '编辑采购订单',
        path: '/purchase/order/edit/:uuid',
        component: './Purchase/Order/Add',
        hideInMenu: true,
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
        name: '订单详情',
        path: '/sales/order/detail/:uuid',
        component: './Sales/Order/Detail',
        hideInMenu: true,
      },
      {
        name: '添加订单',
        path: '/sales/order/add',
        component: './Sales/Order/Add',
        hideInMenu: true,
      },
      {
        name: '编辑订单',
        path: '/sales/order/edit/:uuid',
        component: './Sales/Order/Add',
        hideInMenu: true,
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
      },
      {
        name: '添加发票',
        path: '/sales/bill/add',
        component: './Bill/Add',
        hideInMenu: true,
      },
      {
        name: '编辑发票',
        path: '/sales/bill/edit/:uuid',
        component: './Bill/Add',
        hideInMenu: true,
      },
      {
        name: '详情',
        path: '/sales/bill/detail/:uuid',
        component: './Bill/Detail',
        hideInMenu: true,
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
