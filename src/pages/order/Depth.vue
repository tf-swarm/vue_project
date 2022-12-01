<template>
  <section class="depth">
    <el-row v-if="query_data">
      <el-col :span="24" class="toolbar grid-content bg-purple-light" >
        <!--工具条-->
        <el-form :inline="true" style="width: 100%">
          <el-form-item>
            <el-select v-model="filters.accountName" clearable placeholder="账户"  @change="changeLabel">
              <!-- <el-option :label="'全部'" :value="null"> </el-option> -->
			        <el-option v-for="item in account_list" :key="item.id" :label="item.Name" :value="item.Name" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-select v-model="filters.symbol" clearable placeholder="币种" @change="changeSymbol($event)">
              <!-- <el-option :label="'全部'" :value="null"> </el-option> -->
              <!-- <el-option v-for="item in classifyList" :key="item[0]" :label="item[1]" :value="item[0]" /> -->
			        <el-option v-for="item in symbol_list" :key="item.id" :label="item.Name" :value="item.Name" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="hidden = !hidden" :icon="hidden ? 'el-icon-s-fold' : 'el-icon-s-unfold'">
            </el-button>
            <el-button type="primary" @click="getDepth" icon="el-icon-refresh">刷新</el-button>
			      <el-tag type="success" style="margin-left: 90px;width: 200px;text-align: center;font-size: 18px;">价差: {{difference_price}}%</el-tag>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-row v-if="operate">
      <el-col :span="hidden ? 5 : 0" style="padding:10px 10px 0 0;" >
        <transition name="fade" mode="out-in">
          <div v-show="hidden" class="content">
            <!-- 下单组件 -->
            <vue-buy-sell-order :buySellPrice="buySellPrice" :buySellvolume="buySellvolume" :select_exchange="filters.accountName" :select_symbol="filters.symbol" :rate="rate"></vue-buy-sell-order>
          </div>
        </transition>
      </el-col>
      <!-- 盘口 -->
      <el-col :span="hidden ? 19 : 24" class="toolbar" v-loading="depthListLoading">
        <!-- 卖 -->
        <div class="grid-content bg-purple">
          <el-table ref="sellTable" :data="sellList" style="width: 100%" max-height="380px" @row-click="orderRowClick" :cell-class-name="addClass">
            <el-table-column v-for="item in headerList" :key="item.key" :prop="item.key" :label="item.title" header-align="center" align="center" min-width="100" :show-overflow-tooltip="true" :scoped-slot="labelHead">
            </el-table-column>
          </el-table>
        </div>

        <!-- 买 -->
        <div class="grid-content bg-purple">
          <el-table ref="buyTable" :data="buyList" style="width: 100%;margin-top: 20px;" max-height="380px" @row-click="orderRowClick" :cell-class-name="addClass">
            <el-table-column v-for="item in headerList" :key="item.key" :prop="item.key" :label="item.title" header-align="center" align="center" min-width="100" :show-overflow-tooltip="true" :scoped-slot="labelHead">
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </section>
</template>

<script>
import vueBuySellOrder from '@/components/buySellOrder'
import { depthData } from '@/utils/index'
const rules = {}

let data = () => {
  return {
    rules: rules,
    activeName: 'LIMIT',
    hidden: true,
    // 页面权限
    query_data: 0,
    operate: 0,
    // ws 请求参数
    // url: process.env.VUE_APP_BASE_WS || 'ws://149.129.63.11:8131',
    filters: {
      subscribe: 'depth',
      accountName: null,
      symbol: null,
      accountId: null
    },
    total: 0,
    page: 1,
    size: 20,
    order: 'DESC',
    sort: 'createDate',
    // 下单
    buySellPrice: 0,
    buySellvolume: 0,
    rate: 0,
    // 盘口
    rows: [],
    sellList: [],
    buyList: [],
	  account_list: [],
	  symbol_list: [],
    depthTime: null,
    depthListLoading: false,
    pricePrecision: 0,
    volumePrecision: 0,
	  difference_price: 0,
    status: true,
    headerList: [
      { title: '', key: 'index' },
      { title: '价 格', key: 'price' },
	    { title: '外部数量', key: 'external' },
	    { title: '内部数量', key: 'interior' },
      { title: '总量', key: 'depthVolume' },
      { title: '外部累计数量', key: 'depthTotal' },
      { title: '外部累计资金', key: 'depthAmount' }
    ],
    keys: ['depthTotal', 'depthAmount']
  }
}

