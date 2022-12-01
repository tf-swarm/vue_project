import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import mutations from './mutations'
import getters from './getters'
import actions from './actions'
// import vuexAlong from 'vuex-along'
Vue.use(Vuex)

export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions
  // plugins: [vuexAlong()] // 持久化存储 state
})
