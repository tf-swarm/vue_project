<template>
  <section class="login">
    <el-row v-if="error || !show" class="show-loading">
      <el-col :span="24">
        <label :style="error ? { color: '#F56C6C' } : { color: '#409EFF' }">
          <i :class="error ? 'el-icon-warning' : 'el-icon-loading'"></i>
          {{ error ? '无法链接网络，请刷新页面' : '载入中，请稍候...' }}
        </label>
      </el-col>
    </el-row>
    <transition name="el-zoom-in-center">
      <el-form v-show="show" :model="form" status-icon :rules="rule" ref="form" label-position="left" label-width="0px" class="login-container">
        <h3 class="title">系统登录</h3>
        <el-form-item prop="name">
          <el-input type="text" v-model="form.name" auto-complete="off" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="form.password" auto-complete="off" placeholder="密码" />
        </el-form-item>
        <el-form-item prop="code">
          <el-row>
            <el-col :span="16">
              <el-input type="text" v-model="form.code" auto-complete="off" placeholder="验证码" />
            </el-col>
            <el-col :span="8" style="text-align: center;">
              <img v-if="form.src" :src="form.src" @click="getImageCode" style="padding-top:1px; width:100%" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item style="width:100%;">
          <el-button type="primary" style="width:100%;" @click.native.prevent="submitForm('form')" @keyup.enter.native="loginEnter" :loading="logining">登录
          </el-button>
        </el-form-item>
        <el-form-item>
          <router-link :to="'/register'" type="text" style="float:left">
            注册
          </router-link>
          <!-- <router-link :to="'/visitors/depth?id=游客'" type="text" style="float:right">
            >> 游客身份进入
          </router-link> -->
        </el-form-item>
      </el-form>
    </transition>
  </section>
</template>

<script scoped>
import JSEncrypt from 'jsencrypt'
import UUID from 'uuid'

let data = () => {
  return {
    error: false,
    // 显示图片成功之后就可以登录
    show: false,
    logining: false,
    form: {
      account: null,
      password: null,
      code: null,
      sessionId: null,
      publicKey: null,
      src: null
    },
    rule: {
      name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        {
          min: 6,
          max: 16,
          message: '密码长度为字母、数字 下划线组合的 8 到 16个字符',
          trigger: 'blur'
        }
      ],
      code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    }
  }
}

// 图片验证
let getImageCode = function () {
  this.form.sessionId = UUID.v4()
  let params = {
    uuid: this.form.sessionId
  }
  this.$axios
    .get('/indexBlue/imageCode', { params, responseType: 'arraybuffer' })
    .then(res => {
      // 这里判断是否请求成功
      if (res.status !== 200) {
        this.$message({
          message: res.data.error,
          type: 'error'
        })
        this.error = true
        return
      }
      // 这里解码二进制图片
      let blob = new Blob([res.data], { type: 'image/jpg' })
      let url = URL.createObjectURL(blob)
      // this.blobToBase64(blob).then(url => {
      // 设置请求成功显示图片
      this.form.src = url
      // })
      // 设置请求成功显示图片
      this.show = true
    })
    .catch(() => (this.error = true))
}

// 登录验证
let login = function () {
  // 表单验证
  this.$refs.form.validate(valid => {
    if (!valid) {
      return false
    }
    // 获取公共密钥
    let crypt = new JSEncrypt()
    crypt.setPublicKey(this.form.publicKey)
    // 传入加密的密码
    let password = crypt.encrypt(this.form.password)
    // console.log(password)
    let param = {
      username: this.form.name,
      password: password,
      img_code: this.form.code,
      uuid: this.form.sessionId
    }
    this.logining = true
    this.$post('/login', param)
      .then(res => {
        // console.log(res)
        this.logining = false
        if (res.status != 0) {
          this.$message({
            message: res.error || res.msg,
            type: 'error'
          })
          this.getImageCode()
          return
        }
        localStorage.setItem('user', JSON.stringify(res.data || {}))
        this.$store.commit('getLogin', res.data)
        this.$router.push({
          path: '/Depth'
        })
      })
      .catch(() => (this.logining = false))
  })
}

export default {
  data: data,
  methods: {
    getImageCode,
    login,
    loginEnter () {
      this.submitForm('form')
    },
    submitForm (form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.login()
        } else {
          return false
        }
      })
    },
    publicPem () {
      this.$get('/key').then(res => {
        this.form.publicKey = window.atob(res.pem)
      })
    }
  },
  created () {
    this.publicPem()
    this.getImageCode()
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
.login {
  height: 100%;
  background: url('../assets/background.jpg') no-repeat;
  -webkit-background-size: cover;
  -o-background-size: cover;
  background-position: center 0;
  .login-container {
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    // margin: 0 auto;
    width: 300px;
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
    margin: 0 auto;
    width: 100%;
    text-align: center;
    transform: translateY(100px);
  }
  .el-form-item {
    text-align-last: center;
  }
}
</style>