let getDepth = function (bool) {
  // 刷新
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
      // 页面权限
      this.query_data = res.power.query
      this.operate = res.power.operate

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

	    this.difference_price = res.data.dif_price
      setTimeout(() => {
        // 设置卖盘滚动条向下
        let scrollHeight = this.$refs.sellTable.bodyWrapper.scrollHeight
        this.$refs.sellTable.bodyWrapper.scrollTop = scrollHeight
      }, 0)
      // 获取可用余额
      this.$message({
        message: '数据加载成功',
        type: 'success'
      })
    })
    .catch(() => (this.depthListLoading = false))
}

let labelHead = function (h, { column, index }) {
  // 修改标题内容过长
  // console.log(column);
  let l = column.label.length
  let f = 16 //每个字大小，其实是每个字的比例值，大概会比字体大小差不多大一点，
  column.minWidth = f * l //字大小乘个数即长度 ,注意不要加px像素，这里minWidth只是一个比例值，不是真正的长度 //然后将列标题放在一个div块中，注意块的宽度一定要100%，否则表格显示不完全
  return h('div', { class: 'table-head', style: { width: '100%' } }, [
    column.label
  ])
}

let orderRowClick = function (row, column, event) {
  this.$nextTick(() => {
    this.buySellPrice = row.price
    this.buySellvolume = row.depthTotal
	  console.log(this.buySellPrice)
	  console.log(this.buySellvolume)
  })
}

let changeSymbol = function(val){
	if (!val){
		return;
	}
  
	this.filters.symbol = val
	console.log('币种', this.filters.symbol)
	this.getDepth()
}

export default {
  components: {
    vueBuySellOrder
  },
  data: data,
  methods: {
    getDepth,
    labelHead,
    orderRowClick,
	  changeSymbol,
    handleSelectionChange (val) {
      if (val.length > 1) {
        this.$refs.accountTable.clearSelection()
        this.$refs.accountTable.toggleRowSelection(val[val.length - 1])

        this.selection = []
        this.selection.push(val[val.length - 1])
      } else {
        this.selection = val
      }
    },
    addClass ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0 || columnIndex == 1) {
        if (row.index.indexOf('卖') == 0) {
          return 'sellPrice'
        } else {
          return 'buyPrice'
        }
      }
    },
	changeLabel(val){
		for(var i=0; i< this.account_list.length; i++){
			if(val == this.account_list[i].Name){
				this.symbol_list = this.account_list[i].symbol
				if(this.filters.symbol){
					this.filters.symbol = null;
				}
				this.filters.accountName = val
        this.filters.accountId = this.account_list[i].id
				console.log('交易所', this.filters.accountName)
			}
		}
	},
  },
  created () {
    // 获取登录id
    this.filters.accountName = this.$store.state.loginMsg.accountName
	  this.filters.symbol = this.$store.state.loginMsg.symbol
    this.filters.accountId = this.$store.state.loginMsg.accountId
    this.account_list = this.$store.state.loginMsg.account_list
    this.symbol_list = this.$store.state.loginMsg.symbol_list

	// this.filters.member_id = this.$store.state.loginMsg.memberId
    this.pricePrecision = this.$store.state.loginMsg.price_precision
    this.volumePrecision = this.$store.state.loginMsg.volume_precision
    // this.$store.dispatch('wsDepth', { url: this.url, filters: this.filters })
	// console.log(this.filters);
    this.getDepth()
  },
  mounted () { },
  watch: {
    // 实时获取ws推送的数据
    // '$store.state.depthData' (newData, oldData) {
    //   this.rate = parseFloat(newData.rate.$_RMB)
    //   this.depthTime = (Date.now() / 1000 - newData.time / 1000).toFixed(2)
    //   this.sellList = depthData(this.keys, newData.asks, this.pricePrecision, this.volumePrecision, '卖')
    //   this.buyList = depthData(this.keys, newData.bids, this.pricePrecision, this.volumePrecision, '买')
    // },
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

  .fade-enter-active,
  .fade-leave-active {
    transition: 1s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
    transform: translateX(1rem);
  }
}
</style>
