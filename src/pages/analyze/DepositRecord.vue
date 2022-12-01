<template>
  <section>
    <el-row>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <el-form-item prop="startDate">
            <el-date-picker v-model="filters.startDate" type="date" value-format="yyyy-MM-dd" placeholder="选择开始时间" />
          </el-form-item>
          <el-form-item prop="endDate">
            <el-date-picker v-model="filters.endDate" type="date" value-format="yyyy-MM-dd" placeholder="选择结束时间" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="filters.accountName" clearable placeholder="账户"  @change="changeLabel">
			    <el-option v-for="item in account_list" :key="item.id" :label="item.Name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getRows" :loading="listLoading" icon="el-icon-refresh">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!--列表-->
      <el-col :span="24" class="toolbar">
        <el-table :data="rows" highlight-current-row v-loading="listLoading" stripe="stripe" style="width: 100%;" height="600" >
           <el-table-column v-for="item in headerList" :key="item.prop" :prop="item.prop" :label="item.label" :min-width="item.min" align="center" show-overflow-tooltip />
        </el-table>
      </el-col>
      <!--翻页工具条-->
      <el-col :span="24" class="toolbar">
        <div class="block" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[20, 30, 50, 100]" :page-size="size" layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </el-col>
    </el-row>
    
  </section>
</template>

<script>
const rules = {}

let data = function () {
  return {
    rules: rules,
    filters: {},
    account_list: [],
    symbol_list: [],
    rows: [],
    total: 0,
    page: 1,
    size: 20,
    listLoading: false,
    headerList: [
	      { label: '时间', prop: 'date', min: '180' },
        { label: '账户名称', prop: 'account_name', min: '180' },
        { label: '交易ID', prop: 'tranId', min: '180' },
        { label: '交易对手', prop: 'counterParty', min: '180' },
        { label: '数量', prop: 'qty', min: '180' },
	      { label: '邮件', prop: 'email', min: '180' },
        { label: '方向', prop: 'type', min: '180' },
        { label: '资产类型', prop: 'asset', min: '180' },
    ],
  }
}

let getRows = function () {
  // 刷新
  this.listLoading = true
  let param = {
    page: this.page,
    size: this.size,
    query: this.filters
  }

  this.$post('/analyze/transfer_info', param)
    .then(res => {
      this.listLoading = false
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
      this.rows = res.data.rows
      this.total = res.data.total
      this.$message({
        type: 'success',
        message: '加载成功!'
      })
    })
    .catch(() => (this.listLoading = false))
}

export default {
  data: data,
  components: {},
  watch: {},
  methods: {
    getRows,
    handleSizeChange (val) {
      // 每页的条数
      this.size = val
      this.getRows()
    },
    handleCurrentChange (val) {
      // 当前页数
      this.page = val
      this.getRows()
    },
    formatDate (d) {
      return this.$moment(d).format('YYYY-MM-DD HH:mm:ss')
    },
    changeLabel(val){
      console.log(val)
      for(var i=0; i< this.account_list.length; i++){
        if(val == this.account_list[i].id){
          this.symbol_list = this.account_list[i].symbol
          if(this.filters.symbol){
            this.filters.symbol = null;
          }
          this.filters.accountName = this.account_list[i].Name
          this.filters.accountId = val
        }
      }
    },
  },
  created () {
    // 获取登录id
    this.filters.userId = this.$store.state.loginMsg.user_id
    this.account_list = this.$store.state.loginMsg.account_list
    this.symbol_list = this.$store.state.loginMsg.symbol_list
  },
  mounted () {
    this.getRows();
  }
}
</script>

<style>
</style>
