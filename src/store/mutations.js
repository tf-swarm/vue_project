const mutations = {
  getLogin(state, res) {
    state.loginMsg = res
  },
  getAccountId(state, res) {
    // 账号
    state.memberId = this.getters.getCategoryList(res)
    state.accountClassify = [
      ...new Map(res.map(item => [item.category, item.category_name]))
    ]
  }
  // gesSocketDepth(state, res) { // 获取盘口推送信息
  //   state.depthSocket = res.socket
  //   state.depthData = res.data
  // },
}

export default mutations
