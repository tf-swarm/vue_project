import Positive from './positive';
const directives = [Positive];
/**
 * 验证float类型的数字时建议用text类型的input表单
 * 自然数: type="number"  v-positive="'num'" 
 * 正整数: type="number"  v-positive="'int'" 
 * 小 数 : type="text"    v-positive="'float'" 
 */
export default {
  install: Vue => {
    if (directives.length && directives.length > 0) {
      directives.map(item => {
        Vue.directive(item.key, item.func);
      });
    }
  }

  /**
    Vue.directive('number', {
      inserted: function (el) {
        console.log(el.children[0].value);
        el.addEventListener("keypress", (e) => {
          e = e || window.event;
          let charcode = typeof e.charCode == 'number' ? e.charCode : e.keyCode;
          let reg = /\d/
          if (charcode == 46) {
            // 用element-ui使用el.children[0],
            if (el.children[0].value.includes('.')) {
              e.preventDefault();
            }
            return;
          } else if (!reg.test(String.fromCharCode(charcode)) && charcode > 9 && !e.ctrlKey) {
            if (e.preventDefault) {
              e.preventDefault();
            } else {
              e.returnValue = false;
            }
          }
        });
      }
    })
  */

};