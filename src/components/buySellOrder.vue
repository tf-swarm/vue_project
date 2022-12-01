<template>
  <section class="buySellOrder">
    <el-tabs v-model="orderName">
      <el-tab-pane label="限价委托" name="LIMIT">
        <div class="content">
          <el-form
            :model="buyForm"
            :rules="rules"
            ref="buyForm"
            label-width="auto"
            class="demo-buyForm"
          >
            <el-form-item>
              <div>
                可用：-- {{ assetSymbol[1] }} ≈
                <span style="color:#01C57B"
                  >{{ fundAccount.USDT_Available_BUY || 0 }}
                  <i class="fa fa-usd"></i>
                </span>
              </div>
            </el-form-item>
            <el-form-item prop="accountName">
              <el-autocomplete
                class="inline-input"
                v-model="buyForm.accountName"
                :fetch-suggestions="querySearch"
                placeholder="请输入账号ID"
                @select="handleSelect"
                clearable
                style="width:100%"
              >
                <i class="el-icon-edit el-input__icon" slot="suffix"></i>
                <template slot-scope="{ item }">
                  <span style="float: left;" class="name">{{
                    item.value
                  }}</span>
                  <span style="float: right;" class="addr">{{
                    item.label
                  }}</span>
                </template>
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  @click="showSelect('BUY')"
                />
              </el-autocomplete>
            </el-form-item>
            <el-form-item
              prop="symbol"
              :rules="[{ required: true, message: ' ', trigger: 'blur' }]"
            >
              <el-input
                placeholder="请输入币对"
                v-model="symbol"
                clearable
                disabled
              />
            </el-form-item>
            <el-form-item
              prop="price"
              :rules="[{ required: true, message: ' ', trigger: 'blur' }]"
            >
              <el-input
                type="text"
                v-model="buyForm.price"
                placeholder="买入价"
                clearable
                class="buyGreen"
                v-positive="'float'"
                suffix-icon="el-icon-edit"
              >
                <template slot="append"
                  >{{ (buyForm.price * rate).toFixed(2) }} &yen;</template
                >
              </el-input>
            </el-form-item>
            <el-form-item
              prop="volume"
              :rules="[{ required: true, message: ' ', trigger: 'blur' }]"
            >
              <el-input
                type="text"
                v-model="buyForm.volume"
                placeholder="最小量"
                clearable
                class="buyGreen"
                v-positive="'float'"
                suffix-icon="el-icon-edit"
              />
            </el-form-item>
            <el-form-item>
              <div class="trading">
                <span
                  >预交易额：{{
                    (buyForm.price * buyForm.volume).toFixed(pricePrecision)
                  }}
                </span>
                <span> {{ assetSymbol[1] }} </span>
              </div>
              <el-button
                type="primary"
                style="width: 100%;text-align-last: center;background:#01C57B;"
                @click="buyCreate"
                :loading="buyLoading"
                >买入
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="content" style="margin-top: 30px">
          <el-form
            :model="sellForm"
            label-width="auto"
            :rules="rules"
            ref="sellForm"
          >
            <el-form-item>
              <div>
                可用：-- {{ assetSymbol[0] }} ≈
                <span style="color:#e85b5b">{{
                  fundAccount.CAME_Available_SELL || 0
                }}</span>
              </div>
            </el-form-item>
            <el-form-item prop="accountName">
              <el-autocomplete
                class="inline-input"
                v-model="sellForm.accountName"
                :fetch-suggestions="querySearch"
                placeholder="请输入账号ID"
                @select="handleSelect"
                clearable
                style="width:100%"
              >
                <i class="el-icon-edit el-input__icon" slot="suffix"></i>
                <template slot-scope="{ item }">
                  <span style="float: left;" class="name">{{
                    item.value
                  }}</span>
                  <span style="float: right;" class="addr">{{
                    item.label
                  }}</span>
                </template>
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  @click="showSelect('SELL')"
                />
              </el-autocomplete>
            </el-form-item>
            <el-form-item
              prop="symbol"
              :rules="[{ required: true, message: ' ', trigger: 'blur' }]"
            >
              <el-input placeholder="请输入币对" v-model="symbol" disabled />
            </el-form-item>
            <el-form-item
              prop="price"
              :rules="[{ required: true, message: ' ', trigger: 'blur' }]"
            >
              <el-input
                type="text"
                v-model="sellForm.price"
                placeholder="卖入价"
                clearable
                class="sellRed"
                v-positive="'float'"
                suffix-icon="el-icon-edit"
              >
                <template slot="append"
                  >{{ (sellForm.price * rate).toFixed(2) }} &yen;
                </template>
              </el-input>
            </el-form-item>
            <el-form-item
              prop="volume"
              :rules="[{ required: true, message: ' ', trigger: 'blur' }]"
            >
              <el-input
                type="text"
                v-model="sellForm.volume"
                placeholder="最小量"
                clearable
                class="sellRed"
                v-positive="'float'"
                suffix-icon="el-icon-edit"
              />
            </el-form-item>
            <el-form-item>
              <div class="trading">
                <span
                  >预交易额：{{
                    (sellForm.price * sellForm.volume).toFixed(pricePrecision)
                  }}
                </span>
                <span> {{ assetSymbol[1] }}</span>
              </div>
              <el-button
                type="primary"
                style="width: 100%;text-align-last: center;background:#e85b5b;"
                @click="sellCreate"
                :loading="sellLoading"
                >卖出
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <!-- <el-tab-pane label="市价委托" name="MARKET">
      </el-tab-pane> -->
    </el-tabs>

    <!-- 账号ID搜索 -->
    <el-dialog
      title="选择账户"
      :visible.sync="dialog.visible"
      width="80%"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="dialog.filters" :rules="rules">
          <el-form-item>
            <el-select
              v-model="dialog.filters.member_id"
              clearable
              placeholder="账号ID"
              style="width:100%;"
              @visible-change="memberId('member_id')"
            >
              <el-option
                v-for="(item, i) in options"
                :key="i"
                :value="item.value"
              >
                <span style="float: left">{{ item.value }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{
                  item.label
                }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select
              v-model="dialog.filters.category"
              clearable
              placeholder="账户分类"
              @visible-change="memberId('category')"
            >
              <el-option :label="'全部'" :value="null"> </el-option>
              <el-option
                v-for="(item, i) in classifyList"
                :key="i"
                :label="item[1]"
                :value="item[0]"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="getAccountRows"
              :loading="dialog.loading"
              icon="el-icon-search"
              >查询
            </el-button>
            <el-button type="primary" icon="el-icon-download" @click="outExcel"
              >导出</el-button
            >
          </el-form-item>
        </el-form>
      </el-col>
      <el-table
        :data="dialog.rows"
        highlight-current-row
        v-loading="dialog.loading"
        stripe="stripe"
        ref="accountTable"
        @selection-change="handleSelectionChange"
        @row-dblclick="dblclick"
        show-overflow-tooltip="true"
        max-height="580"
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column
          v-for="item in dialog.assetsList"
          :prop="item.key"
          :label="item.title"
          :key="item.key"
          :min-width="item.min"
          header-align="center"
          align="center"
          :show-overflow-tooltip="true"
        />
      </el-table>
      <div slot="footer" class="dialog-footer block" align="right">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="dialog.page"
          :page-size="dialog.size"
          layout="prev, pager, next, jumper"
          :total="dialog.total"
          :hide-on-single-page="true"
        >
        </el-pagination>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import { handleExport, assetDynamicTitle } from '@/utils/index'
const rules = {}
let data = () => {
  return {
    rules: rules,
    // 下单
    orderName: 'LIMIT',
    pricePrecision: 0,
    volumePrecision: 0,
    active_id: null,
    symbol: null,
    exchange: null,
    minVolume: null,
    buyLoading: false,
    sellLoading: false,
    options: [],
    buyForm: {
	  exchange: '',
	  symbol: '',
      side: 'BUY',
      type: 'LIMIT',
      accountId: '',
      accountName: '',
      price: '',
      volume: ''
    },
    sellForm: {
	  exchange: '',
	  symbol: '',
      side: 'SELL',
      type: 'LIMIT',
      accountId: '',
      accountName: '',
      price: '',
      volume: ''
    },
    fundAccount: {
      USDT_Available_BUY: '',
      CAME_Available_SELL: ''
    },
    // 账号详情
    classifyList: [], // 账号分类
    assetSymbol: [],
    dialog: {
      visible: false,
      rows: [],
      total: 0,
      page: 1,
      size: 20,
      order: 'DESC',
      sort: 'createDate', // CREATED_DATE
      loading: false,
      filters: {},
      assetsList: []
    }
  }
}

let buyCreate = function() {
  // 买入
  this.buyLoading = true
  if (this.minVolume > this.buyForm.volume) {
    this.$message({
      type: 'error',
      message: '最低买入数量：' + this.minVolume
    })
    this.buyLoading = false
    return
  }
  create(this.buyForm, this)
}

let sellCreate = function() {
  // 卖出
  this.sellLoading = true
  if (this.minVolume > this.sellForm.volume) {
    this.$message({
      type: 'error',
      message: '最低卖出数量：' + this.minVolume
    })
    this.sellLoading = false
    return
  }
  create(this.sellForm, this)
}

let create = function(param, _this) {
  // 买入卖出
  if (param.side == 'BUY') {
    _this.buyLoading = true
  } else {
    _this.sellLoading = true
  }

  if (!param.price || !param.volume) {
    _this.buyLoading = false
    _this.sellLoading = false
    _this.$message({
      type: 'success',
      message: '价格和数量不能为空!'
    })
    return
  }
  _this.updateAccount()
  _this
    .$post('/order/create', param)
    .then(res => {
      if (param.side == 'BUY') {
        _this.buyLoading = false
      } else {
        _this.sellLoading = false
      }
      if (res.status != 0) {
        _this.$message({
          showClose: true,
          message: res.error,
          type: 'error'
        })
        return
      }
      _this.memberId(param.side)
      _this.$message({
        type: 'success',
        message: '委托成功!'
      })
      _this.formVisible = false
    })
    .catch(e => (_this.buyLoading = false))
}

let memberId = function(p) {
  // 获取账号ID
  let data = this.$store.state.memberId
  // console.log("获取账号ID", data)
  if (this.symbol) {
    this.assetSymbol = this.symbol.split(
      this.symbol.charAt(this.symbol.search(/[/_-]/))
    )
  }
  switch (p) {
    case 'BUY':
      data.some(item => {
        if (
          this.buyForm.accountId == item.id &&
          item.balance[this.assetSymbol[1]]
        ) {
          this.fundAccount.USDT_Available_BUY = parseFloat(
            item.balance[this.assetSymbol[1]].available
          )
          return true
        }
      })
      break
    case 'SELL':
      data.some(item => {
        if (
          this.sellForm.accountId == item.id &&
          item.balance[this.assetSymbol[0]]
        ) {
          this.fundAccount.CAME_Available_SELL = parseFloat(
            item.balance[this.assetSymbol[0]].available
          )
          return true
        }
      })
      break
  }
  this.$nextTick(() => {
    this.options = data.map(item => {
      return { value: item.id, label: item.account_name}
    })
    this.classifyList = this.$store.state.accountClassify
  })
}

let showSelect = function(p) {
  // ID搜索
  console.log('进入:' + p)
  this.updateAccount()
  this.dialog.visible = true
  this.selectionId = p
  // 动态获取标题
  this.dialog.assetsList = assetDynamicTitle(
    this.$store.state.symbol,
    this.$store.state.keys,
    true
  )
  this.dialog.rows = this.$store.state.memberId // 获取数据
}

let getAccountRows = function() {
  // ID查找刷新
  // this.dialog.rows = []
  let param = {
    page: this.dialog.page,
    size: this.dialog.size,
    sort: this.dialog.sort,
    order: this.dialog.order,
    query: this.dialog.filters
  }
  // this.$store.dispatch('getAccount', param)
  this.dialog.rows = this.$store.state.accountData
  this.dialog.loading = true
  this.$post('/account/paging', param)
    .then(res => {
      this.$store.getters.getCategoryList(res.data)
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        this.dialog.total = res.data.length
        this.dialog.rows = res.data
        this.dialog.loading = false
        return false
      }
      // 获取id数据
      console.log(res.data)
      this.dialog.rows = res.data
      this.dialog.loading = false
      this.$message.success('查询成功')
    })
    .catch(() => (this.dialog.loading = false))
}

