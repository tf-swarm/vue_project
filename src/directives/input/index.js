import Positive from './positive'

const directives = [Positive]
/**
 * 验证float类型的数字时建议用text类型的input表单
 * 自然数: type="number"  v-positive="'num'"
 * 正整数: type="number"  v-positive="'int'"
 * 小 数 : type="text"    v-positive="'float'"
 * 字 母 : type="text"    v-positive="'letter'"
 */
export default {
  install: Vue => {
    if (directives.length && directives.length > 0) {
      directives.map(item => {
        Vue.directive(item.key, item.func)
      })
    }
  }
}
