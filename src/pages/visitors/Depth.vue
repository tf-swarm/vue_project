<template>
  <section class="depth">
    <el-row>
      <el-row class="grid-content bg-purple-light" style="margin-left: 10px">
        <el-col :span="24" class="toolbar">
          <!--工具条-->
          <el-form :inline="true">
            <el-form-item>
              <el-select v-model="filters.exchange" clearable disabled placeholder="交易所">
                <el-option :label="'全部'" :value="null"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="filters.symbol" clearable disabled placeholder="币种">
                <el-option :label="'全部'" :value="null"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getDepth" icon="el-icon-refresh">刷新</el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <!-- 盘口 -->
        <el-col :span="24" class="toolbar" v-loading="depthListLoading">
          <!-- 卖 -->
          <div class="grid-content bg-purple">
            <el-table ref="sellTable" :data="sellList" style="width: 100%" max-height="380px" :cell-class-name="addClass">
              <el-table-column v-for="item in headerList" :key="item.key" :prop="item.key" :label="item.title" header-align="center" align="center" min-width="100" :show-overflow-tooltip="true"
                :scoped-slot="labelHead">
              </el-table-column>
            </el-table>
          </div>
          <!-- 买 -->
          <div class="grid-content bg-purple">
            <el-table ref="buyTable" :data="buyList" style="width: 100%;margin-top: 20px;" max-height="380px" :cell-class-name="addClass">
              <el-table-column v-for="item in headerList" :key="item.key" :prop="item.key" :label="item.title" header-align="center" align="center" min-width="100" :show-overflow-tooltip="true"
                :scoped-slot="labelHead">
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </el-row>
  </section>
</template>

<script>
import { depthData } from '@/utils/index'
const rules = {}

let data = () => {
  return {
    rules: rules,
    // url: process.env.VUE_APP_BASE_WS',
    filters: {
      subscribe: 'depth',
      exchange: 'TAIBI',
      symbol: 'TBI/USDT'
    },
    order: 'DESC',
    sort: 'createDate',
    // 盘口
    rows: [],
    sellList: [],
    buyList: [],
    depthListLoading: false,
    pricePrecision: 4,
    volumePrecision: 4,
    depthTime: null,
    headerList: [
      { title: '', key: 'index' },
      { title: '价 格', key: 'price' },
      { title: '盘口数量', key: 'depthVolume' },
      { title: '盘口数量累计', key: 'depthTotal' },
      { title: '盘口资金累计', key: 'depthAmount' }
    ],
    keys: ['depthTotal', 'depthAmount']
  }
}

// 刷新
let getDepth = function (bool) {
  this.depthListLoading = true
  let params = this.filters
  this.$get('/order/depth', params)
    .then(res => {
      // console.log(res);
      this.depthListLoading = false
      if (res.status != 0) {
        this.$message({
          message: '数据加载失败',
          type: 'error'
        })
        return
      }
      this.sellList = depthData(
        this.keys,
        res.data.asks,
        this.pricePrecision,
        this.volumePrecision,
        '卖'
      )
      this.buyList = depthData(
        this.keys,
        res.data.bids,
        this.pricePrecision,
        this.volumePrecision,
        '买'
      )
      setTimeout(() => {
        // 设置卖盘滚动条向下
        let scrollHeight = this.$refs.sellTable.bodyWrapper.scrollHeight
        this.$refs.sellTable.bodyWrapper.scrollTop = scrollHeight
      }, 0)
      this.$message({
        message: '数据加载成功',
        type: 'success'
      })
    })
    .catch(() => (this.depthListLoading = false))
}

// 修改标题内容过长
let labelHead = function (h, { column, index }) {
  // console.log(column);
  let l = column.label.length
  let f = 16 //每个字大小，其实是每个字的比例值，大概会比字体大小差不多大一点，
  column.minWidth = f * l //字大小乘个数即长度 ,注意不要加px像素，这里minWidth只是一个比例值，不是真正的长度 //然后将列标题放在一个div块中，注意块的宽度一定要100%，否则表格显示不完全
  return h('div', { class: 'table-head', style: { width: '100%' } }, [
    column.label
  ])
}

export default {
  data: data,
  methods: {
    getDepth, // 不需要刷新
    labelHead,
    addClass ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0 || columnIndex == 1) {
        if (row.index.indexOf('卖') == 0) {
          return 'sellPrice'
        } else {
          return 'buyPrice'
        }
      }
    }
  },
  created () {
    // 获取登录id
    // this.$store.dispatch('wsDepth', { url: this.url, filters: this.filters })
    this.getDepth()
  },
  mounted () { },
  watch: {
    // '$store.state.depthData' (newData, oldData) {
    //   this.depthTime = (Date.now() / 1000 - newData.time / 1000).toFixed(2)
    //   this.sellList = depthData(this.keys, newData.asks, this.pricePrecision, this.volumePrecision, '卖')
    //   this.buyList = depthData(this.keys, newData.bids, this.pricePrecision, this.volumePrecision, '买')
    // }
  }
}
</script>

<style lang="less">
.depth {
  .sellPrice {
    color: #e85b5b;
  }
  .buyPrice {
    color: #01c57b;
  }
  .el-table th div {
    font-weight: 400;
    line-height: 18px;
    padding: 0 !important;
  }

  .has-gutter .cell,
  .el-table th .table-head {
    color: #033;
  }
  .el-table tr td {
    padding: 0;
    .cell {
      padding: 5px 2px !important;
    }
  }

  .el-table .cell,
  .el-table th div,
  .el-table--border td:first-child .cell,
  .el-table--border th:first-child .cell {
    padding-left: 0 !important;
  }
  .table-head {
    font-size: 14px !important; //设置固定的字体大小
  }
}

// .fade-enter {
//   opacity: 0;
// }
// .fade-leave {
//   opacity: 1;
// }
// .fade-enter-active {
//   transition: opacity 0.5s;
// }
// .fade-leave-active {
//   opacity: 0;
//   transition: opacity 0.5s;
// }
</style>
