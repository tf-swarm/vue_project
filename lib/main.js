import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

// 判断生成环境
console.log(process.env.VUE_APP_BASE_URL);
console.log(process.env.VUE_APP_BASE_WS);

Vue.prototype.$constants = {
  auth: 'X-CSRFToken',
  token: 'csrf_token'
};

import 'font-awesome/css/font-awesome.min.css';
// import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import { Button, Select, Input, Table, TableColumn, Form, FormItem, Loading, Message } from 'element-ui';
Vue.use(Button).use(Select).use(Input).use(Table).use(TableColumn).use(Form).use(FormItem).use(Loading.directive);
// Vue.use(ElementUI)
Vue.prototype.$message = Message;
Vue.prototype.$loading = Loading.service;
console.log(Loading);

import moment from 'moment';
Vue.prototype.$moment = moment;

import axios from 'axios';

import { post, get } from './utils/http';
// 将axios添加到原型链上
Vue.prototype.$axios = axios;

// 定义全局变量
Vue.prototype.$post = post;
Vue.prototype.$get = get;

// import axios from 'axios'
// import VueAxios from 'vue-axios'
// // axios.defaults.crossDomain = true
// axios.defaults.withCredentials = true
// axios.defaults.baseURL = '/api'
// axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
// Vue.use(VueAxios, axios)


// 验证input表单
import Directives from "@/directives/index";
Vue.use(Directives);

// // 请求拦截器
// axios.interceptors.request.use(
//   config => {
//     // console.log(config);
//     // 更新最新的token
//     // if (cookies.isKey(constants.token)) {
//     //   config.headers.common[constants.auth] = cookies.get(constants.token)
//     // }
//     return config
//   },
//   error => {
//     return Promise.reject(error)
//   }
// )

// // 响应拦截器
// axios.interceptors.response.use(
//   response => {
//     // console.log(response);
//     if (!response.data) return response
//     if (response.data.status == 100) {
//       router.replace({
//         path: '/login'
//       })
//     }
//     if (!response.data || response.data.status != 0 || response.data.status != 401) {
//       return response
//     }
//     // console.log('=========未获取到身份认证========')
//     // if (cookies.isKey(constants.token)) {
//     //   cookies.remove(constants.token)
//     //   console.log('==请求失败，移除token==')
//     // }
//     location.reload()
//     return Promise.reject(response)
//   },
//   error => {
//     if (error.response) {
//       console.log(error.response);

//       switch (error.response.status) {
//         // 返回400，token过期并跳转到登录页面
//         case 400:
//           location.reload()
//           message({
//             type: "error",
//             message: "请求出错"
//           });
//           break
//         // 返回401，清除token信息并跳转到登录页面
//         case 401:
//           message({
//             type: 'error',
//             message: '账号未登录，请重新登录'
//           })
//           break
//         case 500:
//           message({
//             type: 'error',
//             message: '服务器已断开，请重新连接'
//           })
//           break
//       }
//       // 返回接口返回的错误信息
//       return Promise.reject(error.response.data)
//     }
//   }
// )

Vue.prototype.$webpackConfig = require('../package.json');

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');