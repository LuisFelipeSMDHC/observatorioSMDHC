<template>
    <div class="fixed-background"></div>
    <div class="page-container">
        <section class="page">
            <Home />
        </section>
        <section class="page map-page">
            <Map />
        </section>
        <section class="page project-page">
            <Project />
        </section>
        <section class="page footer-page">
            <Footer :currentPage="currentPage" />
        </section>
    </div>
</template>


<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import Map from './components/Map.vue'
import Home from './components/Home.vue'
import Footer from './components/Footer.vue'
import Project from './components/Project.vue'
import { useNavigation } from './composables/useNavigation'

const { currentPage, setCurrentPage, scrollToPage, isScrollingGlobal } = useNavigation()
let lastWheelTime = 0
const wheelThreshold = 10 
const wheelCooldown = 50
let isScrollBlocked = false
const scrollBlockTimeout = 300 // Timeout de 300ms após uma mudança de página

// Function to check if the element or any of its parents is scrollable
const isScrollableArea = (element: HTMLElement | null): boolean => {
    if (!element || element === document.body) return false
    
    const style = window.getComputedStyle(element)
    const hasScroll = ['auto', 'scroll'].includes(style.overflowY) || 
                       ['auto', 'scroll'].includes(style.overflow)
    
    // Check if the element has actual scroll capability
    const hasScrollHeight = element.scrollHeight > element.clientHeight
    
    if (hasScroll && hasScrollHeight) return true
    
    // Check parent elements recursively
    return isScrollableArea(element.parentElement)
}

const onWheel = (event: WheelEvent) => {
    if (isScrollingGlobal.value || isScrollBlocked) return
    
    const now = performance.now()
    if (now - lastWheelTime < wheelCooldown) return
    
    if (Math.abs(event.deltaY) < wheelThreshold) return
    
    // Check if cursor is over a scrollable element
    const target = event.target as HTMLElement
    if (isScrollableArea(target)) return
    
    event.preventDefault()
    lastWheelTime = now

    // Block further scroll events temporarily
    isScrollBlocked = true
    setTimeout(() => {
        isScrollBlocked = false
    }, scrollBlockTimeout)

    if (event.deltaY > 0 && currentPage.value < 3) {
        setCurrentPage(currentPage.value + 1)
        scrollToPage(currentPage.value)
    } else if (event.deltaY < 0 && currentPage.value > 0) {
        setCurrentPage(currentPage.value - 1)
        scrollToPage(currentPage.value)
    }
}

onMounted(() => {
    window.addEventListener('wheel', onWheel, { passive: false })
    
    scrollToPage(currentPage.value)
})

onUnmounted(() => {
    window.removeEventListener('wheel', onWheel)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.fixed-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/src/assets/background.jpg') no-repeat center center;
  background-size: cover;
  z-index: 0;
}

.page-container {
    height: 400vh;
    width: 100%;
    position: relative;
    z-index: 1;
}

.page {
    width: 100%;
    height: 100vh;
    position: relative;
}
</style>
