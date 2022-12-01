const Router = [{
  path: '/order',
  name: '订单管理',
  component: () => import('@/pages/Main'),
  iconCls: 'fa fa-bold',
  children: [{
    path: '/Depth',
    name: '盘口数据',
    component: () => import('@/pages/order/Depth'),
    meta: {
      title: 'batch_order'
    }
  }]
}]

export {
  Router
}