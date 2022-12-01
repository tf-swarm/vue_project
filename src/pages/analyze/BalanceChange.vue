<template>
  <section>
    <el-row>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <el-form-item prop="startDate">
            <el-date-picker v-model="filters.start" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"  placeholder="选择开始时间" />
          </el-form-item>
          <el-form-item prop="endDate">
            <el-date-picker v-model="filters.end" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"  placeholder="选择结束时间" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-refresh">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <template>
          <el-checkbox-group v-model="checkList" style="padding-bottom: 30px;" @change="handleChange">
            <el-checkbox v-for="item in accountList" :label="item.Id" :key="item.Id">{{item.account}}</el-checkbox>
          </el-checkbox-group>
        </template>

        <template>
          <div class="test">
            <div id="myChart" :style="{width: '100%', height: '500px',float:'top'}">
              <div class="grid-content bg-purple">
                <template>
                  <el-table :data="rows" height="450px" style="width: 100%">
                    <el-table-column prop="date" label="日期" width="180"/>
                    <el-table-column prop="symbol" label="symbols" width="120"/>
                    <el-table-column v-for="item in accountInfo" :key="item.field" :prop="item.field" :label="item.name" width="120" align="center" show-overflow-tooltip />
                    <el-table-column prop="sumNumber" label="合计数量" width="120"/>
                    <el-table-column prop="sumCount" label="合计市值(USDT)" width="180"/>
                  </el-table>
                </template>
              </div>
            </div>
            <div id="main" :style="{width: '100%', height: '360px',float:'bottom'}"></div>
          </div>
        </template>
      </el-col>
    </el-row>
    
  </section>
</template>

<script>

let data = function () {
  return {
    filters: {start: '', end: ''},
    app: {},
    account_list: [],
    symbol_list: [],
    checkList: [],
    // 选中的ID字符串
		checkedStr: "",
    // 所有账户数据
    accountList: [],
		accountInfo: [],
    symbolList: [],
    axisData: [],
    series: [],
    rows: [],
    rule: {
      startDate: [{ required: true, message: '选择开始时间', trigger: 'blur' }],
      endDate: [{ required: true, message: '选择结束时间', trigger: 'blur' }],
    },
  }
}

let deal_balance = function () {
  let param = {
    query: this.filters
  }
  this.$get('/analyze/balance_change', param)
    .then(res => {
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
      this.filters.start = res.data.start
      this.filters.end = res.data.end
      this.accountList = res.data.user
      this.checkList = res.data.check_user
      this.accountInfo = res.data.accounts
      this.symbolList = res.data.symbol
      this.axisData = res.data.axis
      this.rows = res.data.rows
      this.series = res.data.series
      this.checkedStr = this.checkList.join(',')
      this.setChart();
      this.$message({
        type: 'success',
        message: '加载成功!'
      })
    })
}

let setChart = function () {
    // 基于准备好的dom，初始化echarts实例
    var myChart = this.$echarts.init(document.getElementById('main'))
    option = null;
    // 指定图表的配置项和数据
    var option = {
        title: {
            text: '账户余额涨幅'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: this.symbolList
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: this.axisData,
            axisLabel: {  
                interval:0,  
                rotate:60  
            }
        },
        yAxis: {
            type: 'value'
        },
        series: this.series
    };
    myChart.setOption(option, true);
}

export default {
  data: data,
  methods: {
    deal_balance,
    setChart,

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
    handleChange(value) {
      this.checkedStr = value.join(',')
      console.log(this.checkedStr)
    },
  },
  created () {
    // 获取登录id
    this.filters.userId = this.$store.state.loginMsg.user_id
    this.account_list = this.$store.state.loginMsg.account_list
    this.symbol_list = this.$store.state.loginMsg.symbol_list
  },
  mounted () {
    this.deal_balance();
  }
}
</script>

<style>
</style>
