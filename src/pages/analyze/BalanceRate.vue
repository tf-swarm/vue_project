<template>
  <section>
    <el-row>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <el-form-item prop="date_time">
            <el-date-picker v-model="filters.date_time" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择时间" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-refresh" @click="deal_rate">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="24" class="toolbar">
        <template>
          <el-checkbox-group v-model="checkList" style="padding-bottom: 30px;" @change="handleChange">
            <el-checkbox v-for="item in accountList" :label="item.Id" :key="item.Id">{{item.account}}</el-checkbox>
          </el-checkbox-group>
        </template>

        <template>
          <div class="test">
            <div id="myChart" :style="{width: '50%', height: '450px',float:'left'}">
              <div class="grid-content bg-purple">
                <template>
                  <el-table :data="rows" height="450px" style="width: 100%">
                    <el-table-column prop="symbol" label="symbols" width="120"/>
                    <el-table-column v-for="item in accountInfo" :key="item.field" :prop="item.field" :label="item.name" width="120" align="center" show-overflow-tooltip />
                    <el-table-column prop="sumNumber" label="合计数量" width="120"/>
                    <el-table-column prop="sumCount" label="合计市值(USDT)" width="180"/>
                  </el-table>
                </template>
              </div>
            </div>
            <div id="main" :style="{width: '50%', height: '450px',float:'left'}"></div>
          </div>
        </template>

      </el-col>
    </el-row>
    
  </section>
</template>

<script>

let data = function () {
  return {
    filters: {date_time: ''},
    app: {},
    account_list: [],
    symbol_list: [],
    legend: [],
    series: [],
    xAxis: [],
    checkList: [],
    // 选中的ID字符串
		checkedStr: "",
    // 所有账户数据
    accountList: [],
		accountInfo: [],
    symbolList: [],
    series: [],
    rule: {
      dateTime: [{ required: true, message: '选择时间', trigger: 'blur' }],
    },
    rows: [],
  }
}

let deal_balance = function () {
  let param = {
    query: this.filters,
  }
  this.$get('/analyze/balance_rate', param)
    .then(res => {
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
      this.accountList = res.data.user
      this.checkList = res.data.check_user
      this.filters.date_time = res.data.ts
      this.accountInfo = res.data.accounts
      this.rows = res.data.rate
      this.symbolList = res.data.symbol
      this.series = res.data.series
      this.checkedStr = this.checkList.join(',')
      this.setChart();
      this.$message({
        type: 'success',
        message: '加载成功!'
      })
    })
}

let deal_rate = function () {
  let param = {
    query: this.filters,
    check_list: this.checkedStr,
  }
  this.$post('/analyze/balance_rate', param)
    .then(res => {
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
      this.accountList = res.data.user
      this.checkList = res.data.check_user
      this.filters.date_time = res.data.ts
      this.accountInfo = res.data.accounts
      this.rows = res.data.rate
      this.symbolList = res.data.symbol
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
        title : {
            text: '账户余额占比',
            x: 'center'
        },
        
        legend: {
            orient: 'vertical',
            left: 'left',
            data: this.symbolList,
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        series : [
            {
                name: '账户余额',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data: this.series,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    normal:{ 
                        label:{ 
                            show: true, 
                            formatter: '{b} : {c} ({d}%)' 
                        }, 
                        labelLine :{show:true} 
                    } 
                }
            }
        ],
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
    }
    myChart.setOption(option, true);
}

export default {
  data: data,
  methods: {
    deal_balance,
    deal_rate,
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
      this.deal_rate()
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
