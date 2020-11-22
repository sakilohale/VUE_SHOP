import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/login'
import home from '../components/home'
import welcome from "../components/welcome";
import users from "../components/user/users";
import rights from "../components/power/rights";
import roles from "../components/power/roles";
import cate from "../components/goods/cate";
import params from '../components/goods/params';
import list from "../components/goods/list";
import addGoods from "../components/goods/addGoods";
import buy from "../components/buySomething/buy";
import mychart from "../components/dataWatch/mychart"
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect:'/login'
  },

  {
    path: '/login',
    component: login,
  },
  {
    path: '/home',
    component: home,
    redirect: '/welcome',
    children:[
      {
      path:'/welcome',
      component:welcome,
    },
      {
        path: '/users',
        component: users
      },
      {
        path: '/rights',
        component: rights
      },
      {
        path: '/roles',
        component: roles
      },
      {
      path:'/categories',
        component: cate
      },
      {
        path: '/params',
        component:params
      },
      {
        path:'/goods',
        component: list,
      },
      {
        path:'/addGoods',
        component:addGoods
      },
      {
        path: '/orders',
        component: buy
      },
      {
        path: '/reports',
        component: mychart
      }]
  },

]

const router = new VueRouter({
  routes
})


//挂载路由导航守卫

router.beforeEach((to,from,next)=>{
if(to.path === '/login'){
  return next();
}

//去 浏览器的SessionStorage拿token， 可能有值可能空值
const tokenstr = window.sessionStorage.getItem('token');
if (!tokenstr){
  return next('/login');
}
next();

})



export default router
