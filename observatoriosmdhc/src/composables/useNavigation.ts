import { ref } from 'vue'
import type { Parceria } from '../types'

// Global state for navigation and project selection
const currentPage = ref(0)
const selectedProjectForNavigation = ref<Parceria | null>(null)
const isScrollingGlobal = ref(false)

export function useNavigation() {
  const getPageHeight = () => window.innerHeight
  const scrollToPage = (page: number) => {
    const targetScrollY = page * getPageHeight()
    const startScrollY = window.scrollY
    const duration = 1200
    const startTime = performance.now()
    
    let lastPosition = startScrollY
    isScrollingGlobal.value = true

    const animateScroll = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      let ease;
      
      if (progress < 0.7) {
        ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      } else {
        const t = (progress - 0.7) / 0.3;
        ease = 0.9 + (1 - 0.9) * (1 - Math.pow(1 - t, 4));
      }

      const newPosition = startScrollY + (targetScrollY - startScrollY) * ease;
      window.scrollTo({
        top: newPosition,
        behavior: 'auto'
      })
      
      const isStillMoving = Math.abs(newPosition - lastPosition) > 0.5;
      lastPosition = newPosition;

      if (progress < 1 && (isStillMoving || progress < 0.85)) {
        requestAnimationFrame(animateScroll)
      } else {
        window.scrollTo({
          top: targetScrollY,
          behavior: 'auto'
        });
        isScrollingGlobal.value = false;
      }
    }

    requestAnimationFrame(animateScroll)
  }

  const navigateToProject = (parceria: Parceria) => {
    // Set the project to be selected
    selectedProjectForNavigation.value = parceria
    
    // Navigate to project page (page 2)
    currentPage.value = 2
    scrollToPage(2)
  }

  const getCurrentPage = () => currentPage.value
  const setCurrentPage = (page: number) => {
    currentPage.value = page
  }

  const getSelectedProjectForNavigation = () => selectedProjectForNavigation.value
  const clearSelectedProjectForNavigation = () => {
    selectedProjectForNavigation.value = null
  }
  return {
    currentPage,
    selectedProjectForNavigation,
    isScrollingGlobal,
    scrollToPage,
    navigateToProject,
    getCurrentPage,
    setCurrentPage,
    getSelectedProjectForNavigation,
    clearSelectedProjectForNavigation
  }
}