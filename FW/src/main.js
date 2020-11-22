import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid';
//导入富文本组件及其样式
import VueQuillEditor from "vue-quill-editor/src";
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//导入echarts
import echarts from 'echarts';

//导入进度条优化
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.config.productionTip = false
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//
axios.interceptors.request.use(config=>{
  // 再request拦截器种，展示进度条
   NProgress.start();
   config.headers.Authorization = window.sessionStorage.getItem('token');
   // 最后必须return config
   return config;
});

axios.interceptors.response.use(config=>{
  NProgress.done();
  return config
})

Vue.prototype.$http = axios
Vue.prototype.$echarts = echarts;

Vue.component('tree-table',TreeTable);

Vue.use(VueQuillEditor);




new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
