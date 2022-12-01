import axios from 'axios' // 引用axios
import {
  MessageBox,
  Message
} from 'element-ui'
// import Qs from 'qs' //引入数据格式化
import router from '@/router'
axios.defaults.withCredentials = true
axios.defaults.baseURL = '/api'

// http request 拦截器，通过这个，我们就可以把Cookie传到后台
axios.interceptors.request.use(
  config => {
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// http response 拦截器
axios.interceptors.response.use(
  response => {
	 // console.log(response)
    if (response.status === 200) {
      // console.log('请求拦截返回参数', response)
      if (response.data.status == 100) {
        console.log(router)
        // 只弹窗，点击跳到登入页
        // localStorage.removeItem('user')
        // MessageBox.alert('登录状态已失效，请重新登录', '温馨提示', {
        //   confirmButtonText: '确定',
        //   type: 'warning',
        //   callback: action => {
        //     if (action == 'confirm') {
        //       console.log(action);
        //       router.push({
        //         path: '/login'
        //       })
        //     }
        //   }
        // })
      }
    }
    return response
  },
  error => {
    /***** 接收到异常响应的处理开始 *****/
    if (error && error.response) {
      // 1.公共错误处理
      // 2.根据响应码具体处理
      switch (error.response.status) {
        case 400:
          Message.error('错误请求')
          break
        case 401:
          Message.error('未授权，请重新登录')
          break
        case 403:
          Message.error('拒绝访问')
          break
        case 404:
          Message.error('请求错误,未找到该资源')
          router.push({
            path: '/404'
          })
          break
        case 405:
          Message.error('请求方法未允许')
          break
        case 408:
          Message.error('请求超时')
          break
        case 500:
          Message.error('服务器端出错')
          break
        case 501:
          Message.error('网络未实现')
          break
        case 502:
          Message.error('网络错误')
          break
        case 503:
          Message.error('服务不可用')
          break
        case 504:
          Message.error('网络超时')
          break
        case 505:
          Message.error('http版本不支持该请求')
          break
        default:
          error.message = `连接错误${error.response.status}`
      }
    }
    return Promise.reject(error.response.data)
  }
)

export default axios

/**
 * get 请求方法
 * @param url
 * @param params
 * @returns {Promise}
 */
export function get(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
        params: params
      })
      .then(response => {
        resolve(response.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * post 请求方法
 * @param url
 * @param data
 * @returns {Promise}
 */
export function post(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.post(url, data).then(
      response => {
        resolve(response.data)
      },
      err => {
        reject(err)
      }
    )
  })
}

/**
 * patch 方法封装
 * @param url
 * @param data
 * @returns {Promise}
 */
export function patch(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.patch(url, data).then(
      response => {
        resolve(response.data)
      },
      err => {
        reject(err)
      }
    )
  })
}

/**
 * put 方法封装
 * @param url
 * @param data
 * @returns {Promise}
 */
export function put(url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.put(url, data).then(
      response => {
        resolve(response.data)
      },
      err => {
        reject(err)
      }
    )
  })
}