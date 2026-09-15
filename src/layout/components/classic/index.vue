<template>
  <a-layout class="layout flex flex-row h-full">

    <ma-classic-slider class="ma-ui-slider" />

    <a-layout-content class="flex flex-col h-full" style="min-width:0">
      <ma-classic-header class="ma-ui-header flex-shrink-0" />
      <ma-worker-area class="flex-1 min-h-0" />
    </a-layout-content>

  </a-layout>
</template>

<script setup>
import { ref } from 'vue'

import MaClassicSlider from './ma-classic-slider.vue'
import MaClassicHeader from './ma-classic-header.vue'
import MaWorkerArea from '../ma-workerArea.vue'
</script>