let getSummaries = function(param) {
  // 合计
  const { columns, data } = param
  const sums = []
  if (columns.length == 0) {
    return
  }
  columns.forEach((column, index) => {
    if (index === 1) {
      sums[index] = '合计'
      return
    }
    const values = data.map(item => {
      // property: "balance.WTC.available"
      let type = column.property.split('.') || []
      if (
        type.length == 3 &&item.balance &&Object.keys(item.balance).length > 1
      ) {
        return parseFloat(item[type[0]][type[1]][type[2]])
      }
    })
    if (!values.every(value => isNaN(parseFloat(value)))) {
      sums[index] = values.reduce((prev, curr) => {
        const value = parseFloat(curr)
        if (!isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)
      sums[index] = sums[index].toFixed(4)
    } else {
      sums[index] = null
    }
  })
  return sums
}

let outExcel = function() {
  this.$confirm('此操作将导出excel文件, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      if (this.dialog.rows.length === 0) {
        this.$message('导出数据不能为空')
        return
      }
      handleExport(
        this.dialog.assetsList,
        this.dialog.rows,
        this.$store.state.loginMsg.user_name +'资产表 ' + this.$moment(Date.now()).format('YYYY-MM-DD HH-mm'),
        this.$message,
        true
      )
    })
    .catch(() => {})
}

