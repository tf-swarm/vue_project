<template>
  <section>
    <el-container class="container">
		<!-- 侧边栏 -->
      <el-aside class="aside" :width="isCollapse ? '65px' : '151px'">
        <div class="left" :style="isCollapse ? 'line-height:59px' : ''">
          <div class="logo">
            <!-- <el-collapse-transition> -->
            <span v-show="isCollapse">
              <i class="fa fa-bitcoin"></i>
            </span>
            <!-- </el-collapse-transition> -->
            <div v-show="!isCollapse">
              <img src="../assets/logo.png" alt="" />
            </div>
          </div>
        </div>

		<el-menu collapse-transition router unique-opened :default-active="activePath" class="el-menu-vertical-demo" :collapse="isCollapse">
		  <template v-for="item in menuData">
			  <!-- 一级菜单 -->
		    <el-submenu :index="item.id + ''" :key="item.id">
				<!-- 一级菜单的模板区域 -->
		      <template slot="title">
					<!-- 图标 -->
		        <i :class="iconCls[item.id]"></i>
					<!-- 文本 -->
		        <span slot="title">{{ item.authName }}</span>
		      </template>
			  <!-- 二级菜单 -->
		      <template v-for="dren in item.children">
		        <el-menu-item :index="'/'+ dren.path" :key="dren.id" @click="savePath('/'+ dren.path, dren.id)">
					{{ dren.authName }}
				</el-menu-item>
		      </template>
		    </el-submenu>
		  </template>
		</el-menu>
		
      </el-aside>

      <el-container>
		  <!-- 头部区域 -->
        <el-header class="header" :class="isCollapse ? 'collapsed' : ''">
          <div class="userinfo">
            <el-row>
              <el-col :sm="8" :xs="8">
                <div class="nav">
					<!-- 点击折叠 -->
                  <a href="#" @click.prevent="isCollapse = !isCollapse">
                    <i class="fa fa-align-justify"></i>
                  </a>
                  <a href="#" @click.prevent="$router.push('/')">
                    <i class="fa fa-home" style="font-size:22px"></i>
                  </a>
                </div>
              </el-col>

              <el-col :sm="16" :xs="16" class="tools">
                <span style="padding-right:10px;">
                  您好：{{
                    sysUserName
                      ? sysUserName
                      : $route.query.id + '_' + Math.floor(Math.random() * 100)
                  }}
                </span>
                <el-button type="text" @click.native="setVisible = !setVisible" style="color:#000;" v-show="$route.query.id != '游客'">
                  <!-- <i class="fa fa-key"></i> 修改密码 -->
                  <i class="el-icon-setting"></i> 设置
                </el-button>
                <el-button type="text" @click.native="logout" style="color:#000;">
                  <i class="fa fa-sign-out-alt"></i> 退出
                </el-button>
              </el-col>
            </el-row>
          </div>
        </el-header>
			<!-- 右侧内容主体 -->
        <el-main class="main">
          <section class="content-container ">
            <div class="grid-content bg-purple-light">
              <el-col :span="24" class="breadcrumb-container">
                <strong class="title">{{ $route.name }}</strong>
                <el-breadcrumb separator="/" class="breadcrumb-inner">
                  <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">{{ item.name }}</el-breadcrumb-item>
                </el-breadcrumb>
              </el-col>
              <el-col :span="24" class="content-wrapper">
                <transition name="fade" mode="out-in">
                  <router-view></router-view>
                </transition>
              </el-col>
            </div>
          </section>
        </el-main>
      </el-container>
    </el-container>

    <!--form-->
    <el-dialog title="设置" :visible.sync="setVisible" width="300px" top="30vh">
      <div>
        <el-button type="text" @click.native="change" style="color:#000;">
          <el-link type="primary" underline><i class="fa fa-key"></i> 修改密码</el-link>
        </el-button>
        <el-dialog title="修改密码" :visible.sync="formVisible" :close-on-click-modal="false" append-to-body width="500px">
          <el-form :model="form" label-width="120px" :rules="rules" ref="form" label-position="left">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input type="password" v-model="form.oldPassword" auto-complete="off" placeholder="旧密码" show-password>
              </el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input type="password" v-model="form.newPassword" auto-complete="off" placeholder="新密码" show-password>
              </el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="password">
              <el-input type="password" v-model="form.password" @change="changePass" auto-complete="off" placeholder="确认密码" show-password>
              </el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click.native="formVisible = false">取消</el-button>
            <el-button type="primary" @click.native="submit" :loading="formLoading">提交</el-button>
          </div>
        </el-dialog>
      </div>
    </el-dialog>
  </section>
</template>

<script>
const rules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z]{1})/, message: '首位必须是英文字母' },
    {
      pattern: /(?=.*[A-Z])(?=[a-zA-Z0-9_!@#%\.]*[_!@#%\.]).{3,}$/,
      message: '密码必须同时包含大、小写字母、数字、特殊符号(_!@#%)'
    },
    {
      min: 6,
      max: 18,
      message: '密码长度必须在6-18个字符之间',
      trigger: 'blur'
    }
  ],
  password: [{ required: true, message: ' ', trigger: 'blur' }]
}

