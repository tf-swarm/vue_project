<template>
  <section>
    <el-row>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <el-form-item prop="startDate" v-if="query_data">
            <el-date-picker v-model="filters.startDate" type="date" value-format="yyyy-MM-dd" placeholder="选择开始时间" />
          </el-form-item>
          <el-form-item prop="endDate" v-if="query_data">
            <el-date-picker v-model="filters.endDate" type="date" value-format="yyyy-MM-dd" placeholder="选择结束时间" />
          </el-form-item>
          <el-form-item>
            <el-button v-if="query_data" type="primary" @click="getRows" :loading="listLoading" icon="el-icon-refresh">刷新</el-button>
            <el-button v-if="add_data" type="primary" @click="add" icon="el-icon-plus">新增</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!--列表-->
      <el-col :span="24" class="toolbar">
        <el-table :data="rows" highlight-current-row v-loading="listLoading" stripe="stripe" style="width: 100%;" max-height="600">
          <el-table-column v-for="item in tableList" :key="item.prop" :prop="item.prop" :label="item.label" :min-width="item.min" align="center" show-overflow-tooltip />

          <el-table-column prop="is_enabled" label="状态" min-width="120" show-overflow-tooltip align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.is_enabled ? 'success' : 'info'">{{ scope.row.is_enabled ? '启动' : '停止' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="operate" label="操作" fixed="right" width="200" align="center" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <el-button size="small" v-show="!scope.row.is_enabled" icon="el-icon-edit" type="text" @click="formShow(scope.row)">编辑
              </el-button>
              <el-button size="small" v-show="!scope.row.is_enabled" type="text" icon="el-icon-video-play" @click="startRun(scope.row.id)">
                启动
              </el-button>
              <el-button size="small" v-show="scope.row.is_enabled" type="text" icon="el-icon-video-pause" @click="stopRun(scope.row.id)">
                停止
              </el-button>
              <el-button size="small" v-show="!scope.row.is_enabled" icon="el-icon-delete" type="text" @click="remove(scope.row.id)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <!--工具条-->
      <el-col :span="24" class="toolbar">
        <div class="block" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[20, 30, 50, 100]" :page-size="size" layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </el-col>
    </el-row>
    <!--form-->
    <el-dialog :title="form && form.id ? '编辑' : '新增'" :visible.sync="formVisible" :close-on-click-modal="false">
      <el-form :model="form" label-width="120px" :rules="rules" ref="form" label-position="left">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="策略模式" :rules="[{ required: true, message: '请选择策略', trigger: 'blur' }]" >
              <el-select v-model="form.pattern" style="width: 100%;" placeholder="请选择策略" @change="onstrategy">
              <el-option
                v-for="(item,index) in strategys"
                :key="index"
                :label="item"
                :value="index"
              />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
              <el-form-item label="账户" :rules="[{ required: true, message: '请选择账户', trigger: 'blur' }]">
                <el-select v-model="form.account_name" style="width: 100%;" @change="changeLabel">
                <el-option
                  v-for="item in account_list"
                  :key="item.id"
                  :label="item.Name"
                  :value="item.id"
                />
                </el-select>
              </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="币种"
              :rules="[{ required: true, message: '请选择币种', trigger: 'blur' }]"
            >
              <el-select v-model="form.symbol" style="width: 100%;">
              <el-option
                v-for="item in symbol_list"
                :key="item.id"
                :label="item.Name"
                :value="item.Name"
              />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item  label="买入铺单数量" prop="buy_start" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
              <el-input v-model="form.buy_start" style="width: 110px;"></el-input>
              <span>--</span>
              <el-input v-model="form.buy_end" style="width: 110px;"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item  label="卖出铺单数量" prop="sell_start" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
              <el-input v-model="form.sell_start" style="width: 110px;"></el-input>
              <span>--</span>
              <el-input v-model="form.sell_end" style="width: 110px;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
		
		<el-row :gutter="20">
		  <el-col :span="12">
		    <el-form-item label="买单深度(%)" prop="buy_depth" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
		      <el-input type="text" v-model="form.buy_depth" placeholder="" clearable suffix-icon="el-icon-edit" :disabled="viewDisabled" v-positive="'float'" />
		    </el-form-item>
		  </el-col>
		
		  <el-col :span="12">
		    <el-form-item label="卖单深度(%)" prop="sell_depth" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
		      <el-input type="text" v-model="form.sell_depth" placeholder=" " clearable v-positive="'float'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
		    </el-form-item>
		  </el-col>
		</el-row>
		
		<el-row :gutter="20">
		  <el-col :span="12">
		    <el-form-item label="Bids价差(%)" prop="bids_spread" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
		      <el-input type="text" v-model="form.bids_spread" placeholder="" clearable suffix-icon="el-icon-edit" :disabled="viewDisabled" v-positive="'float'" />
		    </el-form-item>
		  </el-col>
		
		  <el-col :span="12">
		    <el-form-item label="Asks价差(%)" prop="asks_spread" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
		      <el-input type="text" v-model="form.asks_spread" placeholder=" " clearable v-positive="'float'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
		    </el-form-item>
		  </el-col>
		</el-row>
		
		<el-row :gutter="20">
		  <el-col :span="12">
		    <el-form-item label="铺单基准档位数" prop="order_num" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
		      <el-input type="text" v-model="form.order_num" placeholder="" clearable suffix-icon="el-icon-edit" :disabled="viewDisabled" v-positive="'float'" />
		    </el-form-item>
		  </el-col>
		
		  <el-col :span="12">
		    <el-form-item label="铺单间隔(秒)" prop="delay" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
		      <el-input type="text" v-model="form.delay" placeholder=" " clearable v-positive="'float'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
		    </el-form-item>
		  </el-col>
		</el-row>
		<el-row :gutter="20">
		  <el-col :span="12">
        <el-form-item label="最大间隔(秒)" prop="max_waitTime" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
		      <el-input type="text" v-model="form.max_waitTime" placeholder=" " clearable v-positive="'float'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
		    </el-form-item>
		  </el-col>
		
		  <el-col :span="12">
		    <el-form-item label="最小间隔(秒)" prop="min_waitTime" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
		      <el-input type="text" v-model="form.min_waitTime" placeholder="" clearable suffix-icon="el-icon-edit" :disabled="viewDisabled" v-positive="'float'" />
		    </el-form-item>
		  </el-col>
		</el-row>
		
		<div v-show="fluctuate" style="margin-bottom: 0px;">
			<el-row :gutter="20">
			  <el-col :span="12">
				<el-form-item label="日波动率(%)" prop="day_rate">
				  <el-input type="text" v-model="form.day_rate" placeholder=" " clearable v-positive="'float'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
				</el-form-item>
			  </el-col>
			  
			  <el-col :span="12">
			    <el-form-item label="价格精度" prop="price_precision">
			      <el-input type="text" v-model="form.price_precision" placeholder="" clearable v-positive="'num'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
			    </el-form-item>
			  </el-col>
			</el-row>
			
			<el-row :gutter="20">			  
			  <el-col :span="12">
			    <el-form-item label="数量精度" prop="volume_precision">
			      <el-input type="text" v-model="form.volume_precision" placeholder="" clearable v-positive="'num'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
			    </el-form-item>
			  </el-col>
			</el-row>
		</div>
		
		<div v-show="target" style="margin-bottom: 0px;">
			<el-row :gutter="20">
			  <el-col :span="12">
				<el-form-item label="截止时间" label-width="0px;">
					<el-date-picker
					  v-model="form.end_date"
					  type="datetime"
					  placeholder="选择日期时间" style="margin-left: 52px;">
					</el-date-picker>
				</el-form-item>
			  </el-col>
			  
			  <el-col :span="12">
				<el-form-item label="目标价" prop="target_price">
				  <el-input type="text" v-model="form.target_price" placeholder=" " clearable v-positive="'float'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
				</el-form-item>
			  </el-col>
			</el-row>
			<el-row :gutter="20">
			  <el-col :span="12">
			    <el-form-item label="日波动率(%)" prop="volatility">
			      <el-input type="text" v-model="form.volatility" placeholder=" " clearable v-positive="'float'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
			    </el-form-item>
			  </el-col>
			  
			  <el-col :span="12">
			    <el-form-item label="价格精度" prop="price_precision">
			      <el-input type="text" v-model="form.price_precision" placeholder="" clearable v-positive="'num'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
			    </el-form-item>
			  </el-col>
			</el-row>
			
			<el-row :gutter="20">
			  <el-col :span="12">
			    <el-form-item label="数量精度" prop="volume_precision">
			      <el-input type="text" v-model="form.volume_precision" placeholder="" clearable v-positive="'num'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
			    </el-form-item>
			  </el-col>
			</el-row>
		</div>
		
		<div v-show="with_city" style="margin-bottom: 0px;">
			<el-row :gutter="20">
			  <el-col :span="12">
				<el-form-item label="微成交过滤" prop="order_filter">
				  <el-input type="text" v-model="form.order_filter" placeholder=" " clearable v-positive="'float'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
				</el-form-item>
			  </el-col>
			  
			  <el-col :span="12">
			    <el-form-item label="价格精度" prop="price_precision">
			      <el-input type="text" v-model="form.price_precision" placeholder="" clearable v-positive="'num'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
			    </el-form-item>
			  </el-col>
			</el-row>
			
			<el-row :gutter="20">
			  <el-col :span="12">
			    <el-form-item label="数量精度" prop="volume_precision">
			      <el-input type="text" v-model="form.volume_precision" placeholder="" clearable v-positive="'num'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
			    </el-form-item>
			  </el-col>
			</el-row>
		</div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="formLoading" @click.native="submit">保存</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
