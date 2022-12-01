<template>
  <section>
    <el-row>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <el-form-item v-if="query_data">
				    <el-input placeholder="请输入内容" v-model="query" class="input-search" clearable @clear="getRows()" style="width: 300px;">
				      <el-button slot="append" icon="el-icon-search" @click="getRows()"></el-button>
				    </el-input>
          </el-form-item>
          <el-form-item v-if="add_data">
            <el-button type="primary" @click="show_add" >添加用户</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <!--列表-->
      <el-col :span="24" class="toolbar">
        <!-- 用户列表区域 -->
		<el-table :data="rows" border highlight-current-row v-loading="listLoading" stripe="stripe" style="width: 100%;" max-height="600">
		    <el-table-column type="index"></el-table-column>
        <el-table-column v-for="item in tableList" :key="item.prop" :prop="item.prop" :label="item.label" :min-width="item.min" align="center" show-overflow-tooltip />
          <el-table-column label="状态" align="center" width="120"> 
          <template slot-scope="scope">
            <el-switch v-model="scope.row.state" @change="stateChanged(scope.row)" >
            </el-switch>
          </template>
        </el-table-column>
          <el-table-column v-if="operate" label="操作" width="400px" align="center">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="show_edit(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserId(scope.row.id)">删除</el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)">分配角色</el-button>
            </el-tooltip>
            <!-- 分配账户按钮 -->
            <el-tooltip class="item" effect="dark" content="分配账户" placement="top">
                <el-button type="success" icon="el-icon-setting" size="mini" @click="setAccount(scope.row)">分配账户</el-button>
            </el-tooltip>
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
    <!--添加用户对话框-->
	<el-dialog title="添加用户" :visible.sync="addVisible" width="50%" @close="addDialogClosed">
	  <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
	    <el-form-item label="用户名" prop="username">
	      <el-input v-model="addForm.username"></el-input>
	    </el-form-item>
		<el-form-item label="密码" prop="password">
		  <el-input v-model="addForm.password"></el-input>
		</el-form-item>
		<el-form-item label="邮箱" prop="email">
		  <el-input v-model="addForm.email"></el-input>
		</el-form-item>
		<el-form-item label="手机号" prop="mobile">
		  <el-input v-model="addForm.mobile"></el-input>
		</el-form-item>
	  </el-form>
	  <!-- 底部区域 -->
	  <span slot="footer" class="dialog-footer">
	    <el-button @click="addVisible = false">取 消</el-button>
	    <el-button type="primary" @click="addUser">确 定</el-button>
	  </span>
	</el-dialog>
	
	<!-- 修改用户对话框 -->
	<el-dialog title="修改用户" :visible.sync="editVisible" width="50%" @close="editDialogClosed">
	  <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="editFormRules">
	    <el-form-item label="用户名">
	      <el-input v-model="editForm.username" disabled></el-input>
	    </el-form-item>
		<el-form-item label="邮箱" prop="email">
		  <el-input v-model="editForm.email"></el-input>
		</el-form-item>
		<el-form-item label="手机号" prop="mobile">
		  <el-input v-model="editForm.mobile"></el-input>
		</el-form-item>
	  </el-form>
	   <!-- 底部区域 -->
	  <span slot="footer" class="dialog-footer">
	    <el-button @click="editVisible = false">取 消</el-button>
	    <el-button type="primary" @click="editUserInfo">确 定</el-button>
	  </span>
	</el-dialog>
	
	<!-- 分配角色对话框 -->
	<el-dialog title="分配角色" :visible.sync="setRoleVisible" width="50%" @close="setRoleDialogClosed">
	  <div>
		  <p>当前的用户：{{userInfo.username}}</p>
		  <p>当前的角色：{{userInfo.role_name}}</p>
		  <p>分配新角色：<el-select v-model="selectedRoleId" placeholder="请选择">
		      <el-option
		        v-for="item in rolelist"
		        :key="item.id"
		        :label="item.roleName"
		        :value="item.id">
		      </el-option>
		    </el-select>
			</p>
	  </div>
	  <span slot="footer" class="dialog-footer">
	    <el-button @click="setRoleVisible = false">取 消</el-button>
	    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
	  </span>
	</el-dialog>

  <!-- 分配账户对话框 -->
		<el-dialog title="分配账户" :visible.sync="accountVisible" width="50%" @close="setAccountClosed">
			<el-checkbox-group v-model="checkedAccount" @change="handleChange">
				<el-checkbox v-for="item in accountInfo" :label="item.Id" :key="item.Id">{{item.Name}}</el-checkbox>
			</el-checkbox-group>
			<span slot="footer" class="dialog-footer">
				<el-button @click="accountVisible = false">取 消</el-button>
				<el-button type="primary" @click="setAccountId">确 定</el-button>
			</span>
		</el-dialog>

  </section>
