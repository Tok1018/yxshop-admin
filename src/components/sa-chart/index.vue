<template>
  <div ref="chartRef" :style="{ width, height }"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  options: {
    type: Object,
    default() {
      return {}
    },
  },
  autoresize: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
})

const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption(props.options)
  }
}

const resizeChart = () => {
  if (chart) {

    chart.resize()
  }
}

watch(
  () => props.options,
  (newVal) => {
    if (chart) {
      chart.setOption(newVal)
    }
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    initChart()
    if (props.autoresize) {
      window.addEventListener('resize', resizeChart)
    }
  })
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  if (props.autoresize) {
    window.removeEventListener('resize', resizeChart)
  }
})
</script>

<style scoped lang="less"></style>
