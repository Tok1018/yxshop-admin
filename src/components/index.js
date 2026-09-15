import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GaugeChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  GraphicComponent
} from 'echarts/components'
import { defineAsyncComponent } from 'vue'

const MaWangEditor = defineAsyncComponent(() => import('./ma-wangEditor/index.vue'))
const MaCodeEditor = defineAsyncComponent(() => import('./ma-codeEditor/index.vue'))

import MaColorPicker from './ma-colorPicker/index.vue'
import MaCityLinkage from './ma-cityLinkage/index.vue'

import SaChart from './sa-chart/index.vue'
import SaCheckbox from './sa-checkbox/index.vue'
import SaRadio from './sa-radio/index.vue'
import SaSelect from './sa-select/index.vue'
import SaSwitch from './sa-switch/index.vue'
import SaTable from './sa-table/index.vue'
import SaTreeSlider from './sa-treeSlider/index.vue'
import SaResource from './sa-resource/index.vue'
import SaResourceButton from './sa-resource/button.vue'
import SaDict from './sa-dict/index.vue'
import SaUser from './sa-user/index.vue'
import SaUploadImage from './sa-upload-image/index.vue'
import SaUploadFile from './sa-upload-file/index.vue'
import SaIcon from './sa-icon/index.vue'
import SaIconPicker from './sa-icon-picker/index.vue'

import SearchFilterBar from './SearchFilterBar/index.vue'
import DataTable from './DataTable/index.vue'
import FormDrawer from './FormDrawer/index.vue'
import BatchActionBar from './BatchActionBar/index.vue'
import StatCard from './StatCard/index.vue'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  GraphicComponent
])

export default {
  install(Vue) {
    Vue.component('MaWangEditor', MaWangEditor)
    Vue.component('MaColorPicker', MaColorPicker)
    Vue.component('MaCodeEditor', MaCodeEditor)
    Vue.component('MaCityLinkage', MaCityLinkage)

    Vue.component('SaChart', SaChart)
    Vue.component('SaCheckbox', SaCheckbox)
    Vue.component('SaRadio', SaRadio)
    Vue.component('SaSelect', SaSelect)
    Vue.component('SaSwitch', SaSwitch)
    Vue.component('SaTable', SaTable)
    Vue.component('SaTreeSlider', SaTreeSlider)
    Vue.component('SaResource', SaResource)
    Vue.component('SaResourceButton', SaResourceButton)
    Vue.component('SaDict', SaDict)
    Vue.component('SaUser', SaUser)
    Vue.component('SaUploadImage', SaUploadImage)
    Vue.component('SaUploadFile', SaUploadFile)
    Vue.component('SaIcon', SaIcon)
    Vue.component('SaIconPicker', SaIconPicker)

    Vue.component('SearchFilterBar', SearchFilterBar)
    Vue.component('DataTable', DataTable)
    Vue.component('FormDrawer', FormDrawer)
    Vue.component('BatchActionBar', BatchActionBar)
    Vue.component('StatCard', StatCard)
  }
}
