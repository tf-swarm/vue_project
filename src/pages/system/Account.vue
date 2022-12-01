<template>
  <section class="account">
    <el-row>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <!-- <el-form-item>
            <el-select
              v-model="filters.exchange"
              allow-create
              filterable
              default-first-option
              clearable
              placeholder="交易所"
            >
             <el-option v-for="item in options" :key="item.value" :value="item.label">
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{item.value}}</span>
              </el-option>
            </el-select>
          </el-form-item> -->
		  
          <el-form-item v-if="query_data">
            <el-select v-model="filters.account_name" clearable filterable placeholder="账号名称">
              <el-option
                v-for="item in accountList"
                :key="item[0]"
                :label="item[1]"
                :value="item[0]"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button 
              v-if="query_data"
              type="primary"
              @click="getRows"
              icon="el-icon-refresh"
              :loading="listLoading"
              >刷新</el-button
            >
            <el-button v-if="add_data" type="primary" @click="add" icon="el-icon-plus">新增</el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <!--列表-->
      <el-col :span="24" class="toolbar">
        <el-table
          :data="rows"
          highlight-current-row
          v-loading="listLoading"
          stripe="stripe"
          :default-sort="{ prop: 'sort', order: 'ascending' }"
          style="width: 100%;"
          max-height="600"
        >
          <el-table-column
            v-for="item in headerList"
            :key="item.key"
            :prop="item.key"
            :label="item.title"
            :min-width="item.min"
            align="center"
            :show-overflow-tooltip="true"/>

          <el-table-column prop="secret_key" label="密钥" width="300">
            <template slot-scope="scope">
              <el-tooltip effect="dark" :content="scope.row.secret_key" placement="top">
                <p>****************************************</p>
              </el-tooltip>
            </template>
          </el-table-column>
          
          <el-table-column
            v-if="operate"
            label="操作"
            min-width="250"
            header-align="center"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="small"
                icon="el-icon-edit"
                type="text"
                @click="formShow(scope.row)"
                >编辑
              </el-button>
              <el-button
                size="small"
                icon="el-icon-delete"
                type="text"
                @click="remove(scope.row.id)"
                >删除
              </el-button>
              <el-button
                size="small"
                icon="el-icon-setting"
                type="text"
                @click="symbolShow(scope.row)"
                >分配币对
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <!--工具条-->
      <el-col :span="24" class="toolbar">
        <div class="block" align="right">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          >
          </el-pagination>
        </div>
      </el-col>
    </el-row>

    <!--form-->
    <el-dialog
      :title="form && form.id ? '编辑' : '新增'"
      :visible.sync="formVisible"
      :close-on-click-modal="false"
    >
      <el-form
        :model="form"
        label-width="150px"
        :rules="rules"
        ref="form"
        label-position="left"
      >
		<el-form-item
		  label="交易所"
		  :rules="[{ required: true, message: '请选择交易所', trigger: 'blur' }]"
		>
		  <el-select v-model="form.exchange" style="width: 100%;">
			<el-option
			  v-for="item in exchange_list"
			  :key="item.id"
			  :label="item.Name"
			  :value="item.Name"
			/>
		  </el-select>
		</el-form-item>
				
        <el-form-item
          label="账号名称"
          prop="account_name"
          :rules="[{ required: true, message: '请输入账号名称', trigger: 'blur' }]"
        >
          <el-input
            type="text"
            v-model="form.account_name"
            placeholder="账号名称"
            suffix-icon="el-icon-edit"
          ></el-input>
        </el-form-item>

        <el-form-item
          label="Access Key"
          prop="api_key"
          :rules="[{ required: true, message: '请输入公钥', trigger: 'blur' }]"
        >
          <el-input
            v-model="form.api_key"
            placeholder="公钥"
            type="textarea"
          ></el-input>
        </el-form-item>

        <el-form-item
          label="Secret Key"
          prop="secret_key"
          :rules="[{ required: true, message: '请输入私钥', trigger: 'blur' }]"
        >
          <el-input
            v-model="form.secret_key"
            placeholder="私钥"
            type="textarea"
          ></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer" align="right">
        <el-button type="primary" @click.native="submit" :loading="formLoading">提交</el-button>
      </div>
    </el-dialog>

    <!-- 分配币种-->
    <el-dialog title="分配币种" :visible.sync="symboltVisible" width="50%" @close="symbolDialogClosed">
      <el-tree :data="symbolList" ref="treeRef" :props="symboltProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="symboltVisible = false">取 消</el-button>
        <el-button type="primary" @click="allSymbol">确 定</el-button>
      </span>
    </el-dialog>

  </section>