const rules = {}

let data = function () {
  return {
    category: 'manu_self_order',
    rules: rules,
    filters: { userId: 1 },
	  account_list: [],
	  symbol_list: [],
	  // 策略类型
	  strategys: ["随机波动", "目标价", "跟市"],
    rows: [],
    query_data: 0,
    add_data: 0,
    operate: 0,
    power_id: 0,
    total: 0,
    page: 1,
    size: 20,
    order: 'DESC',
    sort: 'createdDate',
    listLoading: false,
    formLoading: false,
    form: {account_id: -1},
    formVisible: false,
    viewDisabled: false,
    // 显示和隐藏
    treaty: '随机波动',
    fluctuate: true,
    target: false,
    with_city: false,
    pricePrecision: 0,
    volumePrecision: 0,
    tradeSide: {
      BUY: '买入',
      SELL: '卖出'
    },
    tableList: [
	    { label: '策略ID', prop: 'draping_id', min: '180' },
      { label: '创建时间', prop: 'created_date', min: '180' },
	    { label: '交易所', prop: 'exchange', min: '120' },
	    { label: '币种', prop: 'symbol', min: '120' },
      { label: '下单账户', prop: 'account_name', min: '120' },
    ]
  }
}

let getRows = function () {
  // 刷新
  this.listLoading = true
  let param = {
    power_id: this.power_id,
    page: this.page,
    size: this.size,
    sort: this.sort,
    order: this.order,
    query: this.filters
  }

  this.$post('/orderBook/findPage', param)
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
      this.query_data = res.power.query
      this.add_data = res.power.add
      this.operate = res.power.operate

      this.$message({
        type: 'success',
        message: '加载成功!'
      })
    })
    .catch(() => (this.listLoading = false))
}

