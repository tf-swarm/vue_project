<template>
	<section>
		<el-row>
			<!-- 添加角色按钮区域 -->
			<el-col :span="24">
				<el-button v-if="add_data" type="primary" style="margin-left: 10px;" @click="show_add">添加角色</el-button>
			</el-col>
			<!--角色列表区域-->
			<el-col :span="24" class="toolbar">
				<el-table :data="rolelist" border stripe>
					<el-table-column type="expand">
						<template slot-scope="scope">
							<el-row  :class="['bdbottom', one === 0 ? 'bdtop':'', 'vcenter']" v-for="(item_one, one) in scope.row.children" :key="item_one.id" >
								<!-- 渲染一级权限 -->
								<el-col :span="5">
									<el-tag closable @close="removeRightId(scope.row, item_one.id)">{{item_one.authName}}</el-tag>
									<i class="el-icon-caret-right"></i>
								</el-col>
								<!-- 渲染二级和三级权限 -->
								<el-col :span="19">
									<!-- 通过for 循环 嵌套二级权限 -->
									<el-row  :class="[two === 0 ? '': 'bdtop', 'vcenter']" v-for="(item_two, two) in item_one.children" :key="item_two.id">
										<el-col :span="6">
											<el-tag type="success" closable @close="removeRightId(scope.row, item_two.id)">{{item_two.authName}}</el-tag>
											<i class="el-icon-caret-right"></i>
										</el-col>
										<el-col :span="18">
											<el-tag v-for="(item_three, three) in item_two.children" :key="three.id" type="warning" closable @close="removeRightId(scope.row, item_three.id)">{{item_three.authName}}</el-tag>
										</el-col>
									</el-row>
								</el-col>
							</el-row>
						</template>
					</el-table-column>
					<el-table-column type="index"></el-table-column>
					<el-table-column  prop="roleName" label="角色名称"> </el-table-column>
					<el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
					<el-table-column v-if="operate" label="操作" width="300px">
						<template slot-scope="scope">
							<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEdit(scope.row.id)">编辑</el-button>
							<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
							<el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRight(scope.row)">分配权限</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-col>
		</el-row>
		<!-- 添加角色对话框 -->
		<el-dialog title="添加角色" :visible.sync="addRoleVisible" @close="addDialogClosed">
		  <el-form ref="addFormRef" :model="addform" :rules="addFormRules" label-width="80px">
		    <el-form-item label="角色名称" prop="roleName">
		      <el-input v-model="addform.roleName"></el-input>
		    </el-form-item>
			<el-form-item label="角色描述" prop="roleDesc">
			  <el-input v-model="addform.roleDesc"></el-input>
			</el-form-item>
		  </el-form>
		  
		  <!-- 底部区域 -->
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="addRoleVisible = false">取 消</el-button>
		    <el-button type="primary" @click="addRoleInfo">确 定</el-button>
		  </span>
		</el-dialog>
		
		<!-- 分配权限对话框 -->
		<el-dialog title="分配权限" :visible.sync="setRightVisible" width="50%" @close="setRightDialogClosed">
		  <el-tree :data="rightslist" ref="treeRef" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys">
		  </el-tree>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="setRightVisible = false">取 消</el-button>
		    <el-button type="primary" @click="allRights">确 定</el-button>
		  </span>
		</el-dialog>
		
		<!-- 编辑对话框 -->
		<el-dialog
		  title="修改角色" :visible.sync="editRoleVisible" width="50%" @close="editDialogClosed">
		  <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
		    <el-form-item label="角色名称" prop="roleName">
		      <el-input v-model="editForm.roleName"></el-input>
		    </el-form-item>
			<el-form-item label="角色描述" prop="roleDesc">
			  <el-input v-model="editForm.roleDesc"></el-input>
			</el-form-item>
		  </el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="editRoleVisible = false">取 消</el-button>
		    <el-button type="primary" @click="editRoleInfo">确 定</el-button>
		  </span>
		</el-dialog>
		
	</section>
</template>

