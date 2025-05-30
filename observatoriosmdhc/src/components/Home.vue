<template>
  <div class="home-container">
    <!-- Background gradient overlay -->
    <div class="background-gradient"></div>
    
    <!-- Logo section -->
    <div class="logo"></div>
    
    <!-- Main content frame -->
    <div class="frame">
      <div class="titletxt">OBSERVATORIO DE PARCERIAS</div>
      <div class="herotxt">
        Explore as parcerias entre a Prefeitura de São Paulo e Organizações da Sociedade Civil que impulsionam a transformação social na cidade. Em nosso mapa interativo, conheça projetos que promovem inclusão, justiça social e oportunidades para todos. Descubra iniciativas que constroem uma cidade mais justa e solidária!
      </div>
    </div>
    
    <!-- Scroll indicator -->
    <div class="scroll-indicator">
      <div class="scroll-arrow"></div>
      <div class="scroll-text">desça para acessar o mapa</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';

/**
 * Home component - Landing page with hero section and logo
 * Displays the main title, description, and scroll indicator
 */
defineComponent({
  name: 'Home'
});
</script>

<style>
.home-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
    background: linear-gradient(135deg, rgba(15, 32, 56, 0.7) 0%, rgba(5, 20, 40, 0.6) 50%, rgba(0, 10, 25, 0.8) 100%);

  z-index: -9999999;
}
.logo {
  position: absolute;
  left: 25%; /* Centralizado na metade esquerda (50% de 50%) */
  top: 50%;
  transform: translate(-50%, -50%);
  width: 570px;
  height: 570px;
  background: url('/src/assets/logo.png') no-repeat center center;
  background-size: contain;
  opacity: 0.95;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  animation: slideInLeft 0.8s ease-out;
}

.frame {
  position: absolute;
  left: 75%; /* Centralizado na metade direita (50% + 50% de 50%) */
  top: 50%;
  transform: translate(-50%, -50%); /* Centraliza completamente */
  width: 750px;
  max-width: 48vw;
  padding: 40px;
}

.titletxt {
    margin-bottom: 32px;
    font-family: "Roboto", sans-serif;
    font-weight: 800;
    font-size: clamp(42px, 5vw, 58px);
    line-height: 1.1;
    letter-spacing: 1.5px;
    color: #ffffff;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    animation: slideInRight 0.8s ease-out;
  }

  .herotxt {
    font-family: "Roboto", sans-serif;
    font-weight: 300;
    font-size: clamp(18px, 2.2vw, 26px);
    line-height: 1.6;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.92);
    text-align: left;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    animation: slideInRight 0.8s ease-out 0.2s both;
  }

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

.scroll-indicator:hover {
  color: #ffffff;
  transform: translateX(-50%) translateY(-5px);
}

.scroll-arrow {
  width: 16px;
  height: 16px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.scroll-text {
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}


@keyframes float {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-8px);
  }
}
</style>