const Router = [{
  path: '/quantify',
  name: '量化投资',
  component: () => import('@/pages/Main'),
  iconCls: 'fa fa-dollar',
  children: [{
	  path: '/DampingOrder',
	  name: '阻尼挂单',
	  component: () => import('@/pages/quantify/DampingOrder'),
	  meta: {
	    title: 'self_DampingOrder',
		}
	}]
}]

export {
  Router
}