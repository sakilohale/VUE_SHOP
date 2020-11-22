<template>
  <div style="width: 1000px;height: 500px" ref="chart">
  </div>
</template>

<script>
  export default {
    name: "mychart",
    data(){
      return{
        option:{
          title: {
            text: '图表'
          },
          tooltip: {},
          xAxis:{},
          yAxis:{},
          series:[],
        }
      }
    },
    mounted() {
      this.init();
    },
    methods:{
      async init(){
        const {data:res} = await this.$http.get('reports/type/1');
        this.option.xAxis = res.data.xAxis;
        this.option.yAxis = res.data.yAxis;
        this.option.series = res.data.series;
        console.log(this.option)
        var myChart = this.$echarts.init(this.$refs.chart);
        myChart.setOption(this.option);
      }
    }
  }
</script>

<style scoped>

</style>
