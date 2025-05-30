<template>
  <div class="project-container">
    <!-- Background gradient overlay -->
    <div class="background-gradient"></div>
      <!-- Main content -->
    <div class="project-content">
      <!-- Centralized search section -->
      <div class="project-search-section">        <div class="search-container">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Buscar projetos..."
            class="search-input"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
          />
          <div v-if="searchQuery" class="clear-search" @click="clearSearch" title="Limpar busca">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <div class="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </div>
        </div>        <div v-if="showSearchResults && filteredProjects.length > 0" class="project-list-container">
          <div 
            v-for="project in filteredProjects" 
            :key="project.termos"
            :class="['project-item', { 'selected': selectedProject?.termos === project.termos }]"
            @click="selectProject(project)"
          >
            <div class="project-item-title">{{ project.nome }}</div>
            <div class="project-item-subtitle">{{ project.osc }}</div>
          </div>
        </div>
        
        <div v-if="showSearchResults && searchQuery.trim() && filteredProjects.length === 0" class="project-list-container">
          <div class="no-results">
            Nenhum projeto encontrado para "{{ searchQuery }}"
          </div>
        </div>
      </div>      <!-- Project information distributed layout -->
      <div v-if="selectedProject" class="project-info-layout">        <!-- Header com título -->
        <div class="project-header">
          <div class="project-header-content">
            <h1 class="project-title">{{ selectedProject.nome }}</h1>
          </div>
        </div>

        <!-- Conteúdo principal -->
        <div class="project-main-content">          <!-- Cards de informações à esquerda -->
          <div class="project-info-cards">            <!-- Card Administrativo -->
            <div class="info-card administrative-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21h18"/>
                    <path d="M5 21V7l8-4v18"/>
                    <path d="M19 21V11l-6-4"/>
                    <path d="M9 9v.01"/>
                    <path d="M9 12v.01"/>
                    <path d="M9 15v.01"/>
                    <path d="M9 18v.01"/>
                  </svg>
                </div>
                <h3 class="card-title">Informações Administrativas</h3>
              </div>
              <div class="card-content">
                <div class="info-item">
                  <span class="info-label">Categoria</span>
                  <span class="info-value">{{ selectedProject.categoria }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">OSC</span>
                  <span class="info-value">{{ selectedProject.osc }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Unidade Gestora</span>
                  <span class="info-value">{{ selectedProject.unidadeGestora }}</span>
                </div>
              </div>
            </div>            <!-- Card Financeiro -->
            <div class="info-card financial-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h3 class="card-title">Informações Financeiras</h3>
              </div><div class="card-content">
                <div class="info-item">
                  <span class="info-label">Verba</span>
                  <span class="info-value financial-value">{{ formatCurrency(selectedProject.verba) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Origem do Recurso</span>
                  <span class="info-value">{{ selectedProject.origemRecurso }}</span>
                </div>
              </div>
            </div>            <!-- Card de Período -->
            <div class="info-card timeline-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h3 class="card-title">Cronograma</h3>
              </div>
              <div class="card-content">
                <div class="timeline-item">
                  <div class="timeline-point start"></div>
                  <div class="timeline-content">
                    <span class="timeline-label">Início</span>
                    <span class="timeline-date">{{ formatDate(selectedProject.inicio) }}</span>
                  </div>
                </div>
                <div class="timeline-connector"></div>
                <div class="timeline-item">
                  <div class="timeline-point end"></div>
                  <div class="timeline-content">
                    <span class="timeline-label">Término</span>
                    <span class="timeline-date">{{ formatDate(selectedProject.termino) }}</span>
                  </div>
                </div>
              </div>
            </div>            <!-- Card de Localização -->
            <div class="info-card location-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3 class="card-title">Endereço</h3>
              </div>              <div class="card-content">
                <div class="info-item" v-if="selectedProject.enderecos && selectedProject.enderecos.length === 1">
                  <span class="info-label">Endereço</span>
                  <span class="info-value">{{ selectedProject.enderecos[0].endereco }}</span>
                </div>                <div v-else-if="selectedProject.enderecos && selectedProject.enderecos.length > 1">
                  <div class="address-list-container">
                    <div class="address-list">
                      <div v-for="(endereco, index) in selectedProject.enderecos" :key="index" class="address-item">
                        <span class="address-number">{{ index + 1 }}</span>
                        <span class="address-text">{{ endereco.endereco }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>            <!-- Card de Detalhes Técnicos -->
            <div class="info-card technical-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                </div>
                <h3 class="card-title">Detalhes Técnicos</h3>
              </div>              <div class="card-content">
                <div class="info-item">
                  <span class="info-label">Termo</span>
                  <span class="info-value technical-id">{{ selectedProject.termos }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Celebração</span>
                  <span class="info-value technical-id">{{ selectedProject.celebracao }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Pagamento</span>
                  <span class="info-value technical-id">{{ selectedProject.pagamento }}</span>
                </div>
              </div>
            </div>
          </div>          <!-- Galeria de imagens modernizada à direita -->
          <div class="project-gallery">
            <div class="gallery-viewport">
              <div class="gallery-images" :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
                <div class="gallery-image" v-for="(image, index) in sampleImages" :key="index">
                  <img :src="image.url" :alt="image.alt" />
                  <div class="image-overlay">
                    <div class="image-caption">{{ image.alt }}</div>
                  </div>
                </div>
              </div>
              <!-- Indicadores estilo LinkedIn -->
              <div class="gallery-indicators">
                <div 
                  v-for="(_, index) in sampleImages" 
                  :key="index"
                  :class="['indicator-dot', { 'active': currentImageIndex === index }]"
                  @click="currentImageIndex = index"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div><div v-else class="select-project-message">
        Busque por um projeto ou selecione no mapa para ver mais detalhes.
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import parceriasData from '../assets/parcerias.json'
import { useNavigation } from '../composables/useNavigation'

interface Endereco {
  coords: {
    lat: number
    lng: number
  }
  endereco: string
}

interface Project {
  termos: string
  celebracao: string
  pagamento: string
  inicio: string
  termino: string
  osc: string
  nome: string
  enderecos: Endereco[]
  verba: number
  origemRecurso: string
  unidadeGestora: string
  categoria: string
}

const searchQuery = ref('')
const selectedProject = ref<Project | null>(null)
const projects = ref<Project[]>([])
const filteredProjects = ref<Project[]>([])
const showSearchResults = ref(false)
const currentImageIndex = ref(0)
const searchTimeout = ref<number | null>(null)

const { getSelectedProjectForNavigation, clearSelectedProjectForNavigation } = useNavigation()

const sampleImages = ref([
    { url: 'https://tudoimoveis.com/wp-content/uploads/2021/06/projetos-tudo-imoveis.jpg', alt: '1' },
    { url: 'https://ortogonalprojetos.com.br/wp-content/uploads/2016/01/Program-Management-01.jpg', alt: '2' },
    { url: 'https://propertymanagement.com.br/wp-content/uploads/sites/2/2022/10/18-10-Imagem-destacada.png', alt: '3' },
    { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6MMGkjgeIuoAkLOIM55JAHXwzvx9ttHY5RA&s', alt: '4' },

])

const filterProjects = () => {
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Add debounce for better performance
  searchTimeout.value = setTimeout(() => {
    const query = searchQuery.value.toLowerCase().trim()
    
    if (!query) {
      // Se não há busca, limpa completamente os resultados
      filteredProjects.value = []
    } else {
      // Filtra projetos APENAS pelo nome do projeto
      filteredProjects.value = projects.value.filter(project => {
        return project.nome.toLowerCase().includes(query)
      })
    }
  }, 250) // Reduzido para 250ms para melhor responsividade
}

const selectProject = (project: Project) => {
  selectedProject.value = project
  showSearchResults.value = false
  searchQuery.value = ''
  filteredProjects.value = []
  
  // Clear any pending timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
}

const handleSearchBlur = () => {
  // Use setTimeout to allow click events on project items to fire first
  setTimeout(() => {
    showSearchResults.value = false
    // Se não há texto de busca, limpa os resultados filtrados
    if (!searchQuery.value.trim()) {
      filteredProjects.value = []
    }
  }, 200)
}

const handleSearchFocus = () => {
  showSearchResults.value = true
  // Trigger filtering based on current search query
  filterProjects()
}

const clearSearch = () => {
  searchQuery.value = ''
  filteredProjects.value = []
  showSearchResults.value = false
  selectedProject.value = null
  
  // Clear any pending timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

onMounted(() => {
  projects.value = [...parceriasData]
  // Não inicializa filteredProjects - será preenchido apenas durante a busca
  
  // Check if there's a project selected for navigation
  const selectedForNavigation = getSelectedProjectForNavigation()
  if (selectedForNavigation) {
    selectedProject.value = selectedForNavigation
    clearSelectedProjectForNavigation()
  }
  
  // Auto-rotate images every 4 seconds
  setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % sampleImages.value.length
  }, 4000)
})

// Watch for changes in selected project for navigation
watch(
  () => getSelectedProjectForNavigation(),
  (newSelectedProject) => {
    if (newSelectedProject) {
      selectedProject.value = newSelectedProject
      clearSelectedProjectForNavigation()
    }
  }
)

// Watch for changes in search query to trigger filtering
watch(searchQuery, () => {
  // Sempre executa a filtragem quando o searchQuery muda
  filterProjects()
}, { immediate: false })

// Cleanup on unmount
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<style scoped>
.project-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
  color: #ffffff;
  font-family: "Roboto", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
  font-variation-settings: "wdth" 100;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
    background: linear-gradient(135deg, rgba(15, 32, 56, 1) 0%, rgba(5, 20, 40, 1) 50%, rgba(0, 10, 25, 1) 100%);
    backdrop-filter: blur(10px);
    color: #ffffff;
}


.project-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  height: 95vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
  gap: 1rem;
  color: white;
  overflow: hidden;
}

.project-search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  position: relative;
  margin-bottom: 0.5rem;
  margin-top: 2rem;
  flex-shrink: 0;
}

.search-container {
  position: relative;
  margin-bottom: 0.5rem;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.95rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.search-icon {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s ease;
}

.clear-search {
  position: absolute;
  right: 3.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px;
  border-radius: 50%;
}

.clear-search:hover {
  color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.1);
}

.project-list-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background: rgba(15, 32, 56, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  max-height: 40vh;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
}

.project-item {
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border-left: 3px solid transparent;
}

.project-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  border-left-color: rgba(255, 255, 255, 0.5);
  padding-left: 1.2rem;
}

.project-item.selected {
  background: rgba(70, 130, 180, 0.3);
  border-color: rgba(70, 130, 180, 0.6);
  border-left-color: rgba(70, 130, 180, 0.8);
}

.project-item-title {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.1rem;
  line-height: 1.3;
}

.project-item-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  margin-bottom: 0;
}

.project-item-category {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.no-results {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  padding: 2rem;
}

/* Project information distributed layout */
.project-info-layout {
  display: flex;
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  margin-top: 1rem;
  flex-grow: 1;
  align-items: flex-start;
}

.project-info-left {
  flex: 1;
  min-width: 0;
}

.project-info-right {
  flex: 1;
  min-width: 0;
}

.project-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 0.5rem;
}

.info-container {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-label {
  font-weight: 500;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-weight: 300;
  font-size: 0.9rem;
  color: #ffffff;
  line-height: 1.3;
  word-wrap: break-word;
}

.images-container {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.image.active {
  opacity: 1;
}

.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.image-indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.2);
}

.indicator:hover {  background: rgba(255, 255, 255, 0.8);
}

.detail-item {
  line-height: 1.6;
  font-size: 0.95rem;
}

.detail-item strong {
  color: #e0e0e0;
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.project-description {
  margin-top: 0.5rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
}

.select-project-message {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  font-weight: 300;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  margin: 0 auto;
  flex-grow: 1;
  box-sizing: border-box;
}

/* Scrollbar styling */
.project-list-container::-webkit-scrollbar,
.project-details::-webkit-scrollbar {
  width: 8px;
}

.project-list-container::-webkit-scrollbar-track,
.project-details::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.project-list-container::-webkit-scrollbar-thumb,
.project-details::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.project-list-container::-webkit-scrollbar-thumb:hover,
.project-details::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Modern Layout Styles */
.project-info-layout {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0 auto;
  flex: 1;
  overflow: hidden;
}

.project-header {
  width: 100%;
  text-align: center;
  box-sizing: border-box;
  flex-shrink: 0;
}

.project-header-content {
  max-width: 800px;
  margin: 0 auto;
}

.project-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0.2rem 0;
  color: #ffffff;text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  border: none;
  padding: 0;
}

.project-main-content {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
  box-sizing: border-box;
  max-width: 100%;
  flex: 1;
  overflow: hidden;
}

.project-info-cards {
  display: grid;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  overflow-y: hidden;
  max-height: 100%;
}

.info-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  max-height: 160px;
  padding: 0.6rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.card-icon {
  font-size: 1rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
}

.card-icon svg {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Administrative card - horizontal layout in 3 columns */
.administrative-card .card-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.administrative-card .info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 0;
  gap: 0.3rem;
  min-height: auto;
}

.administrative-card .info-item:last-child {
  border-bottom: none;
}

/* Financial card - horizontal layout in pairs */
.financial-card .card-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.financial-card .info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 0;
  gap: 0.3rem;
  min-height: auto;
}

.financial-card .info-item:last-child {
  border-bottom: none;
}

/* Location card - single item layout */
.location-card .card-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.location-card .info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 0;
  gap: 0.3rem;
  min-height: auto;
}

