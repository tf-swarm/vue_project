const Router = [
  {
    path: '/system',
    name: '系统管理',
    component: () => import('@/pages/Main'),
    iconCls: 'fa fa-desktop',
    children: [
	   {
		  path: '/User',
		  component: () => import('@/pages/system/User'),
		  name: '用户管理'
	  },
      {
        path: '/Account',
        component: () => import('@/pages/system/Account'),
        name: '账户管理'
      }
    ]
  }
]

export { Router }
