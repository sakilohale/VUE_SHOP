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
    <!--提示-->
    <el-alert
      title="消息提示的文案"
      type="info"
      center
      show-icon
      :closable="false">
    </el-alert>

    <!--步骤条  activeIndex - 0 字符串和数字相加减，结果为数字-->
    <el-steps :active="activeIndex - 0" :space="200" finish-status="success" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>

    <el-form :model="addgoodslist" :rules="addFormRules" ref="addGoodsFormRef" label-width="100px" label-position="top">
    <el-tabs tab-position="left" v-model="activeIndex"  :before-leave="beforeLeave" @tab-click="tabClick">
      <el-tab-pane label="基本信息" nama="0">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="addgoodslist.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="addgoodslist.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="addgoodslist.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="addgoodslist.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_cat">
          <el-cascader
            v-model="addgoodslist.goods_cat"
            :options="catelist"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品参数" name="1">
        <el-form-item :label="item.attr_name" v-for="item in manyTableDate" :key="item.attr_id">
          <el-checkbox-group v-model="item.attr_vals">
            <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品属性" nama="2">
        <el-form-item :label="item.attr_name" v-for="item in onlyTableDate" :key="item.attr_id">
         <el-input v-model="item.attr_vals"></el-input>
        </el-form-item>
      </el-tab-pane>
      <el-tab-pane label="商品图片" nama="3">
        <!--action表示图片要上传到的api地址-->
        <el-upload
          class="upload-demo"
          action="http://127.0.0.1:8888/api/private/v1/upload"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :headers="headerObj"
          list-type="picture">
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-tab-pane>
      <el-tab-pane label="商品内容" nama="4">
        <!--富文本编辑器-->
        <quill-editor
          class="quillEditor"
          v-model="addgoodslist.goods_introduce"
        />

        <el-button type="primary" style="margin-top: 15px" @click="add">添加商品</el-button>
      </el-tab-pane>
    </el-tabs>
    </el-form>


  </el-card>


<!--图片预览对话框-->

    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" style="width: 100%"/>
    </el-dialog>

  </div>


</template>

<script>
  import _ from 'lodash';
    export default {
        name: "addGoods",
      data(){
          return{
            parentList:[],
            //指定级联选择器的配置对象
            cascaderProps:{
              value:'cat_id',
              label:'cat_name',
              children:'children'
            },
            //选中的父级分类的ID数组
            selectKey:[],

            activeIndex:'0',
            catelist:[],
            addgoodslist:{
              goods_name:'',
              goods_cat:[],
              goods_price:'',
              goods_number:'',
              goods_weight:'',
              goods_introduce:'',
              pics:[],
              attrs:[],
            },
            addFormRules:{
              goods_name:[{required:true,message:'请填写商品名称',trigger:'blur'}],
              goods_cat:[{required:true,message:'请选择商品分类',trigger:'blur'}],
              goods_price:[{required:true,message:'请填写商品价格',trigger:'blur'}],
              goods_number:[{required:true,message:'请填写商品数量',trigger:'blur'}],
              goods_weight:[{required:true,message:'请填写商品重量',trigger:'blur'}],
            },
            addDialogVisible:false,
            manyTableDate:[],
            onlyTableDate:[],

            //图片上传组件的headers请求头对象
            headerObj:{
              Authorization:window.sessionStorage.getItem('token')
            },
            //预览图片地址
            previewPath:'',
            previewVisible:false,
          }
      },
      created() {
       this.getCateList();
      },
      methods:{

        async getCateList(){
          const {data:res} = await this.$http.get('categories');
          if(res.meta.status !== 200){
            return this.$message.error("获取商品列表数据失败");
          }
          this.catelist = res.data;
          this.total = res.total;
          console.log(res.data);
          this.$message.success('获取商品数据成功');
        },

        handleChange(){
          if (this.addgoodslist.goods_cat.length !==3){
            this.addgoodslist.goods_cat = [];
          };
          console.log(this.addgoodslist.goods_cat);
        },

        beforeLeave(activeNmae,oldActiveName){
          if (oldActiveName === '0' && this.addgoodslist.goods_cat.length !== 3){
            this.$message.error('请选择商品分类再进行下一步！！')
            return false;
          }
        },

        async tabClick(){
          //动态参数
          if (this.activeIndex === '1'){
         const {data:res} = await this.$http.get(`categories/${this.cateID-0}/attributes`, {params: {sel:'many'}});
         if(res.meta.status!==200){
           console.log(res);
           return this.$message.error('获取动态参数失败。');
         }
         res.data.forEach(item=>{
          item.attr_vals = item.attr_vals.length === 0 ? [] :item.attr_vals.split(',')
         })
         this.manyTableDate = res.data;
         console.log(res.data)
          };


          //静态属性
          if(this.activeIndex==='2'){
            const {data:res} = await this.$http.get(`categories/${this.cateID-0}/attributes`, {params: {sel:'only'}});
            if(res.meta.status!==200){
              console.log(res);
              return this.$message.error('获取静态属性失败。');
            }
            this.onlyTableDate = res.data;
            console.log(this.onlyTableDate);
          }

        },

        //处理图片预览效果
        handlePreview(file){
          this.previewPath = file.response.data.url;
          this.previewVisible = true;
        },
        //处理移除图片的操作
        handleRemove(file){
          const filepath = file.response.data.tmp_path;
          var index;
          this.addgoodslist.pics.forEach((item,i)=> {
           if(item.tmp_path==filepath){
             index = i;
           }
          })
          this.addgoodslist.pics.splice(index,1);
          console.log(this.addgoodslist);
        },
        //处理图片上传成功的事件
        handleSuccess(response){
          //1. 拼接得到一个图片信息对象
          //2. 将图片信息对象 push到pics数组中
          const pitInfo = {'pic':response.data.tmp_path};
          this.addgoodslist.pics.push(pitInfo);
          console.log(this.addgoodslist)
        },
        add(){
         this.$refs.addGoodsFormRef.validate(async valid=>{
           if (!valid){
             return this.$message.error("请填写必要的表单项");
           }
           //数据再处理
           //进行addgoodslist 的深拷贝！
           //lodash包的 cloneDeep(obj)方法
           var form = _.cloneDeep(this.addgoodslist);
           this.manyTableDate.forEach(item=>{
             const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals.join('')};
             form.attrs.push(newInfo);
           });
           this.onlyTableDate.forEach(item=>{
             const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals};
             form.attrs.push(newInfo);
           })

           form.goods_cat = form.goods_cat.join(',');
           console.log(form);

           const {data:res} = await this.$http.post(`goods`,form);
           if(res.meta.status !== 201){
             console.log(res)
             return this.$message.error("上传失败");
           };
           this.$message.success("上传成功");
           this.$router.push('/goods')
         })
        }

      },


      computed:{
        cateID(){
          if(this.addgoodslist.goods_cat.length === 3){
            return this.addgoodslist.goods_cat[2];
          }
          return null;
        },
      },


    }
</script>

<style scoped>
.el-checkbox{
  margin: 0 5px 0 0 !important;
}


</style>