let add = function () {
  // 新增
  this.formVisible = true
  this.viewDisabled = false
  this.form = {}
}

let submit = function () {
  // 保存
  this.$refs.form.validate(valid => {
    if (!valid || this.formLoading) {
      return
    }
    this.formLoading = true
    this.$post('/orderBook/save', this.form)
      .then(res => {
        this.formLoading = false
        this.formVisible = false
        if (res.status != 0) {
          this.$message({
            showClose: true,
            message: res.error || res.msg,
            type: 'error'
          })
          return
        }
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
        this.getRows()
      })
      .catch(() => (this.formLoading = false))
  })
}

let remove = function (id) {
  // 删除
  this.$confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      let params = { id }
      this.listLoading = true
      this.$get('/orderBook/remove', params)
        .then(res => {
          this.listLoading = false
          if (res.status != 0) {
            this.$message({
              showClose: true,
              message: res.error || res.msg,
              type: 'error'
            })
            return
          }
          this.rows.some((item, i) => {
            if (item.id == id) {
              this.rows.splice(i, 1)
              return true
            }
          })
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          // this.getRows();
        })
        .catch(() => (this.listLoading = false))
    })
    .catch(() => { })
}

let startRun = function (id) {
  // 开始
  this.listLoading = true
  let params = { id }
  this.$get('/orderBook/start', params)
    .then(res => {
      this.listLoading = false
      if (res.status != 0) {
        this.$message({
          showClose: true,
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
      this.rows.some(item => {
        if (item.id == id) {
		  // console.log(item.id);
		  // console.log(id);
          item.is_enabled = 1
		  console.log(item.is_enabled);
          return true
        }
      })
      this.$message({
        type: 'success',
        message: '启动成功!'
      })
      // this.getRows();
    })
    .catch(() => (this.listLoading = false))
}

let stopRun = function (id) {
  // 停止
  this.listLoading = true
  let params = { id }
  this.$get('/orderBook/stop', params)
    .then(res => {
      this.listLoading = false
      if (res.status != 0) {
        this.$message({
          showClose: true,
          message: res.error,
          type: 'error'
        })
        return
      }
      this.rows.some(item => {
        if (item.id == id) {
          item.is_enabled = 0
          return true
        }
      })
      this.$message({
        type: 'success',
        message: '停止成功!'
      })
      // this.getRows();
    })
    .catch(() => (this.listLoading = false))
}

export default {
  data: data,
  components: {},
  watch: {},
  methods: {
    add,
    submit,
    getRows,
    remove,
    startRun,
    stopRun,
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
    formShow (row) {
      // 编辑
      // 设置精确度
      this.form = Object.assign({}, row)
      this.formVisible = true
    },
    formatDate (d) {
      return this.$moment(d).format('YYYY-MM-DD HH:mm:ss')
    },
	onstrategy(model) {
		console.log(model)
		if(model =='0'){
			this.fluctuate=true
			this.target=false
			this.with_city=false
		}
		if(model =='1'){
			this.fluctuate=false
			this.target=true
			this.with_city=false
		}
		if(model =='2'){
			this.fluctuate=false
			this.target=false
			this.with_city=true
		}
	},
	changeLabel(val){
		for(var i=0; i< this.account_list.length; i++){
			if(val == this.account_list[i].id){
				this.symbol_list = this.account_list[i].symbol
				if(this.form.symbol){
					this.form.symbol = null;
				}
				this.form.account_name = this.account_list[i].Name
        this.form.account_id = val
			}
		}
	},
  },
  created () {
    // 获取登录id
    this.filters.userId = this.$store.state.loginMsg.user_id
    this.account_list = this.$store.state.loginMsg.account_list
    this.symbol_list = this.$store.state.loginMsg.symbol_list
    this.pricePrecision = this.$store.state.loginMsg.price_precision
    this.volumePrecision = this.$store.state.loginMsg.volume_precision
  },
  mounted () {
    this.power_id = window.sessionStorage.getItem('activeId')
    this.getRows();
  }
}
</script>

<style></style>