export default {
  name: 'vueBuySellOrder',
  props: ['buySellPrice', 'buySellvolume', 'rate', 'select_exchange', 'select_symbol'],
  data,
  methods: {
    memberId,
    buyCreate,
    sellCreate,
    create,
    showSelect,
    getAccountRows,
    getSummaries,
    outExcel,
    updateAccount() {
      this.active_id = window.sessionStorage.getItem('activeId')
      this.$store.dispatch('getAccount', {
        role_id: this.active_id,
        page: this.dialog.page,
        size: this.dialog.size,
        sort: this.dialog.sort,
        order: this.dialog.order,
        query: this.dialog.filters
      })
    },
    querySearch(queryString, cb) {
      let memberIds = this.options
      let results = queryString ? memberIds.filter(this.createFilter(queryString)): memberIds
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
    handleSelect(data) {
      this.buyForm.accountId = data.value
      this.buyForm.accountName = data.label
      this.memberId('BUY')
      this.sellForm.accountId = data.value
      this.sellForm.accountName = data.label
      this.memberId('SELL')
    },
    handleSizeChange(val) {
      // 每页的条数
      this.dialog.size = val
      this.getRows()
    },
    handleCurrentChange(val) {
      // 当前页数
      this.dialog.page = val
      this.getRows()
    },
    handleSelectionChange(val) {
      if (val.length > 1) {
        this.$refs.accountTable.clearSelection()
        this.$refs.accountTable.toggleRowSelection(val[val.length - 1])

        this.selection = []
        this.selection.push(val[val.length - 1])
      } else {
        this.selection = val
      }
    },
    dblclick(row, column, event) {
      if (this.selectionId == 'BUY') {
        this.buyForm.accountId = row.id
        this.buyForm.accountName = row.account_name
        this.memberId('BUY')
      }
      if (this.selectionId == 'SELL') {
        this.sellForm.accountId = row.id
        this.sellForm.accountName = row.account_name
        this.memberId('SELL')
      }
      this.dialog.visible = false
    }
  },
  created() {
	  this.symbol = this.$store.state.loginMsg.symbol
	  this.exchange = this.$store.state.loginMsg.exchange
    this.pricePrecision = this.$store.state.loginMsg.price_precision
    this.volumePrecision = this.$store.state.loginMsg.volume_precision
	  this.buyForm.exchange = this.sellForm.exchange = this.$store.state.loginMsg.exchange
	  this.buyForm.symbol = this.sellForm.symbol = this.$store.state.loginMsg.symbol
    this.updateAccount()
  },
  mounted() {
    this.memberId('BUY')
    this.memberId('SELL')
  },
  watch: {
    buySellPrice(val) {
      //buySellPrice即为父组件的值，val参数为值
      this.buyForm.price = this.sellForm.price = parseFloat(val) //将父组件的值赋给子组件的值
    },
    buySellvolume(val) {
      //buySellvolume即为父组件的值，val参数为值
      this.buyForm.volume = this.sellForm.volume = parseFloat(val) //将父组件的值赋给子组件的值
    },
	select_exchange(val){
		this.exchange = val
		this.buyForm.exchange = this.sellForm.exchange = val
	},
	select_symbol(val){
		if (!val){
			return;
		}
		this.symbol = val
		this.assetSymbol = val.split(
		  val.charAt(val.search(/[/_-]/))
		)
		this.buyForm.symbol = this.sellForm.symbol = val
	}
  }
}
</script>

<style lang="less" scoped>
.buySellOrder {
  .content {
    /deep/ .el-form-item {
      margin-bottom: 12px;
    }
    .trading {
      // line-height: 25px;
      color: #aaa;
      font-size: 12px;
    }
  }
  /deep/.sellRed {
    .el-input__inner {
      color: #e85b5b;
    }
  }
  /deep/ .buyGreen {
    .el-input__inner {
      color: #01c57b;
    }
  }
}
</style>
