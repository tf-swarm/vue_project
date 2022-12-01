const Router = [{
  path: '/analyze',
  name: '分析统计',
  component: () => import('@/pages/Main'),
  iconCls: 'fa fa-line-chart',
  children: [
      {
        path: '/Trades',
        name: '成交记录',
        component: () => import('@/pages/analyze/TradesRecord'),
        meta: {
          title: 'self_TradesRecord',
        }
      },
      {
        path: '/BalanceCount',
        name: '账户余额统计',
        component: () => import('@/pages/analyze/BalanceCount'),
        meta: {
          title: 'self_BalanceCount',
        }
      },
      {
        path: '/BalanceAnalyze',
        name: '账户余额分析',
        component: () => import('@/pages/analyze/BalanceAnalyze'),
        meta: {
          title: 'self_BalanceAnalyze',
        }
      },
      {
        path: '/BalanceRate',
        name: '账户余额占比',
        component: () => import('@/pages/analyze/BalanceRate'),
        meta: {
          title: 'self_BalanceRate',
        }
      },
      {
        path: '/BalanceChange',
        name: '账户余额涨幅',
        component: () => import('@/pages/analyze/BalanceChange'),
        meta: {
          title: 'self_BalanceChange',
        }
      },
      {
        path: '/Deposit',
        name: '充提币记录',
        component: () => import('@/pages/analyze/DepositRecord'),
        meta: {
          title: 'self_DepositRecord',
        }
      },
    ]
}]

export {
  Router
}