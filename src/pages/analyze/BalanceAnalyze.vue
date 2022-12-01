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
            <el-button type="primary" @click="reports" icon="el-icon-refresh">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <!-- 卡片视图区域 -->
        <el-card>
        <div id="main" style="height:400px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
  </section>
</template>

<script>

let data = function () {
  return {
    filters: {},
    account_list: [],
    symbol_list: [],
    legend: [],
    series: [],
    xAxis: [],
    rule: {
      startDate: [{ required: true, message: '选择开始时间', trigger: 'blur' }],
      endDate: [{ required: true, message: '选择结束时间', trigger: 'blur' }],
    }
  }
}

let reports = function () {
  let param = {
    query: this.filters
  }
  this.$post('/analyze/balance_reports', param)
    .then(res => {
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
      this.legend = res.data.legend
      this.series = res.data.series
      this.xAxis = res.data.xAxis
      this.setChart();
      this.$message({
        type: 'success',
        message: '加载成功!'
      })
    })
}

let setChart = function () {
    // 基于准备好的dom，初始化echarts实例
    this.chart = this.$echarts.init(document.getElementById('main'))
    // console.log(this.chart)
    // 指定图表的配置项和数据
    var option = {
        title: {
            text: "账户(USDT)"
        },
        legend: {
            data: this.legend
        },
        series: this.series,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
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
            data: this.xAxis,
            axisLabel: {  
                interval:0,  
                rotate:60  
            }
        },
        yAxis: [
          {type: 'value'}
        ],
    }
    this.chart.setOption(option);
}

export default {
  data: data,
  methods: {
    reports,
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
  },
  created () {
    // 获取登录id
    this.filters.userId = this.$store.state.loginMsg.user_id
    this.account_list = this.$store.state.loginMsg.account_list
    this.symbol_list = this.$store.state.loginMsg.symbol_list
  },
  mounted () {
    this.reports();
  }
}
</script>

<style>
</style>
