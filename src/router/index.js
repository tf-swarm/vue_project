import Vue from 'vue'
import Router from 'vue-router'
// import store from '@/store/index'
Vue.use(Router)

let routes = [{
    path: '/login',
    component: () => import('@/pages/Login')
  },
  {
    path: '/register',
    component: () => import('@/pages/Register')
  },
  {
    path: '/',
    component: () => import('@/pages/Main'),
    redirect: '/index',
    children: [{
      path: '/index',
      hidden: true,
      component: () => import('@/pages/Dashboard'),
      name: '首页'
    }]
  },
  {
    path: '/404',
    name: 'notFound',
    component: () => import('@/pages/error/404')
  },
  // {
  //   path: '*', // 此处需特别注意置于最底部
  //   redirect: '/404',
  //   hidden: true
  // }
]

import {
  Router as OrderRouter
} from './order'
OrderRouter.forEach(item => {
  routes.push(item)
})

import {
  Router as MarketRouter
} from './market'
MarketRouter.forEach(item => routes.push(item))

import {
  Router as AlgorithmicRouter
} from './algorithmic'
AlgorithmicRouter.forEach(item => routes.push(item))

import {
  Router as QuantifyRouter
} from './quantify'
QuantifyRouter.forEach(item => routes.push(item))

import {
  Router as AnalyzeRouter
} from './analyze'
AnalyzeRouter.forEach(item => routes.push(item))

import {
  Router as Risk_ManageRouter
} from './risk'
Risk_ManageRouter.forEach(item => routes.push(item))

import {
  Router as SystemRouter
} from './system'
SystemRouter.forEach(item => routes.push(item))

import {
  Router as visitorsRouter
} from './visitors'
visitorsRouter.forEach(item => routes.push(item))

import {
  Router as permissionRouter
} from './rights'
permissionRouter.forEach(item => routes.push(item))

const router = new Router({
  routes: routes
})
router.beforeEach((to, from, next) => {
  // if (to.path !== '/order/Depth' && store.state.depthSocket) { // 关闭盘口
  //   store.state.depthSocket.close();
  // }
  console.log(to.path)
  // console.log(localStorage.getItem('user'))
  if (localStorage.getItem('user')) {
    // 是否已经登陆，验证身份
    let classify = JSON.parse(localStorage.getItem('user') || '{}')
	  console.log(classify)
	
	// // 处理类别权限
 //    router.options.routes.some(item => {
	//   console.log(item)
 //      if (item.children && item.path !== '/' && item.path !== '/login' && item.path !== '/register' && item.path !== '/system') {
	// 		item.children.forEach(c => {
	// 		  if (c.meta && c.meta !== 'undefined' && classify) {
	// 			if (!new Set(classify.categories).has(c.meta.title)) {
	// 			  if (c.meta.requireAuth) {
	// 				return
	// 			  }
	// 			  c.hidden = true
	// 			}
	// 		  }
	// 		})
	// 	}
 //    })
    next() // 程序正常继续运行
  } else {
    if (to.path === '/login' || to.path === '/register' || to.path === '/404') {
      return next() // 程序正常继续运行
    } else {
		console.log('登录拦截')
		if (!localStorage.getItem('user')) {
		  Vue.prototype.$alert('登录状态已失效，请重新登录', '温馨提示', {
		    confirmButtonText: '确定',
		    type: 'warning',
		    // center: true,
		    callback: action => {
		      if (action == 'confirm') {
				  // 程序正常继续运行
				  return next('/login')
		      }
		    }
		  })
		}
    }
  }
})

export default router