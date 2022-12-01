/**
 *  formatJson 格式数据
 *  @param {Array} filterVal  格式头
 *  @param {Array} tableData  用来格式的表格数据
 *  @param {Boolean}  bool    布尔值
 */
function formatJson(filterVal, tableData, bool) {
  return tableData.map(v => {
    return filterVal.map(j => {
      if (Object.keys(v).length == 0) {
        return
      }
      let arr = j.split('.')
      if (bool) {
        if (arr.length == 1) {
          return v[j]
        }
        if (arr.length == 2) {
          return v[arr[0]][arr[1]]
        }
        if (arr.length == 3) {
          return v[arr[0]][arr[1]][arr[2]]
        }
      } else {
        return v[j]
      }
    })
  })
}

/**
 * handleExport 导出方法
 * @param {Array} header     标题
 * @param {Array} tableData  数据
 * @param {String} filename  文件标题
 * @param {Function} message 消息提示
 * @param {Boolean}  bool    布尔值
 */
export function handleExport(header, tableData, filename, message, bool) {
  require.ensure([], () => {
    const { export_json_to_excel } = require('@/assets/Export2Excel')
    let tHeader = []
    let filterVal = []
    if (!header) {
      return
    }
    header.forEach(item => {
      tHeader.push(item.title)
      filterVal.push(item.key)
    })
    let data = formatJson(filterVal, tableData, bool)
    export_json_to_excel(tHeader, data, filename)
    message.success('导出成功')
  })
}

/**
 * dataURLToBlob    ie图片转格式
 * @param {String} dataurl  格式化图片
 */
function dataURLToBlob(dataurl) {
  let arr = dataurl.split(',')
  if (arr[1] == '') return
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], {
    type: mime
  })
}

/**
 * downloadResult   截图下载
 * @param {DOM}   canvasID
 * @param {String}   filename  图片名称
 * @param {Function} message   消息提示
 */
export function downloadResult(canvasID, filename, message) {
  const html2canvas = require('html2canvas')
  let a = document.createElement('a')
  html2canvas(canvasID).then(canvas => {
    let dom = document.body.appendChild(canvas)
    dom.style.display = 'none'
    a.style.display = 'none'
    document.body.removeChild(dom)
    let blob = dataURLToBlob(dom.toDataURL('image/png'))
    if (!blob) return
    a.setAttribute('href', URL.createObjectURL(blob))
    a.setAttribute('download', filename + '.png')
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(blob)
    document.body.removeChild(a)
    message.success('截图成功')
  })
}

/**
 * assetDynamicTitle   资产标题动态
 * @param {Array}    symbol 币种
 * @param {Array}    keys   对象键
 * @param {Boolean}  bool   布尔值
 */
export function assetDynamicTitle(symbol, keys, bool) {
  let assetsList = [
    {
      title: '更新时间',
      key: bool ? 'balance.time' : 'fund.time',
      min: '180'
    },
    {
      title: '交易所',
      key: 'exchange',
      min: '120'
    }
  ]
  if (bool) {
    assetsList.push({
      title: '账号名称',
      key: 'account_name',
      min: '120'
    })
  }
  Array.from(new Set(symbol)).forEach((item, i, arr) => {
    let data = [
      {
        title: arr[arr.length - i - 1] + '可用',
        key: Array.from(new Set(keys))[
          (Array.from(new Set(keys)).length / arr.length) * (arr.length - i - 1)
        ],
        min: '120'
      },
      {
        title: arr[arr.length - i - 1] + '冻结',
        key: Array.from(new Set(keys))[
          (Array.from(new Set(keys)).length / arr.length) *
            (arr.length - i - 1) +
            1
        ],
        min: '120'
      }
    ]
    if (bool) {
      data.push({
        title: arr[arr.length - i - 1] + '合计',
        key: Array.from(new Set(keys))[
          (Array.from(new Set(keys)).length / arr.length) *
            (arr.length - i - 1) +
            2
        ],
        min: '120'
      })
    }
    assetsList = [...assetsList, ...data]
  })
  return assetsList
}

/**
 * getDepthData   盘口
 * @param {Array}   keys   键
 * @param {Array}   data   盘口数据
 * @param {String}  side   交易方向
 * @param {Number}  pricePrecision   价格精度
 * @param {Number}  volumePrecision  数量精度
 */
export function depthData(keys, data, pricePrecision, volumePrecision, side) {
  let place = {
    depthTotal: 0,
    depthAmount: 0
  }
  let result = data.map((v, i) => {
    let depth = {
      index: side + (i + 1),
	    price: parseFloat(v.price).toFixed(pricePrecision),
	    external: parseFloat(v.external).toFixed(volumePrecision),
	    interior: parseFloat(v.interior).toFixed(volumePrecision),
      depthVolume: parseFloat(v.amount).toFixed(volumePrecision)
    }
    keys.forEach((j, n) => {
      depth[j] = (parseFloat(v.external) + place[j]).toFixed(volumePrecision)
      if (n === 1) {
        depth[j] = (parseFloat(v.price * v.external) + place[j]).toFixed(pricePrecision)
      }
      place[j] = parseFloat(depth[j])
    })
    return depth
  })
  if (side == '卖') {
    return result.sort((a, b) => b.price - a.price)
  } else {
    return result
  }
}