</template>

<script>
import JSEncrypt from 'jsencrypt'
const rules = {}

let data = () => {
  return {
    filters: { userId: 0 },
    options: [],
    rows: [],
	  exchange_list: [],
    query_data: 0,
    add_data: 0,
    operate: 0,
    power_id: 0,
    total: 0,
    page: 1,
    size: 10,
    order: 'DESC',
    sort: 'createDate',
    listLoading: false,
    formLoading: false,
    publicKey: null,
    form: {},
    formVisible: false,
    rules: rules,
    // 账号分类
    accountList: [],
    // 新增分类
    // categories: [],
    // disabled: false,
    rowObj: {},
    // 控制分配币种对话框的显示与隐藏
    symboltVisible: false,
    // 当前即将分配币种的账号ID
		accountId: "",
    // 所有币种的数据
    symbolList: [],
    // 树形控件的属性绑定对象
    symboltProps: {
      children: 'children',
      label: 'name'      
    },
    // 默认选中的节点Id值
		defKeys: [],
    headerList: [
      { title: '创建时间', key: 'create_date', min: 300 },
      { title: '账号名称', key: 'account_name', min: 120 },
      { title: '交易所', key: 'exchange', min: 120 },
      { title: '令牌', key: 'api_key', min: 300 },
      // { title: '密钥', key: 'secret_key', min: 300 },
    ]
  }
}

let getRows = function() {
  // 刷新
  this.listLoading = true
  this.filters.userId = this.filters.userId
  let param = {
    power_id: this.power_id,
    page: this.page,
    size: this.size,
    sort: this.sort,
    order: this.order,
    query: this.filters
  }
  this.$post('/account/paging', param)
    .then(res => {
      this.listLoading = false
      if (res.status != 0) {
        this.$message({
          type: 'error',
          message: res.error || res.msg
        })
        return
      }
	  this.exchange_list = res.exchange
      // 获取账号信息
      this.rows = res.data.sort((a, b) => a.member_id - b.member_id)
      this.total = res.data.length
      this.query_data = res.power.query
      this.add_data = res.power.add
      this.operate = res.power.operate
      // 获取分类
      this.$store.getters.getCategoryList(this.rows)
      // 获取账号id
      // this.options = res.exchange.map(item => {
      //   return { value: item.id, label: item.Name }
      // })
      // 获取账号分类
      this.accountList = [
        ...new Map(this.rows.map(item => [item.id, item.account_name]))
      ]
      this.$message({
        message: '数据加载成功',
        type: 'success'
      })
    })
    .catch(() => (this.listLoading = false))
}

/** 
 let tokenChange = function () {
   if (this.base64(this.form.token)) {
     this.form.date = this.base64(this.form.token);
   } else {
     this.$message.success("请输入有效的令牌");
   }
 };
*/

let add = function() {
  // 新增
  this.formVisible = true
  // this.disabled = false
  this.form = {}
}

let submit = function() {
  // 保存
  // 表达验证
  this.$refs.form.validate(valid => {
    if (!valid || this.formLoading) {
      return
    }
    let isBool = Object.values(this.form).some(item => {
          if (!new Set(Object.values(this.rowObj)).has(item)) {
            return true
          }
        })
    
    if (!isBool) {
      this.rowObj = {}
      this.formVisible = false
      this.$message.success("保存成功");
      return
    }
    // 进行修改参数
    this.formLoading = true
    this.form.userId = this.filters.userId
    
    // 获取公共密钥
    let crypt = new JSEncrypt()
    crypt.setPublicKey(this.publicKey)
    // 传入加密的密码
    let secret_key = crypt.encrypt(this.form.secret_key)
    let param = {
      id: this.form.id,
      exchange: this.form.exchange,
      account_name: this.form.account_name,
      api_key: this.form.api_key,
      secret_key: secret_key,
    }
    this.$post('/account/save', param)
      .then(res => {
        this.formLoading = false
        this.formVisible = false
        // console.log(res);
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
        // this.disabled = false
      })
      .catch(() => (this.formLoading = false))
  })
}

