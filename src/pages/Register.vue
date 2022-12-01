<template>
  <section class="register">
    <div v-show="show" class="el-message el-message--success" style="top: 20px; z-index: 2000;">
      <i class="el-message__icon el-icon-success"></i>
      <p class="el-message__content">注册成功，{{ index }} 秒后跳入登录页面</p>
    </div>
    <transition name="el-zoom-in-center">
      <el-form :model="form" label-position="left" status-icon :rules="rule" ref="form" label-width="100px" class="register-container">
        <h3 class="title">注册用户</h3>
        <el-form-item prop="name" label="用户名：">
          <el-input type="text" v-model="form.name" autocomplete="off" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password" label="密码：">
          <el-input type="password" v-model="form.password" autocomplete="off" placeholder="密码" />
        </el-form-item>
        <el-form-item prop="newPassword" label="确认密码：">
          <el-input type="password" v-model="form.newPassword" @change="changePass" autocomplete="off" placeholder="确认密码" />
        </el-form-item>
        <el-form-item prop="mobile" label="手机号：">
          <el-input type="text" v-model="form.mobile" autocomplete="off" placeholder="手机号" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱：">
          <el-input type="text" v-model="form.email" autocomplete="off" placeholder="邮箱" />
        </el-form-item>
        <!-- <el-form-item prop="authorizationCode" label="授权码：">
          <el-input type="text" v-model="form.authorizationCode" autocomplete="off" placeholder="授权码" />
        </el-form-item> -->
        <el-form-item style="width:100%;">
          <el-button type="success" style="width:100%;" @click.native.prevent="submitForm('form')" @keyup.enter.native="loginEnter" :loading="logining">注册
          </el-button>
        </el-form-item>
        <el-form-item>
          <router-link :to="'/login'" type="text" style="float:right">
            登录
          </router-link>
        </el-form-item>
      </el-form>
    </transition>
  </section>
</template>

<script scoped>
let data = () => {
  return {
    logining: false,
    show: false,
    status: 'off',
    form: {
      name: null,
      password: null,
      mobile: null,
      email: null,
      // authorizationCode: null
    },
    rule: {
      name: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        {
          min: 3,
          max: 15,
          message: '用户名长度为 3 到 15个字符',
          trigger: 'blur'
        },
        {
          pattern: /^(?=.*[a-zA-Z0-9_]+$)/,
          message: '用户名只能是数字、字母、下划线'
        }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        {
          min: 6,
          max: 18,
          message: '密码长度为 6 到 18个字符',
          trigger: 'blur'
        },
        {
          pattern: /^(?=.*[a-zA-Z0-9_!@#%\.]+$)/,
          message: '密码只能是字母、数字、特殊符号(_!@#%)'
        }
      ],
      newPassword: [
        { required: true, message: '请重新输入密码', trigger: 'blur' }
      ],
      mobile: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
          validator: function(rule, value, callback) {
            if (/^1[34578]\d{9}$/.test(value) == false) {
              callback(new Error("手机号格式错误"));
            } else {
              callback();
            }
          },
          trigger: "blur"
        }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        {
          validator: function(rule, value, callback) {
            if (
              /^\w{1,64}@[a-z0-9\-]{1,256}(\.[a-z]{2,6}){1,2}$/i.test(
                value
              ) == false
            ) {
              callback(new Error("邮箱格式错误"));
            } else {
              callback();
            }
          },
          trigger: "blur"
        }
      ],
      // authorizationCode: [
      //   { required: true, message: '请输入授权码', trigger: 'blur' }
      // ]
    },
    index: 5
  }
}

let changePass = function () {
  if (this.form.newPassword != this.form.password) {
    this.$message.success('两次输入的密码不一致')
  }
}

let register = function () {
  // 注册
  this.$refs.form.validate(valid => {
    // 表单验证
    if (!valid) {
      return
    }
    console.log(this.form)
    let param = {
      name: this.form.name.replace(/\s/g, ''),
      password: this.form.password.replace(/\s/g, ''),
      mobile: this.form.mobile.replace(/\s/g, ''),
      email: this.form.email.replace(/\s/g, ''),
      // authorizationCode: this.form.authorizationCode.replace(/\s/g, '')
    }
    this.logining = true
    this.$post('/register', param)
      .then(res => {
        console.log(res)
        this.logining = false
        if (res.status != 0) {
          this.$message({
            message: res.error || res.msg,
            type: 'error'
          })
          return
        }
        this.show = true
        let timeId = setInterval(() => {
          this.index--
          if (this.index == 0) {
            clearInterval(timeId)
            this.show = false
            this.$router.push({ path: '/login' })
          }
        }, 1000)
      })
      .catch(() => (this.logining = false))
  })
}

export default {
  data: data,
  methods: {
    changePass,
    register,
    loginEnter () {
      this.submitForm('form')
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.register()
        } else {
          return false
        }
      })
    }
  },
  created () {
    // this.publicPem()
    document.onkeydown = e => {
      let key
      if (window.event === undefined) {
        key = e.keyCode
      } else {
        key = window.event.keyCode
      }
      if (key && key === 13) {
        this.loginEnter()
        return false
      }
    }
  },
  //离开页面后，阻止回车事件
  destroyed () {
    document.onkeydown = undefined
  },
  mounted () { }
}
</script>

<style scoped="scoped" lang="less">
.register {
  height: 100%;
  background: url('../assets/background.jpg') no-repeat;
  -webkit-background-size: cover;
  -o-background-size: cover;
  background-position: center 0;
  .register-container {
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    // margin: 0 auto;
    width: 350px;
    padding: 35px 35px 15px;
    background: #fff;
    border: 1px solid #eaeaea;
	// 边框显示高亮阴影部分
    // box-shadow: 0 0 25px #cac6c6;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .title {
      margin: 0 auto 40px;
      text-align: center;
      color: #505458;
    }
  }
  .show-loading {
    background-clip: padding-box;
    margin: 200px auto;
    width: 100%;
    text-align: center;
  }
  // .el-form-item {
  //   text-align-last: center;
  // }
}
</style>
