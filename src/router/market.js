const Router = [{
  path: '/market',
  name: '做市管理',
  component: () => import('@/pages/Main'),
  iconCls: 'fa fa-star-half-o',
  children: [
	// {
 //    path: '/market/priceMonitor',
 //    name: '价格监控',
 //    component: () => import('@/pages/market/PriceMonitor'),
 //    meta: {
 //      title: 'self_trade'
 //     }
 //   },
  {
    path: '/OrderBook',
    name: '铺单策略',
    component: () => import('@/pages/market/OrderBook'),
    meta: {
      title: 'OrderBook_strategy',
	  }
    },
	{
	  path: '/BrushOrder',
	  name: '对敲策略',
	  component: () => import('@/pages/market/BrushOrder'),
	  meta: {
	    title: 'BrushOrder_strategy',
		}
	}
	]
}]

export {
  Router
}