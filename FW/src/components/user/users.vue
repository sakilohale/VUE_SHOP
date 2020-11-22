<template>
    <div>
     <!--面包屑导航-->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图-->
      <el-card>
        <!--搜索与添加区域-->
        <el-row :gutter="40">
          <el-col :span="10">
            <el-input placeholder="请输入内容" clearable class="input-with-select" v-model="queryinfo.query" @clear="getUsersList">
              <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
         <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>

        <!--用户列表区域-->
        <el-table :data="userlist" border stripe>
          <el-table-column label="#" type="index" ></el-table-column>
          <el-table-column label="姓名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.mg_state"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="ueserStateChange(scope.row)" >
              </el-switch>

            </template>
          </el-table-column>
          <el-table-column label="操作" >
            <template slot-scope="scope">
              <!--修改按钮-->
              <el-tooltip class="item" effect="dark" content="修改用户信息" placement="top" :enterable="false">
                <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="showEditDialog(scope.row.id)"></el-button>
              </el-tooltip>
              <!--删除按钮-->
              <el-tooltip class="item" effect="dark" content="删除该用户" placement="top" :enterable="false">
                <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="removeUserById(scope.row.id)"></el-button>
              </el-tooltip>
              <!--分配角色按钮-->
              <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="info" icon="el-icon-star-off" circle size="mini" @click="setRole(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!--分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryinfo.pagenum"
          :page-sizes="[1,2,3,4]"
          :page-size="100"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>

        <!--添加用户的对话框-->
        <el-dialog
          title="添加用户"
          :visible.sync="addDialogVisible"
          width="30%"
        @close="addDialogClose">
          <!--内容主体区域-->
          <el-form :model="adduserlist" :rules="addFormRules" ref="addFormRef" label-width="70px" >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="adduserlist.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="adduserlist.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="adduserlist.email"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="mobile">
              <el-input v-model="adduserlist.mobile"></el-input>
            </el-form-item>

          </el-form>
          <span slot="footer" class="dialog-footer">
            <!--底部按钮区域-->
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
        </el-dialog>

        <!--修改用户的对话框-->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" >
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>

          </el-form>
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </el-dialog>

        <!--分配角色的对话框-->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="selectDialogClosed">
          <p>当前的用户：{{userInfo.username}}</p>
          <p>当前的用户：{{userInfo.role_name}}</p>
          <el-select v-model="selectdRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </el-dialog>

      </el-card>

    </div>
</template>

<script>
    export default {
        name: "users",
      data(){
          //验证邮箱的规则
        var checkEmail = (rule,value,callback) => {
               var regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
               if (regEmail.test(value) == true){
                 return callback();
               }
               return callback(new Error('请用合法的邮箱'));
        }
        // 验证手机号的规则
        var checkMobile = (rule,value,callback) => {
              var regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
          if (regMobile.test(value) == true){
            return callback();
          }
          return callback(new Error('请用合法的电话号码'));
        }

          return{
            queryinfo:{
              query:'',
              //页序号
              pagenum:1,
              //页容量
              pagesize:2,
            },
            userlist:[],
            adduserlist:{
              username:'',
              password:'',
              email:'',
              mobile:'',
            },
            total:0,
            addDialogVisible:false,

            addFormRules:{
              username:[{required:true,message:'请填写用户名',trigger:'blur'},{min:3,max:10,message: '请输入3 ~ 10字符的用户名',trigger: 'blur'}],
              password:[{required:true,message:'请填写密码',trigger:'blur'},{min:6,max:15,message: '请输入6 ~ 15字符的密码',trigger: 'blur'}],
              email:[{required:true,message:'请填写电话',trigger:'blur'},{validator: checkEmail,trigger: "blur"}],
              mobile:[{required:true,message:'请填写电话',trigger:'blur'},{validator: checkMobile,trigger: "blur"}],
            },
            //控制修改用户对话框的显示隐藏
            editDialogVisible:false,
            //查询到的用户信息对象
            editForm:{},

            editFormRules:{
              email:[{required:true,message:'请填写电话',trigger:'blur'},{validator: checkEmail,trigger: "blur"}],
              mobile:[{required:true,message:'请填写电话',trigger:'blur'},{validator: checkMobile,trigger: "blur"}],},

            //分配角色相关
            setRoleDialogVisible:false,
            userInfo:{},
            rolesList:[],
            selectdRoleId:'',
          }
      },
      created() {
           this.getUsersList();
      },
      methods: {
        // 获取所有用户数据，刷新数据
        async getUsersList() {
          const {data: res} = await this.$http.get('users', {params: this.queryinfo});
          if (res.meta.status !== 200) {
            return this.$message.error('获取用户列表失败');
          }
          this.userlist = res.data.users;
          this.total = res.data.total;

        },
        //监听页容量变化
        handleSizeChange(newSize) {
          this.queryinfo.pagesize = newSize;
          this.getUsersList();
        },
        //监听页序变化
        handleCurrentChange(newPage) {
          this.queryinfo.pagenum = newPage;
          this.getUsersList();
        },
        //监听switch状态改变
        async ueserStateChange(userinfo) {
          //`users/:uId/state/:type`
          const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
          if (res.meta.status !== 200) {
            userinfo.mg_state = !userinfo.mg_state;
            return this.$message.error('更新用户状态失败');
          }
          this.$message.success('更新用户状态成功');
        },
        //监听添加用户
        addUser() {
          this.$refs.addFormRef.validate(async valid => {
            // 预验证失败直接返回
            if (!valid) {
              return
            }
            ;
            // 预验证通过则发送请求
            const {data: res} = await this.$http.post('users', this.adduserlist);
            if (res.meta.status == 400) {
              return this.$message.error('该用户已存在');
            }
            if (res.meta.status !== 201) {
              return this.$message.error('创建用户失败，请使用正确格式填写表单')
            }
            // 隐藏对话框，刷新列表
            this.addDialogVisible = false
            this.getUsersList();
            this.$message.success('添加用户成功');
          })

        },
        //监听添加用户对话框关闭事件
        addDialogClose() {
          this.$refs.addFormRef.resetFields();

        },
        //展示编辑用户的对话框
        async showEditDialog(id) {
          const {data: res} = await this.$http.get(`users/${id}`);
          if (res.meta.status !== 200) {
            return this.$message.error('查询用户信息失败');
          }
          this.editForm = res.data
          this.editDialogVisible = true
        },
        //监听修改用户对话框关闭事件
        editDialogClosed() {
          this.$refs.editFormRef.resetFields();
        },
        //修改用户信息和提交
        editUserInfo() {
          this.$refs.editFormRef.validate(async (valid) => {
            if (!valid) {
              return
            }
            //预验证通过，发起请求
            const {data: res} = await this.$http.put(`users/${this.editForm.id}`, {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            });
            if (res.meta.status !== 200) {
              return this.$message.error('更新用户信息失败');
            }
            this.editDialogVisible = false;
            this.getUsersList();
            return this.$message.success('更新用户信息成功')
          })
        },
        //根据Id删除用户
        removeUserById(id) {
          this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
          const {data:res} = await this.$http.delete(`users/${id}`);
          if (res.meta.status !== 200){
            console.log(res);
            return this.$message.error('删除失败');
          }

            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          this.getUsersList();
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
          this.getUsersList();
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
