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
            <el-button type="primary" @click="getRows" :loading="listLoading" icon="el-icon-refresh">刷新</el-button>
            <el-button type="primary" @click="add" icon="el-icon-plus">新增</el-button>
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
          <el-table-column label="操作" fixed="right" width="200" align="center" :show-overflow-tooltip="true">
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
            <el-form-item label="下单账户" prop="member_id" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
              <el-input type="text" v-model="form.member_id" placeholder="" clearable suffix-icon="el-icon-edit" :disabled="viewDisabled" v-positive="'float'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="间隔时间(s)" prop="interval" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
              <el-input type="text" v-model="form.interval" placeholder="" clearable suffix-icon="el-icon-edit" :disabled="viewDisabled" v-positive="'float'" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="买进数量" prop="buy_volume" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
              <el-input type="text" v-model="form.buy_volume" placeholder=" " clearable suffix-icon="el-icon-edit" :disabled="viewDisabled" v-positive="'float'">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卖出数量" prop="sell_volume" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
              <el-input type="text" v-model="form.sell_volume" placeholder="" clearable suffix-icon="el-icon-edit" :disabled="viewDisabled" v-positive="'float'">
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="买出价位" prop="buy_price" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
              <el-input type="text" v-model="form.buy_price" placeholder="" clearable suffix-icon="el-icon-edit" :disabled="viewDisabled" v-positive="'float'" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="卖出价位" prop="sell_price" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
              <el-input type="text" v-model="form.sell_price" placeholder=" " clearable v-positive="'float'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="精度" prop="scale" :rules="[{ required: true, message: ' ', trigger: 'blur' }]">
              <el-input type="text" v-model="form.scale" placeholder="" clearable v-positive="'num'" suffix-icon="el-icon-edit" :disabled="viewDisabled" />
            </el-form-item>
          </el-col>
        </el-row>
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
    rows: [],
    total: 0,
    page: 1,
    size: 20,
    order: 'DESC',
    sort: 'createdDate',
    listLoading: false,
    formLoading: false,
    form: {},
    formVisible: false,
    viewDisabled: false,
    pricePrecision: 0,
    volumePrecision: 0,
    tradeSide: {
      BUY: '买入',
      SELL: '卖出'
    },
    tableList: [
      { label: '创建时间', prop: 'created_date', min: '180' },
      { label: '下单账户', prop: 'member_id', min: '120' },
      { label: '间隔时间', prop: 'interval', min: '120' },
      { label: '买进数量', prop: 'buy_volume', min: '120' },
      { label: '卖进数量', prop: 'sell_volume', min: '120' },
      { label: '买进价位', prop: 'buy_price', min: '120' },
      { label: '卖出价位', prop: 'sell_price', min: '120' },
    ]
  }
}

let getRows = function () {
  // 刷新
  this.listLoading = true
  let param = {
    page: this.page,
    size: this.size,
    sort: this.sort,
    order: this.order,
    query: this.filters
  }

  this.$post('/priceMonitor/findPage', param)
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

let add = function () {
  // 新增
  this.formVisible = true
  this.viewDisabled = false
  this.form = {}
  // 设置精确度
  this.form.scale = Math.pow(0.1, this.pricePrecision).toFixed(
    this.pricePrecision
  )
}

let submit = function () {
  // 保存
  this.$refs.form.validate(valid => {
    if (!valid || this.formLoading) {
      return
    }
    this.formLoading = true
    this.$post('/priceMonitor/save', this.form)
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
      this.$get('/priceMonitor/remove', params)
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
  this.$get('/priceMonitor/start', params)
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
          item.is_enabled = 1
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
  this.$get('/priceMonitor/stop', params)
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
      row.scale = Math.pow(0.1, this.pricePrecision).toFixed(
        this.pricePrecision
      )
      this.form = Object.assign({}, row)
      this.formVisible = true
    },
    formatDate (d) {
      return this.$moment(d).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  created () {
    // 获取登录id
    this.filters.userId = this.$store.state.loginMsg.user_id
    this.pricePrecision = this.$store.state.loginMsg.price_precision
    this.volumePrecision = this.$store.state.loginMsg.volume_precision
  },
  mounted () {
    this.getRows();
  }
}
</script>

<style></style>
