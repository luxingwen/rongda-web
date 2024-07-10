import { layout } from "@/app";

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
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
    {
        name: '用户管理',
        path: '/user',
        component: './User/Maneger',
    },
    {
        name: '角色管理',
        path: '/role',
        component: './Role',
    },
    {
        name: '团队管理',
        path: '/team',
        component: './Team',
    },
    {
        name: '菜单管理',
        path: '/menu',
        component: './Menu',
    }
]