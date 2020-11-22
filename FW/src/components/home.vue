<template>
<div class="home-container">

  <el-container class="home-container">
    <!--页头区域-->
    <el-header>
      <div>
        <img src="../assets/logo.png">
      <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>

    </el-header>
    <el-container>
      <!--侧边栏区域-->
      <el-aside :width="isCollpase?'64px':'200px'">
        <div class="toggleButton" @click="toggleCollpase">|||
        </div>

 <!--导航菜单-->
          <el-menu
            :default-active="activepath"
            class="el-menu-vertical-demo"
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
            :unique-opened = 'true'
            :collapse="isCollpase"
            :collapse-transition="false"
            :router="true"
           >

            <!--一级菜单-->
            <el-submenu v-for="item in menuList" :key="item.id" :index="item.id+''">
              <!--一级菜单的模板区域-->
              <template slot="title">
                <!--图标-->
                <i :class="iconobj[item.id]" style="padding-right:10px"></i>
                <!--文本-->
                <span>{{item.authName}}</span>
              </template>

              <!--二级菜单-->
              <el-menu-item v-for="subitem in item.children" :key="subitem.id" :index="subitem.path" @click="saveNavState(subitem.path)">
                <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>{{subitem.authName}}</span>
              </template>
              </el-menu-item>

            </el-submenu>



          </el-menu>

      </el-aside>
      <!--主体区域-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</div>
</template>

<script>
    export default {
        name: "home",
      data(){
          return{
            //左侧菜单数据
            menuList:[],
            iconobj:{
              '125':'el-icon-s-custom',
              '103':'el-icon-key',
              '101':'el-icon-shopping-cart-1',
              '102':'el-icon-notebook-2',
              '145':'el-icon-s-opportunity',
            },
            isCollpase:false,
            //被激活的链接地址
            activepath:''

          }
      },
      created() {
          this.getmenulist();
          this.activepath = window.sessionStorage.getItem('activepath')
      },
      methods:{
          //登出
          logout(){
            // 退出———— 1.清空 token。 2.回到登录页。
            window.sessionStorage.clear();
            this.$router.push('/login');
          },
        //获取菜单数据
          async getmenulist(){
           const {data:res} = await this.$http.get('menus');
           if(res.meta.status !== 200){return this.$message.error('菜单获取错误')}
           this.menuList = res.data;
           console.log(this.menuList);
          },
        //点击按钮切换菜单的折叠与展开
        toggleCollpase(){
         this.isCollpase = !this.isCollpase;
        },
        saveNavState(activepath){
        window.sessionStorage.setItem('activepath',activepath);
          this.activepath = activepath;
        }
      }
    }
</script>

<style lang="less" scoped>
  .home-container{
    height: 100%;
  }
.el-header{
  background: #373d41;
  display: flex;
  padding-left:0;
  align-items: center;
  justify-content: space-between;
  font-size: 20px;
  color: white;
  >div{
    display: flex;
    align-items: center;
    span{margin-left: 15px}
  }
  img{
    width: 50px;
    height: 50px;
  }
}
  .el-aside{
    background: #333744;
    .el-menu{
      border-right: none;
    }
    .toggleButton{
      background: #4A5064;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      text-align: center;
      letter-spacing: 0.2em;
      cursor: pointer;
    }
  }
  .el-main{
    background: #EAEDF1;
  }
</style>
