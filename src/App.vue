<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'app',
  components: {}
}
</script>

<style lang="less">
@color: #545c64;
body {
  margin: 0;
  padding: 0;
  min-width: 768px;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
    Microsoft YaHei, SimSun, sans-serif;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
}

html,
body,
#app {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.el-submenu [class^='fa'] {
  vertical-align: baseline;
  margin-right: 10px;
}

.el-menu-item [class^='fa'] {
  vertical-align: baseline;
  margin-right: 10px;
}

.toolbar {
  background: #f9f9f9;
  padding: 10px;
  margin: 10px 0;
  .el-form-item {
    margin-bottom: 10px;
  }
}

.fade-enter-active,
.fade-leave-active {
  opacity: 1;
  transition: all 0.5s ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
  // transform: translateY(1rem);
}

.el-date-editor.el-input,
.el-input-number,
.el-input__inner {
  //   width: 100% !important;
  text-align-last: center !important;
}

.el-dialog__body {
  padding: 30px;
}

.el-button--primary {
  // background-color: @color !important;
  // border-color: @color !important;
}
</style>
