<template>
<div class="login_container">
  <div class="login_box">
    <!-- 头像区域 -->
    <div class="avatat_box">
      <img src="../assets/logo.png">
    </div>

    <!--表单区域-->
    <el-form :model="loginform" :rules="rules" ref="loginFormRef" label-width="0px" class="login_form" >
      <el-form-item prop="username">
        <el-input v-model="loginform.username" prefix-icon="el-icon-user-solid"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginform.password" prefix-icon="el-icon-scissors" type="password"></el-input>
      </el-form-item>
      <el-form-item class="btns">
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetloginForm">重置</el-button>
      </el-form-item>
    </el-form>

  </div>
</div>
</template>

<script>
    export default {
        name: "login",
      data(){
          return {
            //表单绑定数据对象
            loginform:{
              username:'admin',
              password:'123456',
            },
            //验证规则
            rules:{
              username:[{required:true,message:'请填写用户名',trigger:'blur'},{min:3,max:10,message: '请输入正确格式的用户名',trigger: 'blur'}],
              password:[{required:true,message:'请填写密码',trigger:'blur'},{min:3,max:10,message: '请输入正确格式的密码',trigger: 'blur'}]
            }
          }
      },
      methods:{
          //重置表单
          resetloginForm(){
            this.$refs.loginFormRef.resetFields();
            this.loginform = {
              username:'',
              password:'',}
          },
        // 登录预验证
        login(){
            this.$refs.loginFormRef.validate(async (valid)=>{

              if(!valid){
              return;// 如果预验证没过就不发请求
            }else{
               const {data:res} = await this.$http.post('login',this.loginform);
                console.log(res)
              if(res.meta.status !== 200){
                 return this.$message.error('登录失败');
              }else {
                 this.$message.success('登录成功');
                 //将登录成功后服务器返回的token值存入浏览器的SessionStorage
                //其他功能的api只有在登录之后才能调用（利用token）
                //SessionStorage 又称会话存储，只在网页打开期间生效
                 window.sessionStorage.setItem('token',res.data.token);
                 //编程式导航， 跳转到/home页面
                 this.$router.push('/home');
              }

              }

            })
        }
      }
    }
</script>

<style lang="less" scoped>
.login_container{
  height: 100%;
  background: #2b4b6b;
}
  .login_box{
    width: 450px;
    height:300px;
    background: white;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);

    .avatat_box{
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: white;
      border: 1px solid #eee;
      box-shadow: 0 0 10px #ddd;
      padding: 10px;
      position: absolute;
      left: 50%;
      transform: translate(-50%,-50%);
      img{
        border-radius: 50%;
        background: #eee;
        width: 100%;
        height:100%;
      }
    }
  }

  .login_form{
    position: absolute;
    bottom: 0px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .btns{
    display: flex;
    justify-content: flex-end;
  }

</style>
