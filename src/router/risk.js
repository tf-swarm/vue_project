const Router = [{
  path: '/risk',
  name: '风险管理',
  component: () => import('@/pages/Main'),
  iconCls: 'fa fa-exclamation',
  children: [
	{
		path: '/MarketControl',
		name: '市场监控',
		component: () => import('@/pages/risk/market_monitoring'),
		meta: {
		  title: 'risk_market',
		}
	},
	{
		path: '/AccountControl',
		name: '账户监控',
		component: () => import('@/pages/risk/account_monitoring'),
		meta: {
		  title: 'risk_market',
		}
	}
  ]
}]

export {
  Router
}