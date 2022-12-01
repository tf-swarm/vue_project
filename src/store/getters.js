const getters = {
  // 处理分类 category
  getCategoryList: state => result => {
    return result.map(item => {
      // if (Object.keys(state.classifyList).indexOf(item.category) != -1) {
      //   const index = Object.keys(state.classifyList).indexOf(item.category)
      //   item.category_name = Object.values(state.classifyList)[index]
        if (
          item.balance &&
          Object.keys(item.balance).length > 1 &&
          item.balance instanceof Object
        ) {
          for (const key in item.balance) {
            if (item.balance.hasOwnProperty(key)) {
              if (key && key != 'time') {
                item.balance[key]['total'] = 0
                for (const k in item.balance[key]) {
                  if (k != 'total') {
                    item.balance[key]['total'] += parseFloat(
                      item.balance[key][k]
                    )
                    item.balance[key][k] = parseFloat(
                      item.balance[key][k]
                    ).toFixed(4)
                  } else {
                    item.balance[key][k] = parseFloat(
                      item.balance[key][k]
                    ).toFixed(4)
                  }
                  state.keys.push(`balance.${key}.${k}`)
                }
                state.symbol.push(key)
              }
            }
          }
        }
        return item
      // } else {
      //   const index = Object.keys(state.classifyList).indexOf(item)
      //   return [item, Object.values(state.classifyList)[index]]
      // }
    })
  }
}

export default getters