.location-card .info-item:last-child {
  border-bottom: none;
}

/* Default info-item for technical card */
.info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.rem 0;
  gap: 0.3rem;
  min-height: auto;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
  flex-shrink: 0;
  min-width: fit-content;
}

.info-value {
  font-weight: 400;
  font-size: 0.75rem;
  color: #ffffff;
  text-align: right;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
  flex: 1;
}

.financial-value {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.8rem;
}

.technical-id {
  font-family: 'Courier New', monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  width: 360px;
  text-align: center;
  display: inline-block;
  flex: none !important;
  word-break: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Timeline specific styles - Horizontal compact layout */
.timeline-card .card-content {
  gap: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0;
  flex: 1;
}

.timeline-item:first-child {
  justify-content: flex-start;
}

.timeline-item:last-child {
  justify-content: flex-end;
}

.timeline-point {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  flex-shrink: 0;
}

.timeline-point.start {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border-color: #4ade80;
}

.timeline-point.end {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-color: #f97316;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
}

.timeline-item:last-child .timeline-content {
  align-items: flex-end;
}

.timeline-label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.7rem;
  line-height: 1.2;
}

.timeline-date {
  font-weight: 400;
  color: #ffffff;
  font-size: 0.7rem;
  line-height: 1.2;
}

.timeline-connector {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #4ade80, #f97316);
  border-radius: 1px;
  flex-shrink: 0;
  margin: 0 0.5rem;
}

/* Gallery styles */
.project-gallery {
  width: 100%;
  height: fit-content;
  box-sizing: border-box;
  max-height: 100%;
  overflow: hidden;
}

.gallery-viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  border-radius: 12px;
}

.gallery-images {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease-in-out;
}

.gallery-image {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
}

.gallery-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.gallery-image:hover .image-overlay {
  transform: translateY(0);
}

.image-caption {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Gallery indicators */
.gallery-indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.indicator-dot.active {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.3);
}

/* Address List Styles */
.address-list-container {
  max-height: 100px;
  overflow-y: auto;
  margin-top: 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.address-list-container::-webkit-scrollbar {
  width: 4px;
}

.address-list-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.address-list-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.address-list-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.address-list {
  padding: 0.5rem;
}

.address-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  line-height: 1.4;
}

.address-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.address-number {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  min-width: 1.2rem;
  flex-shrink: 0;
}

.address-text {
  color: #ffffff;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

</style>
