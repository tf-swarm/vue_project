import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'


Vue.config.productionTip = false

// 判断生成环境
console.log(process.env.VUE_APP_BASE_URL)
console.log(process.env.VUE_APP_BASE_WS)

Vue.prototype.$constants = {
  auth: 'X-CSRFToken',
  token: 'csrf_token'
}

import 'font-awesome/css/font-awesome.min.css'
// 按需引入element-ui组件
import 'element-ui/lib/theme-chalk/index.css'
import './elementUI'

import moment from 'moment'
Vue.prototype.$moment = moment

import md5 from 'js-md5'
Vue.prototype.$md5 = md5

import axios from 'axios'
import { post, get } from './utils/http'
import * as echarts from 'echarts'

// 将axios添加到原型链上
Vue.prototype.$axios = axios
// 定义全局变量
Vue.prototype.$post = post
Vue.prototype.$get = get
Vue.prototype.$echarts = echarts

// 验证input表单
import Directives from '@/directives/input/index' // 添加此行=>自定义全局指令
Vue.use(Directives) // 添加此行=>使用该全局指令

Vue.prototype.$webpackConfig = require('../package.json')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