</template>

<script>
const rules = {}

let data = function () {
	// 验证邮箱的规则
	    var checkEmail = (rule, value, cb) => {
	      // 验证邮箱的正则表达式
	      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
	      if (regEmail.test(value)) {
	        // 合法的邮箱
	        return cb()
	      }
	      cb(new Error('请输入正确的邮箱'))
	    }
	    // 验证手机号的规则
	    var checkMobile = (rule, value, cb) => {
	      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
	      if (regMobile.test(value)) {
	        cb()
	      } else {
	        cb(new Error('请输入正确的手机号'))
	      }
	    }
  return {
    category: 'manu_self_order',
    rules: rules,
	  filters: { userId: 1 },
    query: "",
	  exchange_list: [],
	  symbol_list: [],
    rows: [],
    query_data: 0,
    add_data: 0,
    operate: 0,
    power_id: 0,
    total: 0,
    page: 1,
    size: 20,
    listLoading: false,
    formLoading: false,
    // 控制分配账户对话框的显示与隐藏
		accountVisible: false,
		// 所有账户数据
		accountInfo: [],
		// 选中账户
		checkedAccount: [],
		// 选中的ID字符串
		checkedStr: "",
    userId: "",
	  // 添加用户的表单数据
      addForm: {
      username: "",
      password: "",
      email: "",
      mobile: ""
    },
    // 查询用户信息对象
    editForm: {},
	  // 添加表单的验证规则
	  addFormRules: {
		  username: [
			{required: true, message: '请输入用户名', trigger: 'blur'},
			{min: 3, max: 10, message: "用户名的长度在3~10个字符之间", trigger: 'blur'}
		],
		password: [
			{required: true, message: '请输入密码', trigger: 'blur'},
			{min: 6, max: 15, message: "密码的长度在6~15个字符之间", trigger: 'blur'}
		],
		email: [
			{required: true, message: '请输入邮箱', trigger: 'blur'},
			{validator: checkEmail, trigger: 'blur'}
		],
		mobile: [
			{required: true, message: '请输入手机号', trigger: 'blur'},
			{validator: checkMobile, trigger: 'blur'}
		]
	},
	// 修改表单的验证规则
	editFormRules: {
		email: [
			{required: true, message: '请输入邮箱', trigger: 'blur'},
			{validator: checkEmail, trigger: 'blur'}
		],
		mobile: [
			{required: true, message: '请输入手机号', trigger: 'blur'},
			{validator: checkMobile, trigger: 'blur'}
		]
	},
	// 控制添加用户对话框的显示与隐藏
    addVisible: false,
	// 控制修改用户对话框的显示与隐藏
	editVisible: false,
	// 控制分配角色对话框的显示与隐藏
	setRoleVisible: false,
	// 需要被分配角色的用户信息
	userInfo: [],
	// 所有角色数据列表
	rolelist: [],
	// 已选中的角色id值
	selectedRoleId: '',
    pricePrecision: 0,
    volumePrecision: 0,
    tradeSide: {
      BUY: '买入',
      SELL: '卖出'
    },
    tableList: [
      { label: '账号', prop: 'username', min: '180' },
	  { label: '手机号', prop: 'mobile', min: '120' },
	  { label: '邮箱', prop: 'email', min: '120' },
      { label: '角色', prop: 'role_name', min: '120' },
    ],
  }
}

let getRows = function () {
  // 刷新
  this.listLoading = true
  let param = {
    power_id: this.power_id,
    page: this.page,
    size: this.size,
    query: this.query
  }

  this.$post('/user', param)
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

let show_add = function () {
  // 显示添加对话框
  this.addVisible = true
  this.addForm = {}
}

let show_edit = function (id) {
  // 显示编辑对话框
  this.editVisible = true
  console.log(id)
  let param = {
    id: id,
    state: 1,
  }
  this.$get('/users_Id', param)
    .then(res => {
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
	  this.editForm = res.data
    })
  	.catch(() => (this.listLoading = false))

}

let create_user = function () {
  // 添加用户
  this.$refs.addFormRef.validate(valid => {
    if (!valid) {
      return
    }
    this.$post('/adduser', this.addForm)
      .then(res => {
		  // 隐藏添加用户的对话框
        this.addVisible = false
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
          message: '添加用户成功!'
        })
        this.getRows()
      })
      .catch(() => (this.addVisible = false))
  })
}

