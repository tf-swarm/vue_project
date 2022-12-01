<template>
  <section>
    <el-row>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-table :data="rightsList" border stripe>
			<el-table-column type="index"></el-table-column>
			<el-table-column label="权限名称" prop="authName"></el-table-column>
			<el-table-column label="路径" prop="path"></el-table-column>
			<el-table-column label="权限等级" prop="level">
			  <template slot-scope="scope">
				<el-tag v-if="scope.row.level === '0'">一级</el-tag>
				<el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
				<el-tag type="warning" v-else>三级</el-tag>
			  </template>
			</el-table-column>
		  </el-table>
      </el-col>
      <!--工具条-->
      <!-- <el-col :span="24" class="toolbar">
        <div class="block" align="right"> 
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[20, 30, 50, 100]" :page-size="size" layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </el-col> -->
    </el-row>
  </section>
</template>

<script>
	let data = function () {
		return {
			// 权限列表
			rightsList: []
		}
	}
	
	let getRigthsList = function () {
	  let param = {
	    status: "list"
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
	      this.rightsList = res.data
	      this.$message({
	        type: 'success',
	        message: '加载成功!'
	      })
	    })
	    .catch(() => (this.listLoading = false))
	}
	
export default {
	data: data,
  created () {
    // 获取所有的权限
    this.getRigthsList()
  },
  methods: {
    // 获取权限列表
	getRigthsList,
  }
}
</script>

<style>
	
</style>