<script>
	const rules = {}
	let data = function () {
		
		return {
			// 所有角色列表数据
			rolelist: [],
			filters: { userId: 1 },
			power_id: 0,
			add_data: 0,
    		operate: 0,
			pricePrecision: 0,
			volumePrecision: 0,
			// 控制添加角色对话框的显示与隐藏
			addRoleVisible: false,
			// 控制分配权限对话框的显示与隐藏
			setRightVisible: false,
			// 所有权限的数据
			rightslist: [],
			// 当前即将分配权限的角色ID
			roleId: "",
			// 树形控件的属性绑定对象
			treeProps: {
				children: 'children',
				label: 'authName'      
			},
			// 默认选中的节点Id值
			defKeys: [],
			// 查询角色信息对象
			addform: {
				roleName: "",
				roleDesc: "",
			},
			// 添加表单的验证规则
			addFormRules: {
			    roleName: [
			        {required: true, message: '请输入角色名称', trigger: 'blur'}
			    ],
			    roleDesc: {required: true, message: '请输入角色描述', trigger: 'blur'}
			},
			// 控制编辑角色对话框的显示与隐藏
			editRoleVisible: false,
			// 编辑角色信息
			editForm: {},
			// 编辑表单的验证规则
			editFormRules: {
			    roleName: [
			        {required: true, message: '请输入角色名称', trigger: 'blur'}
			    ],
			    roleDesc: {required: true, message: '请输入角色描述', trigger: 'blur'}
			},
		}
	}
	
	let show_add = function () {
	  // 显示添加角色对话框
	  this.addRoleVisible = true
	  this.addform = {}
	}
	
	let getRolesList = function(){
		// 获取所有角色的列表
		let param = {power_id: this.power_id}
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
			this.add_data = res.power.add
      		this.operate = res.power.operate
		    this.$message({
		      type: 'success',
		      message: '加载成功!'
		    })
		  })
		  .catch(() => (this.listLoading = false))
	}
	
	let addRoleInfo = function(){
		// 添加角色信息
		this.addform["power_id"] = this.power_id
		this.$post('/rights/roles', this.addform)
		  .then(res => {
			this.addRoleVisible = false
		    if (res.status != 0) {
		      this.$message({
		        message: res.error || res.msg,
		        type: 'error'
		      })
		      return
		    }
		    this.rolelist = res.data
		    this.$message({
		      type: 'success',
		      message: '添加角色成功!'
		    })
			 this.getRolesList()
		  })
		  .catch(() => (this.addRoleVisible = false))
	}
	
	let removeRightId = function(role, rightId){
		// 根据ID删除对应的权限
		this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
		})
		.then(() => {
		  let params = {"role_id": role.id, right_id: rightId}
		  this.$post('/rights/delete_role', params)
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
		      role.children = res.data
		    })
		}).catch(() => {
		      this.$message({
		        type: 'info',
		        message: '已取消删除'
		      });
		});
	}
	
	let showSetRight = function(role){
		// 展示分配权限的对话框
		this.roleId = role.id
		this.getRigthsList()
		this.getLeafKeys(role, this.defKeys)
		this.setRightVisible = true
	}
	
	let getRigthsList = function () {
		// 获取所有权限数据
	  let param = {
	    status: "tree"
	  }
	  this.$get('/rights/list', param)
	    .then(res => {
	      if (res.status != 0) {
	        this.$message({
	          message: res.error || res.msg,
	          type: 'error'
	        })
	        return
	      }
	      this.rightslist = res.data
	      
	    })
	    .catch(() => (this.setRightVisible = false))
	}
	
	let getLeafKeys = function (node, arr) {
		// 通过递归的形式，获取角色下所有三级权限的ID，并保存到defKeys数组中
		if (!node.children){
			return arr.push(node.id)
		}
		node.children.forEach(item =>
		this.getLeafKeys(item, arr)
		)
	}
	
	let setRigthsInfo = function (id_str) {
		// 设置分配权限
	  let param = {
	    rids: id_str,
		role_id: this.roleId,
	  }
	  this.$post('/rights/update_role', param)
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
		    message: '分配权限成功!'
		  })
	    })
	    .catch(() => (this.setRightVisible = false))
	}
	
	let allRights = function () {
		// 点击为角色分配权限
		const keys = [
			...this.$refs.treeRef.getCheckedKeys(),
			...this.$refs.treeRef.getHalfCheckedKeys(),
		]
		const idStr = keys.join(',')
		this.setRigthsInfo(idStr)
		this.getRolesList()
		this.setRightVisible = false
	}
	
	let showEdit = function(role_id){
		// 显示编辑角色
		let param = {
			status: 1,
			role_id: role_id,
		}
		this.$get('/rights/roles_Id', param)
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
		  .catch(() => (this.editRoleVisible = false))
		this.editRoleVisible = true
	}
	
	let editRoleInfo = function(){
		// 修改角色信息并提交
		let param = {
			status: 2,
			role_id: this.editForm.roleId,
			roleName: this.editForm.roleName,
			roleDesc: this.editForm.roleDesc,
		}
		this.$get('/rights/roles_Id', param)
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
			  message: '更新角色信息成功!'
			})
		  })
		  .catch(() => (this.editRoleVisible = false))
		  this.editRoleVisible = false
		  this.getRolesList()
	}
	
	let removeRoleById = function(role_id){
		// 根据ID删除角色信息
		  this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		  })
		.then(() => {
		  let params = {"role_id": role_id, status: 3}
		  this.$get('/rights/roles_Id', params)
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
		        message: '删除角色成功!'
		      })
		      this.getRolesList();
		    })
		}).catch(() => {
		      this.$message({
		        type: 'info',
		        message: '已取消删除'
		      });
		});
	}

	export default {
		data: data,
		methods: {
			getRolesList,
			addRoleInfo,
			show_add,
			removeRightId,
			showSetRight,
			getRigthsList,
			getLeafKeys,
			setRigthsInfo,
			allRights,
			showEdit,
			editRoleInfo,
			removeRoleById,
			
			// 监听添加角色对话框的关闭事件
			addDialogClosed() {
			  this.$refs.addFormRef.resetFields()
			},
			// 监听分配权限对话框的关闭事件
			setRightDialogClosed() {
			  this.defKeys = []
			},
			// 监听修改角色对话框的关闭事件
			editDialogClosed() {
			  // this.$refs.editFormRef.resetFields()
			},
		},
		created () {
		  // 获取登录id
		  this.filters.userId = this.$store.state.loginMsg.user_id
		  this.pricePrecision = this.$store.state.loginMsg.price_precision
		  this.volumePrecision = this.$store.state.loginMsg.volume_precision
		  this.power_id = window.sessionStorage.getItem('activeId')
		  this.getRolesList()
		},
	}
</script>

<style>
	.el-tag{
		margin: 7px;
	}
	.bdtop{
		border-top: 1px solid #eee;
	}
	.bdbottom{
		border-bottom: 1px solid #eee;
	}
	.vcenter{
		display: flex;
		align-items: center;
	}
</style>
