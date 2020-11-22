<template>
    <div>
      <!--面包屑导航-->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图-->
      <el-card>
        <!--警告区域-->
        <el-alert
          title="注意: 只允许为第三级分类设置参数。"
          type="warning"
          show-icon
          :closable="false">
        </el-alert>

        <!--选择商品分类区域-->
        <el-row class="cat_opd">
          <el-col>
            <span>选择商品分类</span>
            <el-cascader
              v-model="selectCateKeys"
              :options="cateList"
              :props="cateProp"
              @change="handleCateChange"
              clearable
              style="width: 300px;margin-left: 20px"
            ></el-cascader>
          </el-col>
        </el-row>

        <!--tab页签区域-->
        <el-tabs v-model="activeName" @tab-click="handleClick">

          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <!--动态参数表格-->
            <el-table :data="manyTableData"  border stripe>

              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="tagClose(i,scope.row)">
                    {{item}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                </template>
              </el-table-column>

              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
            <!--静态属性表格-->
            <el-table :data="onlyTableData"  border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="tagClose(i,scope.row)">
                    {{item}}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>


      </el-card>

      <!--添加参数（动态参数，静态属性）的对话框-->
      <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>

        </el-form>
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </el-dialog>

      <!--编辑对话框-->
      <el-dialog :title="'编辑'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" >
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>

        </el-form>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "params",
      data(){
          return{
           cateList:[],
            //级联相关
            selectCateKeys:[],
            cateProp:{
              value:'cat_id',
              label:'cat_name',
              children:'children'
            },

            //激活页签名称，默认 第一个
            activeName:'many',
            manyTableData:[],
            onlyTableData:[],


            //添加对话框相关
            addDialogVisible:false,
            addForm:{
             attr_name:'',
            },
            addFormRules:{
             attr_name: [{required:true,message:'请填写名称',trigger:'blur'}]
            },

            //编辑对话框

            editDialogVisible:false,
            editForm:{
              attr_name:'',
            },
            editFormRules:{
              attr_name: [{required:true,message:'请填写名称',trigger:'blur'}]
            },

            //
            inputVisible:false,
            inputValue:"",

          }
      },

      created() {
     this.getCateList();
      },

      methods:{
          //获取数据
        async getCateList(){
          const {data:res} = await this.$http.get('categories');
          if(res.meta.status !== 200){
            return this.$message.error("获取商品列表数据失败");
          }
          this.cateList = res.data;
          this.total = res.total;
          console.log(res.data);
          this.$message.success('获取商品数据成功');
        },


        //根据所选分类ID和当前所处面板（only——many），获取对应的参数
        async getParamsData(){

          //证明选择的不是三级分类
          if(this.selectCateKeys.length !== 3){
            //则把id数组清空，重新选择再赋值
            this.selectCateKeys = [];
            this.manyTableData = [];
            this.onlyTableData = [];
            return;
          };
           //证明选中三级分类
          const {data:res} = await this.$http.get(`categories/${this.cateID}/attributes`,{params:{'sel':this.activeName}});
          if (res.meta.status !== 200) {
            return this.$message.error('获取失败失败');
          }

          //将attr_val从字符串分割为数组
          res.data.forEach(item=>{
            if (item.attr_vals !== ''){
           item.attr_vals = item.attr_vals.split(',');
            }
            else if (item.attr_vals == ''){
              item.attr_vals =[];
            }
            //添加布尔值控制文本框newtag的显示与隐藏
            item.inputVisible = false;
            item.inputValue = '';
          })

          console.log(res.data)
          if(this.activeName == 'many'){
          this.manyTableData = res.data;
          }
          else{
            this.onlyTableData = res.data;
          }
        },


        //级联选择框选择回调函数
        handleCateChange(){
         this.getParamsData();
        },

        //tab页签点击事件的处理函数
        handleClick(){
        this.getParamsData();
        },

        //监听添加对话框的关闭事件
        addDialogClosed(){
          this.$refs.addFormRef.resetFields();
        },

        //添加参数
        addParams(){
          this.$refs.addFormRef.validate( async valid=>{
            if (!valid){
              return this.$message.error('错误');
            }
            const {data:res} = await this.$http.post(`categories/${this.cateID}/attributes`,{
              attr_name:this.addForm.attr_name,
              attr_sel:this.activeName,
            });
            if (res.meta.status !== 201){
              return this.$message.error('添加参数失败');
            };
            this.$message.success('添加参数成功');
            this.addDialogVisible = false;
            this.getParamsData();
          })
        },


        //显示编辑对话框
        async showEditDialog(attr_id){
          const {data:res} = await this.$http.get(`categories/${this.cateID}/attributes/${attr_id}`);
          if (res.meta.status !== 200){
            return this.$message.error('查询参数失败');
          };
          this.editForm = res.data
          this.editDialogVisible = true;
        },

        //编辑提交
        editParams(){
          this.$refs.editFormRef.validate( async valid=>{
            if (!valid){
              return this.$message.error('错误编辑');
            }
            const {data:res} = await this.$http.put(`categories/${this.cateID}/attributes/${this.editForm.attr_id}`,{
              attr_name:this.editForm.attr_name,
              attr_sel:this.activeName,
            });
            if (res.meta.status !== 200){
              return this.$message.error('添加参数失败');
            };
            this.$message.success('添加参数成功');
            this.editDialogVisible = false;
            this.getParamsData();
          })
        },

        editDialogClosed(){
          this.$refs.editFormRef.resetFields();
        },

        //根据ID删除对应参数项
        removeParams(attr_id){
          this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            const {data:res} = await this.$http.delete( `categories/${this.cateID}/attributes/${attr_id}`);
            if (res.meta.status !== 200){
              console.log(res);
              return this.$message.error('删除失败');
            }

            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getParamsData();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        },

        //文本框失去焦点或者按下enter键都会触发
        async handleInputConfirm(row){
          if (row.inputValue.trim().length === 0){
            row.inputValue = '';
            row.inputVisible = false;
            return;
          }
          //这里证明输入了内容，需要后续处理
          row.attr_vals.push(row.inputValue.trim());
          row.inputValue = '';
          row.inputVisible = false;

           const {data:res} = await this.$http.put(`categories/${this.cateID}/attributes/${row.attr_id}`,{
            attr_name:row.attr_name,
            attr_sel:row.attr_sel,
            attr_vals:row.attr_vals.join(','),
          });

          if (res.meta.status !== 200){
            return this.$message.error('修改参数失败');
          };
          this.$message.success('修改参数成功');


        },

        showInput(row){
         row.inputVisible = true;
          this.$nextTick(()=> {
            this.$refs.saveTagInput.$refs.input.focus();
          });
        },

        async tagClose(i,row){
          row.attr_vals.splice(i,1);
          const {data:res} = await this.$http.put(`categories/${this.cateID}/attributes/${row.attr_id}`,{
            attr_name:row.attr_name,
            attr_sel:row.attr_sel,
            attr_vals:row.attr_vals.join(','),
          });

          if (res.meta.status !== 200){
            return this.$message.error('修改参数失败');
          };
          this.$message.success('修改参数成功');

        }



      },

      computed:{
          //如果按钮需要被禁用则返回true，否则返回false
        isBtnDisabled(){
          if (this.selectCateKeys.length !== 3){
            return true;
          }
          return false;
        },

        //当前选中的三级分类的ID
        cateID(){
          if(this.selectCateKeys.length === 3){
            return this.selectCateKeys[this.selectCateKeys.length-1];
          }
          return null;
        },
        //动态计算标题的文本
        titleText(){
          if (this.activeName === 'many'){
            return '动态参数';
          }
          return '静态属性'
        },


      }
    }
</script>

<style lang="less" scoped>
.cat_opd{
  margin-top: 15px
}
  .el-tag{
    margin: 10px;
  }
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
  .input-new-tag{
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