let data = () => {
  return {
    hidden: false,
    filters: {
      page: 1,
      size: 100,
      sort: 'CREATED_DATE',
      order: 'DESC',
      query: { userId: null }
    },
    accounts: [],
    sysName: 'WYLT',
    menuData: [],
	// 图标列表
	iconCls: {
	        '101':'fa fa-bold',
			'105':'fa fa-star-half-o',
			'116':'fa fa-credit-card',
			'122':'fa fa-dollar',
			'128':'fa fa-line-chart',
			'129':'fa fa-exclamation',
			'134':'fa fa-desktop',
			'145':'fa el-icon-s-check',
	      },
	// 被激活的链接地址
	activePath: '',
    isCollapse: false,
    collapsed: false,
    formLoading: false,
    setVisible: false,
    formVisible: false,
    remindVisible: false,
    rules: rules,
    sysUserName: '',
    form: {}
  }
}

let change = function () {
  this.form = {}
  this.formVisible = true
}

let changePass = function () {
  if (this.form.newPassword != this.form.password) {
    this.$message.success('两次输入的密码不一致')
  }
}

let submit = function () {
  // 修改密码
  this.$refs.form.validate(valid => {
    if (!valid || this.formLoading) {
      return
    }
    this.formLoading = true
    this.$post('/changePassword', this.form)
      .then(res => {
        this.formLoading = false
        if (res.status != 0) {
          this.$message({
            showClose: true,
            message: res.error,
            type: 'error'
          })
          return
        }
        this.$message({
          type: 'success',
          message: '修改成功!'
        })
        this.formVisible = false
        this.getLogout()
      })
      .catch(() => (this.formLoading = false))
  })
}

let initMain = function () {
  //折叠导航栏

  let param = {
	  userName: this.sysUserName,
  }
  
  this.$post('/menu_list', param)
    .then(res => {
      if (res.status != 0) {
        this.$message({
          message: res.error || res.msg,
          type: 'error'
        })
        return
      }
	  // console.log(res.data)
      this.menuData = res.data
    })
    .catch(() => (this.logining = false))
}

let logout = function () {
  // 退出登录
  this.$confirm('确认退出吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      this.getLogout()
    })
    .catch(() => { })
}

let getLogout = function () {
  this.$get('/logout').then(res => {
    localStorage.removeItem('user')
    localStorage.removeItem('pricePrecision')
    localStorage.removeItem('volumePrecision')
    window.onbeforeunload = function (e) {
      var storage = window.localStorage
      storage.clear()
    }
	window.sessionStorage.clear()
    this.$router.push('/login')
    this.$message({
      type: 'success',
      message: res.error
    })
  })
}

let savePath = function(activePath, activeId){
	// 保存链接的激活状态
	window.sessionStorage.setItem('activePath', activePath)
  window.sessionStorage.setItem('activeId', activeId)
	this.activePath = activePath
}

export default {
  data: data,
  methods: {
    initMain,
    change,
    changePass,
    submit,
    getLogout,
    logout, //退出登录
	savePath,
    formatDate (d) {
      // 格式化时间
      return this.$moment(d).format('YYYY-MM-DD')
    }
  },
  created () {
    this.sysUserName = this.$store.state.loginMsg.user_name
    this.filters.query.userId = this.$store.state.loginMsg.user_id
    this.initMain()
	  this.activePath = window.sessionStorage.getItem('activePath')
  },
  mounted () {
    document.documentElement.style.overflowY = 'hidden'
    window.onresize = () => {
      if (document.body.clientWidth <= 768) {
        this.isCollapse = true
      } else {
        this.isCollapse = false
      }
    }
  }
}
</script>

<style scoped="scoped" lang="less">
@color: #f9f9f9;
@fontColor: #000;
@borderColor: #e6e6e6;

.container {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;

  .header {
    padding: 0;
    background: @color;
    color: @fontColor;
    display: flex;
    .userinfo {
      border-bottom: 1px solid @borderColor;
      flex: 1;
      .nav {
        text-align: left;
      }

      .nav a {
        color: @fontColor;
        padding: 0 15px;
        display: inline-block;
        height: 100%;
        font-size: 14px;
        text-decoration: none;
        line-height: 60px;
      }

      .nav a.active,
      .nav a:hover {
        background-color: @borderColor;
      }

      .tools {
        text-align: right;
        padding-right: 20px;
        line-height: 60px;
      }

      flex: 1;
    }
  }

  .aside {
    overflow: initial;
    .left {
      background: @color;
      border-bottom: solid 1px @borderColor;
      border-right: solid 1px @borderColor;
      display: flex;
      justify-content: center;
      // align-items: center;
      .logo {
        font-size: 24px;
        text-align: center;
        img {
          padding: 3px 0;
          width: 100px;
          height: 100px;
        }
      }
    }

    .el-menu-vertical-demo:not(.el-menu--collapse) {
      width: 150px;
      min-height: 400px;
    }

    .el-submenu .el-menu-item {
      min-width: 150px;
    }

    .el-menu {
      height: 100%;
      background: @color;
    }

    .collapsed {
      width: 60px;

      .item {
        position: relative;
      }

      .submenu {
        position: absolute;
        top: 0;
        left: 60px;
        z-index: 99999;
        height: auto;
        display: none;
      }
    }
  }

  .main {
    background: #fff;
    .content-container {
      .breadcrumb-container {
        .title {
          color: @fontColor;
        }

        .breadcrumb-inner {
          float: right;
        }
      }

      .content-wrapper {
        background-color: #fff;
        box-sizing: border-box;
        padding-top: 10px;
        margin-top: 10px;
        border-top: solid 1px @borderColor;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  // transition: 1s;
  transition: all 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