let editUserInfo = function (id) {
  // 修改用户信息并提交
  this.$refs.editFormRef.validate(valid => {
    if (!valid) {
      return
    }
	let param = {
	  id: this.editForm.id,
	  state: 2,
	  "email": this.editForm.email,
	  "mobile": this.editForm.mobile
	}
    this.$get('/users_Id', param)
      .then(res => {
  		  // 隐藏添加用户的对话框
        this.editVisible = false
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
          message: '修改用户成功!'
        })
        this.getRows()
      })
      .catch(() => (this.editVisible = false))
  })
}

let removeUserId = function (user_id) {
	  // 根据ID删除用户信息
	  this.$confirm('此操作将删除该信息, 是否继续?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	  })
    .then(() => {
      let params = {"id": user_id, state: 3}
      this.$get('/users_Id', params)
        .then(res => {
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
            message: '删除成功!'
          })
          this.getRows();
        })
    }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
	});
}

let alterState = function (userinfo) {
  let param = {
    id: userinfo.id,
    state: userinfo.state,
  }
  this.$get('/state', param)
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
        message: '用户状态更新成功!'
      })
    })
	.catch(() => (this.listLoading = false))
}

let setRole = function(user_info){
	this.userInfo = user_info
	this.getRoleInfo()
	this.setRoleVisible = true
}

let getRoleInfo = function () {
  let param = {}
  this.$get('/rights/roles', param)
    .then(res => {
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
	  this.rolelist = res.data	  
    })
	.catch(() => (this.setRoleVisible = false))
}

let saveRoleInfo = function () {
	if (!this.selectedRoleId){
		return this.$message({
          message: "请选择要分配的角色",
          type: 'error'
        })
   }
  let param = {
	  "user_id": this.userInfo.id,
	  "role_id": this.selectedRoleId,
  }
  this.$get('/set_role', param)
    .then(res => {
	  this.setRoleVisible = false
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
	  this.$message({
	    type: 'success',
	    message: '更新角色成功!'
	  })
	  this.getRows()
    })
	.catch(() => (this.setRoleVisible = false))
}

let setAccount = function (res) {
	  	// 显示分配账户对话框
    console.log(res)
		this.userId = res.id
		this.getAcountlist()
		this.checkedAccount = res.children
    this.checkedStr = this.checkedAccount.join(',')
	  this.accountVisible = true
	}

let getAcountlist = function(){
		let param = {}
		this.$get('/deal_account', param)
		  .then(res => {
		    if (res.status != 0) {
		      this.$message({
		        message: res.error || res.msg,
		        type: 'error'
		      })
		      return
		    }
			this.accountInfo = res.data
		  })
		  .catch(() => (this.accountVisible = false))
	}

let setAccountId = function(){
		let param = {
			'aids': this.checkedStr,
			'userId': this.userId,
		}
		this.$post('/deal_account', param)
		  .then(res => {
		    if (res.status != 0) {
		      this.$message({
		        message: res.error || res.msg,
		        type: 'error'
		      })
		      return
		    }
		  })
		.catch(() => (this.accountVisible = false))
		this.getRows()
		this.accountVisible = false
	}

export default {
  data: data,
  components: {},
  watch: {},
  methods: {
    getRows,
    show_add,
    show_edit,
    create_user,
    editUserInfo,
    removeUserId,
    alterState,
    setRole,
    getRoleInfo,
    saveRoleInfo,
    setAccount,
    getAcountlist,
    setAccountId,
	
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
    // 监听switch开关状态的改变
    stateChanged(userinfo){
      console.log(userinfo);
      this.alterState(userinfo)
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加用户
    addUser(){
      this.create_user()
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    setRoleDialogClosed(){
      this.selectedRoleId = ""
      this.userInfo = {}
    },
    handleChange(value) {
      this.checkedStr = value.join(',')
      // console.log(this.checkedStr)
    },
    // 监听分配账户对话框的关闭事件
    setAccountClosed() {
      this.checkedAccount = []
    },
  },
  created () {
    // 获取登录id
    this.filters.userId = this.$store.state.loginMsg.user_id
    this.pricePrecision = this.$store.state.loginMsg.price_precision
    this.volumePrecision = this.$store.state.loginMsg.volume_precision
  },
  mounted () {
    this.power_id = window.sessionStorage.getItem('activeId')
    this.getRows();
  }
}
</script>

<style>
	
</style>
