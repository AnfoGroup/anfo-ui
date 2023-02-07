<template>
  <div class="resize-container">
    <iframe ref="iframe" frameborder="0"></iframe>
    <slot v-bind="{width: lWidth, height: lHeight}"></slot>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue"

let defineProps = defineProps({
  width: Number,
  height: Number,
})
let emit = defineEmits(['update:width', 'update:height', 'resize'])

let lWidth = ref(0)
let lHeight = ref(0)

watch(lWidth, val=>emit('update:width', val))
watch(lHeight, val=>emit('update:height', val))

let iframe = ref(null)
onMounted(()=>{
  if(iframe.value){
    let contentWindow = iframe.value.contentWindow
    let emitResize = ()=>{
      lWidth.value = contentWindow.innerWidth
      lHeight.value = contentWindow.innerHeight
      emit('resize', {width: lWidth.value, height: lHeight.value})
    }
    requestAnimationFrame(emitResize)
    contentWindow.addEventListener('resize', e=>{
      emitResize()
    })
  }
})
</script>

<style lang="scss" scoped>
.resize-container{
  position: relative;
  // width: 100%;
  // height: 100%;
}

iframe{
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: -1,
}
</style>