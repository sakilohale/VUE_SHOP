<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="40">
        <el-col :span="10">
          <el-input placeholder="请输入内容" clearable class="input-with-select" v-model="queryinfo.query" @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加用户</el-button>
        </el-col>
      </el-row>

      <!--用户列表区域-->
      <el-table :data="goodslist" border stripe>
        <el-table-column label="#" type="index" ></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="价格" prop="goods_price"></el-table-column>
        <el-table-column label="重量" prop="goods_weight"></el-table-column>
        <el-table-column label="操作" >
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-tooltip class="item" effect="dark" content="修改商品信息" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
            </el-tooltip>
            <!--删除按钮-->
            <el-tooltip class="item" effect="dark" content="删除商品" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[3,5,10]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>



      <!--修改用户的对话框-->
      <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editGoodsFormRef" label-width="70px" >

          <el-form-item label="商品名称">
            <el-input v-model="editForm.goods_name" prop="goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品状态" prop="goods_state">
              <el-input disabled v-model="editForm.goods_state == 0 ?'无':'尚有'"></el-input>
          </el-form-item>
          <el-form-item label="是否热销" prop="is_promote">
            <el-input disabled v-model="editForm.is_promote ? '热销中':'冷门中'"></el-input>
          </el-form-item>

        </el-form>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
      </el-dialog>


    </el-card>

  </div>
</template>

<script>
  export default {
    name: "list",
    data(){

      return{
        queryinfo:{
          query:'',
          //页序号
          pagenum:1,
          //页容量
          pagesize:3,
        },
        goodslist:[],

        total:0,



        //控制修改用户对话框的显示隐藏
        editDialogVisible:false,
        //查询到的用户信息对象
        editForm:{},

        editFormRules:{
          goods_name:[{required:true,message:'请填写商品名称',trigger:'blur'}],
          goods_cat:[{required:true,message:'请选择商品分类',trigger:'blur'}],
          goods_price:[{required:true,message:'请填写商品价格',trigger:'blur'}],
          goods_number:[{required:true,message:'请填写商品数量',trigger:'blur'}],
          goods_weight:[{required:true,message:'请填写商品重量',trigger:'blur'}],
          goods_state:[{required:true,message:'请填写商品重量',trigger:'blur'}],
          is_promote:[{required:true,message:'请填写商品重量',trigger:'blur'}]
        },

        //分配角色相关
        setRoleDialogVisible:false,
        userInfo:{},
        rolesList:[],
        selectdRoleId:'',
      }
    },
    created() {
      this.getGoodsList();
    },
    methods: {
      // 获取所有用户数据，刷新数据
      async getGoodsList() {
        const {data: res} = await this.$http.get('goods', {params: this.queryinfo});
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败');
        }
        this.goodslist = res.data.goods;
        this.total = res.data.total;

      },
      //监听页容量变化
      handleSizeChange(newSize) {
        this.queryinfo.pagesize = newSize;
        this.getGoodsList();
      },
      //监听页序变化
      handleCurrentChange(newPage) {
        this.queryinfo.pagenum = newPage;
        this.getGoodsList();
      },

      //监听添加商品
      addGoods() {
        this.$router.push('/addGoods');

      },
      //监听添加用户对话框关闭事件
      addDialogClose() {
        this.$refs.addGoodsFormRef.resetFields();

      },
      //展示编辑用户的对话框
      async showEditDialog(id) {
        const {data: res} = await this.$http.get(`goods/${id}`);
        if (res.meta.status !== 200) {
          return this.$message.error('查询商品信息失败');
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //监听修改用户对话框关闭事件
      editDialogClosed() {
        this.$refs.editGoodsFormRef.resetFields();
      },
      //修改用户信息和提交
      editGoodsInfo() {
        this.$refs.editGoodsFormRef.validate(async (valid) => {
          if (!valid) {
            return
          }
          //预验证通过，发起请求
          const {data: res} = await this.$http.put(`goods/${this.editForm.goods_id}`, {
            goods_name: this.editForm.goods_name,
            goods_price: this.editForm.goods_price,
            goods_weight:this.editForm.goods_weight,
            goods_number:this.editForm.goods_number,
          });
          if (res.meta.status !== 200) {
            console.log(res)
            return this.$message.error('更新商品信息失败');
          }
          this.editDialogVisible = false;
          this.getGoodsList();
          return this.$message.success('更新用户信息成功')
        })
      },
      //根据Id删除用户
      removeGoodsById(id) {
        this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data:res} = await this.$http.delete(`goods/${id}`);
          if (res.meta.status !== 200){
            console.log(res);
            return this.$message.error('删除失败');
          }

          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getGoodsList();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      //展示分配角色的对话框
      async setRole(userInfo){
        console.log('111')
        //在展示之前获取所有角色的列表
        const {data:res} = await this.$http.get(`roles`);
        if(res.meta.status !== 200){
          return this.$message.error('获取角色列表失败');
        }
        this.rolesList = res.data
        this.setRoleDialogVisible = true;
        this.userInfo = userInfo;
      },
      //点击分配按钮事件
      async saveRoleInfo(){
        if(!this.selectdRoleId){
          return this.$message.error("请选择一个角色");
        }
        const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
          rid:this.selectdRoleId
        });
        if(res.meta.status!==200){
          console.log(res)
          return this.$message.error("分配失败");

        }
        this.getGoodsList();
        this.setRoleDialogVisible = false;
        this.$message.success("分配成功");

      },
      //监听分配对话框关闭
      selectDialogClosed(){
        this.selectdRoleId = '';
      }

    }
  }
</script>

<style scoped>

</style>
