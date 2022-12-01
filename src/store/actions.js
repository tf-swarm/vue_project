import { post } from '../utils/http'
const actions = {
  // 因为context和$store是一致的，所以我们可以直接调用context的commit方法去提交mutation
  getAccount(context, param) {
    // 进行异步请求 context是一个和store一模一样的对象，payload就是dispatch时传递过来的数据
    param = param || {}
    post('/account/paging', param)
      .then(res => {
        if (res.status != 0) {
          Vue.$message({
            type: 'error',
            message: res.error || res.msg
          })
          return
        }
        let data = this.getters.getCategoryList(res.data)
        context.commit('getAccountId', data)
      })
      .catch(e => console.log(e))
  }

  // wsDepth(context, param) { // WebSocket 推送盘口信息
  //   param = param || {}
  //   if (typeof WebSocket === 'undefined') {
  //     alert('您的浏览器不支持socket')
  //   } else {
  //     let socket = ''
  //     socket = new WebSocket(param.url) // 实例化socket
  //     socket.onopen = () => { // 监听socket连接
  //       socket.send(JSON.stringify(param.filters || {}))
  //       console.log('socket连接成功')
  //     }
  //     socket.onerror = (event) => { // 监听socket错误信息
  //       console.log('连接错误:', event)
  //     }
  //     socket.onmessage = (msg) => { // 监听socket消息
  //       let data = eval('(' + msg.data + ')')
  //       switch (param.filters.subscribe) {
  //         case 'depth': // '盘口推送'
  //           context.commit('gesSocketDepth', {
  //             socket,
  //             data
  //           })
  //           break
  //       }
  //     }
  //     socket.onclose = () => { // 监听socket中断
  //       socket.close()
  //     }
  //   }
  // }
}

export default actions
