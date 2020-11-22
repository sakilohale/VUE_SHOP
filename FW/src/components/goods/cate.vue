<template>
<div>
  <!--面包屑导航-->
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>分类管理</el-breadcrumb-item>
    <el-breadcrumb-item>分类列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!--卡片视图-->
  <el-card>
    <!--添加用户按钮-->
    <el-row>
      <el-col>
        <el-button type="primary" @click="showCateDialog">添加分类</el-button>
      </el-col>
    </el-row>

    <!--表格区域-->
    <tree-table class="tree_table" :data="categories" :columns="columns" :expand-type="false" :show-index="true" index-text="#" border :selection-type="false">
      <!--是否有效-->
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
        <i class="el-icon-error" v-else style="color:#ff0000"></i>
      </template>
      <!--排序-->
      <template slot="order" slot-scope="scope">
        <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="warning" size="mini" v-else>三级</el-tag>
      </template>
      <!--操作-->
      <template slot="opt" slot-scope="scope">
        <el-button type="primary" class="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
        <el-button type="danger" class="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
      </template>
    </tree-table>
    <!--分页区域-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[3,5,6]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>

  <!--添加分类的对话框-->

  <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">

    <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="70px" >
      <el-form-item label="分类名称">
        <el-input v-model="addCateForm.cat_name" prop="cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类">
        <el-cascader
          v-model="selectKey"
          :options="parentList"
          :props="cascaderProps"
          @change="ParentCateChange"
          clearable
          change-on-select
        ></el-cascader>
      </el-form-item>


    </el-form>


    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </el-dialog>


  <!--编辑商品的对话框-->
  <el-dialog title="商品信息修改" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
    <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="70px" >
      <el-form-item label="商品名称">
        <el-input v-model="editCateForm.cat_name" prop="cat_name"></el-input>
      </el-form-item>

    </el-form>
    <el-button @click="editCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editCate(editCateForm.cat_id)">确 定</el-button>
  </el-dialog>

</div>
</template>

<script>
    export default {
        name: "cate",
      data(){
         return{
           //商品列表信息
           categories:[],
           querInfo:{
             type:3,
             pagenum:1,
             pagesize:5,
           },
           //总数据条数
           total:0,
           //为tabletree指定列定义
           columns:[{
             label:'分类名称',
             prop:'cat_name',
           },
             {
               label: "是否有效",
               //将当前列指定为模板列.
               type:'template',
               //模板名称
               template:'isok'
             },
             {
               label: "排序",
               //将当前列指定为模板列.
               type:'template',
               //模板名称
               template:'order'
             },
             {
               label: "操作",
               //将当前列指定为模板列.
               type:'template',
               //模板名称
               template:'opt'
             }],



           //添加分类相关
           addCateDialogVisible:false,
           addCateForm:{
             cat_name:'',
             //父级分类ID
             cat_pid:'',
             //分类的等级（默认添加一级分类）
             cat_level:0,
           },
           parentList:[],
           //指定级联选择器的配置对象
           cascaderProps:{
             value:'cat_id',
             label:'cat_name',
             children:'children'
           },
           //选中的父级分类的ID数组
           selectKey:[],
           addCateFormRules:{cat_name:{required:true,message:'请填写名称',trigger:'blur'},},



           //编辑信息相关
           editCateDialogVisible:false,
           editCateForm:{
             cat_name:'',
             cat_id:'',
           },
           editCateFormRules:{
             cat_name:{required:true,message:'请填写名称',trigger:'blur'},
           }
         }
      },
      created() {
          this.getCateList();
      },
      methods:{
         async getCateList(){
         const {data:res} = await this.$http.get('categories',{params:this.querInfo});
         if(res.meta.status !== 200){
           return this.$message.error("获取商品列表数据失败");
         }
         this.categories = res.data.result;
         this.total = res.total;
         console.log(res.data);
         this.$message.success('获取商品数据成功');
         },
        handleSizeChange(newSize){
           this.querInfo.pagesize = newSize;
           this.getCateList();
        },
        handleCurrentChange(newPage){
        this.querInfo.pagenum = newPage;
        this.getCateList();
        },
        // 显示添加分类对话框
        showCateDialog(){
           this.getParentCateList();
           this.addCateDialogVisible = true;
        },
        //获取父级列表
       async getParentCateList(){
           const {data:res} = await this.$http.get('categories',{params:{type:2}});
         if(res.meta.status !== 200){
           return this.$message.error("获取商品列表数据失败");
         }
         this.parentList = res.data;
        },
        ParentCateChange(){
           //如果selectKey数组长度为0，没有选择任何父级分类，若长度为1，则只选择了父级分类，若长度为2，则选择了二级分类
           console.log(this.selectKey)
          if (this.selectKey.length>0) {
            this.addCateForm.cat_pid = this.selectKey[this.selectKey.length - 1]; //当前父级分类ID赋值
            this.addCateForm.cat_level = this.selectKey.length;//当前父类等级赋值
          }else{
            this.addCateForm.cat_pid = 0; //当前父级分类ID赋值
            this.addCateForm.cat_level = 0;//当前父类等级赋值
          }
        },
       async addCate(){
         this.$refs.addCateFormRef.validate(async valid => {
           // 预验证失败直接返回
           if (!valid) {
             return
           }
           ;
           // 预验证通过则发送请求
           const {data: res} = await this.$http.post('categories', this.addCateForm);
           if (res.meta.status == 400) {
             return this.$message.error('该用户已存在');
           }
           if (res.meta.status !== 201) {
             return this.$message.error('创建用户失败，请使用正确格式填写表单')
           }
           // 隐藏对话框，刷新列表
           this.addCateDialogVisible = false
           this.getCateList();
           this.$message.success('添加角色成功')
         })
        },
        addCateDialogClosed(){
          this.selectKey = [];
          this.addCateForm.cat_level = 0;
          this.addCateForm.cat_pid = 0;
          this.addCateForm.cat_name = ''
        },

        showEditDialog(id){

           this.editCateDialogVisible = true;
           this.editCateForm.cat_id = id;
           },

        async editCate(id){
          this.$refs.editCateFormRef.validate(async valid => {
              // 预验证失败直接返回
              if (!valid) {
                return
              };
              // 预验证通过则发送请求
           const {data:res} = await this.$http.put(`categories/${id}`,{cat_name:this.editCateForm.cat_name});
          if(res.meta.status !== 200){
            console.log(res)
            return this.$message.error("编辑失败");
          };
            this.getCateList();
            this.editCateDialogVisible = false;
          this.$message.success("编辑成功");
        })},

        editCateDialogClosed(){
           this.$refs.editCateFormRef.resetFields();
        },


        deleteCate(id){
          this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            const {data:res} = await this.$http.delete(`categories/${id}`);
            if (res.meta.status !== 200){
              console.log(res);
              return this.$message.error('删除失败');
            }

            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getCateList();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        }


      },

    }
</script>

<style lang="less" scoped>
.tree_table{
  margin-top: 15px;
}

</style>
