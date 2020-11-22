<template>
    <div>
      <!--面包屑导航-->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图-->
      <el-card>
        <el-row>
          <!--添加角色按钮区域-->
          <el-col>
            <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
          </el-col>
        </el-row>

        <!--角色列表区域-->
     <el-table :data="roleList" border stripe>
       <!--展开列-->
       <el-table-column type="expand">
         <template slot-scope="scope">
           <el-row :class="['bdbottom',i1 ===0 ? 'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
             <!--渲染一级权限-->
             <el-col :span="5"><el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag><i class="el-icon-caret-right"></i></el-col>
             <!--渲染二级和三级权限-->
             <el-col :span="19">
               <el-row :class="['vcenter',i2 !==0 ? 'bdtop':'']" v-for="(item2,i2) in item1.children" :key="item2.id">
                 <!--通过for循环嵌套渲染二级权限-->
                 <el-col :span="6">
                   <el-tag closable type="success" @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                   <i class="el-icon-caret-right"></i>
                 </el-col>
                 <el-col :span="18">
                   <el-tag closable type="warning" v-for="(item3,i3) in item2.children" :key="item3.id" @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                 </el-col>
               </el-row>
             </el-col>
           </el-row>
         </template>
       </el-table-column>
       <!--索引列-->
       <el-table-column type="index" label="#"></el-table-column>
       <el-table-column label="角色名称" prop="roleName"></el-table-column>
       <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
       <el-table-column label="操作" width="300px">
         <template slot-scope="scope">
           <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
           <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRoleById(scope.row.id)">删除</el-button>
           <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
         </template>
       </el-table-column>
     </el-table>

      </el-card>




      <!--添加用户的对话框-->
      <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="30%"
        @close="addRoleDialogClosed">
        <!--内容主体区域-->
        <el-form :model="addRoles" :rules="addFormRules" ref="addRoleFormRef" label-width="80px" >
          <el-form-item label="职位名称" prop="roleName">
            <el-input v-model="addRoles.roleName"></el-input>
          </el-form-item>
          <el-form-item label="职位描述" prop="roleDesc">
            <el-input v-model="addRoles.roleDesc"></el-input>
          </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
            <!--底部按钮区域-->
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRole">确 定</el-button>
  </span>
      </el-dialog>




      <!--修改用户的对话框-->
      <el-dialog title="角色信息修改" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="roleFormRef" label-width="70px" >
          <el-form-item label="职位">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="职位描述" prop="email">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>

        </el-form>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </el-dialog>


      <!--分配权限按钮的对话框-->
      <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">

        <el-tree show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" :data="rightsList" :props="treeProps" ref="treeRef"></el-tree>

        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click='allotRights'>确 定</el-button>
      </el-dialog>









    </div>
</template>

