let data = JSON.parse(localStorage.getItem('user') || '{}')

const state = {
  loginMsg: data, // 登录状态
  // depthSocket: null,
  // depthData: {}, // 盘口数据
  accountClassify: [], // 账号分类
  memberId: [], // 账号ID
  symbol: [], // 资金分类
  keys: [], // 资产列表
  classifyList: {
    // 所有分类
    // self_trade: '价格监控',
	batch_order: '盘口数据',
	order_book: '铺单策略',
	brush_order: '对敲策略',
	damping_order: '阻尼挂单',
	trade_twap: 'TWAP算法'
  }
}

export default state