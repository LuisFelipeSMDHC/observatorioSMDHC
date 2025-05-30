<template>
    <div class="header-trigger-area" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave"></div>
    <header class="header" :class="{ 'visible': isHeaderVisible }" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <div class="header-content">
            <div class="logo-container">
                <img src="../assets/logo.png" alt="Logo" class="header-logo" />
            </div>
            <div class="menu">
                <!-- Aqui pode ser adicionado um menu de navegação se necessário -->
            </div>
        </div>
    </header>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

/**
 * Configuration constants for header behavior
 */
const SCROLL_THRESHOLD = 800;

/**
 * Reactive state for header visibility and mouse interactions
 */
const showHeader = ref<boolean>(false);
const isMouseInArea = ref<boolean>(false);
const currentScrollY = ref<number>(0);

/**
 * Computed property that determines header visibility based on scroll position and mouse hover
 * @returns {boolean} Whether the header should be visible
 */
const isHeaderVisible = computed((): boolean => {
    if (currentScrollY.value <= SCROLL_THRESHOLD) {
        return false;
    }
    
    return isMouseInArea.value;
});

/**
 * Handles scroll events and updates header visibility based on scroll position
 * Shows header when scrolling past threshold and mouse is in area
 */
const checkScroll = (): void => {
    const newScrollY = window.scrollY;
    const wasAboveThreshold = currentScrollY.value > SCROLL_THRESHOLD;
    const isAboveThreshold = newScrollY > SCROLL_THRESHOLD;
    
    currentScrollY.value = newScrollY;
    
    if (!wasAboveThreshold && isAboveThreshold && isMouseInArea.value) {
        showHeader.value = true;
    }
    
    if (wasAboveThreshold && !isAboveThreshold) {
        showHeader.value = false;
    }
};

/**
 * Handles mouse enter events for header trigger area
 * Sets mouse area state to true for header visibility logic
 */
const onMouseEnter = (): void => {
    isMouseInArea.value = true;
};

/**
 * Handles mouse leave events for header trigger area
 * Sets mouse area state to false for header visibility logic
 */
const onMouseLeave = (): void => {
    isMouseInArea.value = false;
};

// Lifecycle hooks
onMounted(() => {
    currentScrollY.value = window.scrollY;
    checkScroll();
    
    window.addEventListener('scroll', checkScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', checkScroll);
});
</script>

<style scoped>
.header-trigger-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 8vh;
    z-index: 100;
}

.header {
    position: fixed;
    top: -12vh;
    left: 50%;
    transform: translateX(-50%);
    width: 101%;
    height: 8vh;
    background: 
        linear-gradient(135deg, rgba(15, 32, 56, 0.95) 0%, rgba(5, 20, 40, 0.95) 50%, rgba(0, 10, 25, 0.95) 100%),
        linear-gradient(to right, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    z-index: 99;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 4px 16px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-top: none;
    font-family: "Roboto", sans-serif;
}

.header.visible {
    top: 0;
    transform: translateX(-50%) translateY(0);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 3rem;
    position: relative;
}

.header-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.03) 50%, 
        transparent 100%);
    pointer-events: none;
}

.logo-container {
    height: 80%;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
}

.header-logo {
    height: 7vh;
    width: auto;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
    transition: all 0.3s ease;
}

.header-logo:hover {
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
    transform: scale(1.05);
}

.menu {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
}

/* Animation for smooth appearance */
@keyframes slideDown {
    from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
}

.header.visible {
    animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

</style>