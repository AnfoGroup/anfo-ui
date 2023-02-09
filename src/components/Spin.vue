<template>
    <!-- <svg class="spin" width="1em" height="1em" aria-hidden="true" viewBox="0 0 1024 1024"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path></svg> -->
    <svg :style="{
        width: finalSize,
        height: finalSize,
    }" class="anfo-spin" viewBox="25 25 50 50">
        <circle :style="{
            stroke: color,
            strokeWidth: finalWidth,
        }" class="anfo-spin-circle" cx="50" cy="50" r="20" fill="none" />
    </svg>
</template>

<script setup>
import { computed } from "vue"

let props = defineProps({
    size: {
        type: [String, Number],
        default: 32,
    },
    color: {
        type: String,
        default: 'black',
    },
    width: {
        type: [String, Number],
        default: 3,
    }
})

function getPixelValueByProps(value, defaultValue){
    return computed(()=>{
        value = parseInt(value)
        value = isNaN(value) ? (defaultValue || 0) : value
        return `${value}px`
    })
}

let finalSize = getPixelValueByProps(props.size)
let finalWidth = getPixelValueByProps(props.width)
</script>

<style lang="scss">
.anfo-spin{
    animation: rotate 2s linear infinite;
}
.anfo-spin-circle{
    stroke-linejoin: round;
    stroke-linecap: round;
    fill: none;
    animation: dash 1.5s linear infinite;
}
@keyframes dash{
   0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 130, 200;
      stroke-dashoffset: -50;
    }
    100% {
      stroke-dasharray: 130, 200;
      stroke-dashoffset: -188;
    }
}

@keyframes rotate{
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
}
</style>