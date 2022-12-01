const Router = [{
  path: '/rights',
  name: '权限管理',
  component: () => import('@/pages/Main'),
  iconCls: 'fa el-icon-s-check',
  children: [
  {
    path: '/Role',
    name: '角色列表',
    component: () => import('@/pages/rights/Role'),
    meta: {
      title: 'Roles_list',
	  }
    },
	{
	  path: '/Permission',
	  name: '权限列表',
	  component: () => import('@/pages/rights/Permission'),
	  meta: {
	    title: 'permission_list',
		}
	}
	]
}]

export {
  Router
}