<script>
    export default {
        name: "roles",
      data(){

          return{
            //所有角色列表数据
            roleList:[],

            //编辑角色相关
            editForm:{},
            editFormRules:{
              roleName:[{required:true,message:'请填写角色名称',trigger:'blur'}],
              roleDesc:[{required:true,message:'请填写角色描述',trigger:'blur'}],},
            editDialogVisible:false,

            //新增角色相关
            addRoles:{
              roleName:'',
              roleDesc:''
            },
            addDialogVisible:false,
            addFormRules:{
              roleName:[{required:true,message:'请填写用户名',trigger:'blur'}],
              roleDesc:[{required:true,message:'请填写密码',trigger:'blur'},{min:6,max:15,message: '请输入5 ~ 15字符的描述',trigger: 'blur'}],
            },

            //分配权限相关
            setRightDialogVisible:false,
            rightsList:[],
            //树形空间的属性绑定对象
            treeProps:{
              label:'authName',
              children:'children'
            },
            //默认选中的节点id值数组
            defKeys:[],
            //当前选中的角色的ID
            roleId:'',
          }
          },

      created() {
          this.getRolesList();
      },
      methods:{
         async getRolesList(){
            const {data:res} = await this.$http.get(`roles`);
            if (res.meta.status !== 200){
              return this.$message.error('获取角色列表失败');
            }
            this.roleList = res.data;
            console.log(res.data);
          },
        //根据ID删除对应权限,弹框确认用户是否删除
        removeRightById(scopeRow,id2){
           var role = scopeRow;
          this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${id2}`);
            if (res.meta.status !== 200){
              console.log(res);
              return this.$message.error('删除失败');
            }

            this.$message({
              type: 'success',
              message: '删除成功!'
            });

            // this.getRolesList(); 这个函数会导致页面重新渲染，影响使用
            role.children = res.data;
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        },

        //修改角色信息和提交
        editRoleInfo() {
          this.$refs.roleFormRef.validate(async (valid) => {
            if (!valid) {
              return
            }
            //预验证通过，发起请求
            const {data: res} = await this.$http.put(`roles/${this.editForm.roleId}`, {
              roleName: this.editForm.roleName,
              roleDesc: this.editForm.roleDesc
            });
            if (res.meta.status !== 200) {
              return this.$message.error('更新用户信息失败');
            }
            this.editDialogVisible = false;
            this.getRolesList();
            return this.$message.success('更新用户信息成功')
          })
        },

        //监听添加用户对话框关闭事件
        editDialogClosed() {
          this.$refs.roleFormRef.resetFields();
        },

        //展示编辑用户的对话框
        async showEditDialog(id) {
          const {data: res} = await this.$http.get(`roles/${id}`);
          if (res.meta.status !== 200) {
            return this.$message.error('查询角色信息失败');
          }
          this.editForm = res.data;
          this.editDialogVisible = true;
          console.log(this.editForm);
        },
        //根据ID删除角色
        deleteRoleById(id){
          this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            const {data:res} = await this.$http.delete(`roles/${id}`);
            if (res.meta.status !== 200){
              console.log(res);
              return this.$message.error('删除失败');
            }

            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.getRolesList();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        },

        //添加角色
        addRole(){
          this.$refs.addFormRef.validate(async valid => {
            // 预验证失败直接返回
            if (!valid) {
              return
            }
            ;
            // 预验证通过则发送请求
            const {data: res} = await this.$http.post('roles', this.addRoles);
            if (res.meta.status == 400) {
              return this.$message.error('该用户已存在');
            }
            if (res.meta.status !== 201) {
              return this.$message.error('创建用户失败，请使用正确格式填写表单')
            }
            // 隐藏对话框，刷新列表
            this.addDialogVisible = false
            this.getRolesList();
            this.$message.success('添加角色成功')
          })
        },

        //监听添加用户对话框关闭事件
        addRoleDialogClosed() {
          this.$refs.addRoleFormRef.resetFields();

        },

        //显示分配权限对话框
       async showSetRightDialog(role){
           //存储角色id一边之后使用
           this.roleId = role.id;
           const {data:res} = await this.$http.get('rights/tree')
         if(res.meta.status !== 200){
           return this.$message.error('获取权限失败');
         }
         this.rightsList = res.data
         this.getLeafKeys(role,this.defKeys);
         this.setRightDialogVisible = true;
         console.log(this.rightsList)
        },
        //通过递归的形式获取角色下所有三级权限的id
        getLeafKeys(node,arr){
           //如果是一个三级节点（没孩子）
           if(!node.children){
             return arr.push(node.id);
           }
           node.children.forEach((item)=>{
              this.getLeafKeys(item,arr);
           })
        },
        //监听分配权限对话框关闭事件
        setRightDialogClosed(){
           this.defKeys = [];
        },
        //点击为用户分配权限
       async allotRights(){
           const keys = [
             ...this.$refs.treeRef.getCheckedKeys(),
             ...this.$refs.treeRef.getHalfCheckedKeys()
           ];
           const idStr = keys.join(',');
          const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr});
          if(res.meta.status !== 200){
            return this.$message.error('分配权限失败');
          };
          this.getRolesList();
          this.$message.success('分配权限成功');

        }

      }

    }
</script>

<style scoped>
.el-tag{
  margin: 10px;
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
