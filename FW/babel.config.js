
//这是项目发布阶段需要的babel插件
var prodPlugins = [];
//如果是在发布模式，则生效某些插件
if (process.env.NODE_ENV === 'production'){
  prodPlugins.push('transform-remove-console');
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ...prodPlugins
  ]
}
