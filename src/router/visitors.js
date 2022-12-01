// 游客路由
const Router = [
  {
    path: '/visitors',
    name: '游客订单管理',
    component: () => import('@/pages/Main'),
    iconCls: 'fa fa-bold',
    hidden: true,
    children: [
      {
        path: '/visitors/depth',
        name: '游客盘口',
        component: () => import('@/pages/visitors/Depth'),
        meta: {
          requireAuth: true
        }
      }
    ]
  }
]

export { Router }