let formShow = function(row) {
  // 编辑
  this.formVisible = true
  this.rowObj = row
  // 先显示数据
  this.form = Object.assign({}, row)
}

let remove = function(id) {
  // 移除
  this.$confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      this.listLoading = true
      let params = {'accountId': id }
      this.$get('/account/remove', params)
        .then(res => {
          // console.log(res)
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
            message: '操作成功!'
          })

          this.listLoading = false
          // 重新渲染页面
          this.getRows()
        })
        .catch(() => (this.listLoading = false))
    })
    .catch(() => {})
}

let symbolShow = function(account) {
  // 分配币种
  this.accountId = account.id
  this.getSymbolList(account.exchange)
  this.getSymbolKeys(account, this.defKeys)
  this.symboltVisible = true
}

let getSymbolList = function(exchange){
    // 获取所有币种数据
    let param = {"exchange": exchange}
	  this.$get('/account/symbol', param)
	    .then(res => {
	      if (res.status != 0) {
	        this.$message({
	          message: res.error || res.msg,
	          type: 'error'
	        })
	        return
	      }
        // console.log(res.data)
	      this.symbolList = res.data
	      
	    })
	    .catch(() => (this.symboltVisible = false))
}

let getSymbolKeys = function (node, arr) {
		// 通过递归的形式，获取角色下所有二级权限的ID，并保存到defKeys数组中
		if (!node.children){
			return arr.push(node.id)
		}
		node.children.forEach(item =>
		this.getSymbolKeys(item, arr)
		)
	}

let allSymbol = function (){
    // 修改币种分配权限
    const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
			  ...this.$refs.treeRef.getHalfCheckedKeys(),
    ]
    const idStr = keys.join(',')
    this.setSymbolInfo(idStr)
    this.getRows()
    this.symboltVisible = false
}

let setSymbolInfo = function (str_id) {
    let param = {
      account_id : this.accountId,
      symbol_ids: str_id,
    }

    this.$post('/account/update_symbol', param)
	    .then(res => {
	      if (res.status != 0) {
	        this.$message({
	          message: res.error || res.msg,
	          type: 'error'
	        })
	        return
	      }
		  this.$message({
		    type: 'success',
		    message: '分配币种成功!'
		  })
	    })
	    .catch(() => (this.symboltVisible = false))
}

export default {
  data: data,
  components: {},
  watch: {},
  methods: {
    getRows,
    add,
    // tokenChange,
    submit,
    formShow,
    remove,
    symbolShow,
    getSymbolList,
    getSymbolKeys,
    allSymbol,
    setSymbolInfo,
    // 每页的条数
    handleSizeChange(val) {
      this.size = val
      this.getRows()
    },
    // 当前页数
    handleCurrentChange(val) {
      this.page = val
      this.getRows()
    },
    // 格式化时间
    formatDate(d) {
      return this.$moment(d).format('YYYY-MM-DD')
    },
    base64(key) {
      if (typeof key.split('.')[1] == 'string') {
        try {
          let json = JSON.parse(atob(key.split('.')[1]))
          if (typeof json == 'object' || json instanceof Object) {
            let end = this.formatDate(json.exp * 1000)
            console.log(end)
            this.$forceUpdate()
            return end
          } else {
            return false
          }
        } catch (e) {
          return false
        }
      }
    },
	
  // 监听分配币种对话框的关闭事件
    symbolDialogClosed() {
      this.defKeys = []
    },
    publicPem () {
      this.$get('/key').then(res => {
        this.publicKey = window.atob(res.pem)
      })
    },
  },
  created() {
    // 获取登录id
    this.filters.userId = this.$store.state.loginMsg.user_id
    // 新增分类
    // this.categories = this.$store.getters.getCategoryList(
    //   Object.keys(this.$store.state.classifyList)
    // )
    this.power_id = window.sessionStorage.getItem('activeId')
    this.publicPem()
    this.getRows()
  },
  mounted() {}
}
</script>

<style lang="less" scoped>
.account {
  /deep/.badge {
    .cell {
      overflow: visible;
    }
    .el-badge__content.is-fixed {
      right: 0px;
      top: 1px;
    }
    .el-badge__content {
      background-color: #fff;
      border-radius: 4px;
      color: #f56c6c;
      border: 1px solid #f56c6c;
      height: 16px;
      line-height: 16px;
      padding: 0 3px;
    }
  }
}
</style>
