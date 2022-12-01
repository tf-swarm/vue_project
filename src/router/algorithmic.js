const Router = [{
  path: '/algorithmic',
  name: '算法交易',
  component: () => import('@/pages/Main'),
  iconCls: 'fa fa-credit-card',
  children: [
	{
		path: '/Twap',
		name: 'TWAP算法',
		component: () => import('@/pages/algorithmic/TWAP'),
		meta: {
		  title: 'trade_twap',
		}
	},
  ]
}]

export {
  Router
}