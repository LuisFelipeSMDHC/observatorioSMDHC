<template>
  <div class="footer-container">
    <div class="footer-background"></div>
    <div class="footer-content">
      <!-- Logo Section -->
      <div class="footer-logo-section">
        <div class="footer-logo"></div>
        <div class="footer-title">OBSERVATÓRIO DE PARCERIAS</div>
      </div>

      <!-- Main Content -->
      <div class="footer-main">
        <!-- About Section -->
        <div class="footer-section">
          <h3 class="section-title">Sobre o Projeto</h3>
          <p class="section-text">
            O Observatório de Parcerias é uma iniciativa da SMDHC para transparência e avaliação das parcerias entre poder público e sociedade civil, visando fortalecer o controle social e melhorar políticas públicas de direitos humanos.
          </p>
        </div>

        <!-- Contact Section -->
        <div class="footer-section">
          <h3 class="section-title">Contato</h3>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-label">Email:</span>
              <span class="contact-value">smdhcdp@prefeitura.sp.gov.br</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Telefone:</span>
              <span class="contact-value">(11) 1234-5678</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Endereço:</span>
              <span class="contact-value">Rua Líbero Badaró, nº 199, 8º Andar - Centro</span>
            </div>
          </div>
        </div>        <!-- Links Section -->
        <div class="footer-section">
          <h3 class="section-title">Links Úteis</h3>
          <div class="links-list">
            <a href="https://capital.sp.gov.br/web/direitos_humanos/" class="footer-link">Site da SMDHC</a>
            <a href="http://transparencia.prefeitura.sp.gov.br/" class="footer-link">Portal da Transparência</a>
          </div>
        </div>

        <!-- Social Media Section -->
        <div class="footer-section">
          <h3 class="section-title">Redes Sociais</h3>
          <div class="social-links">
            <a href="https://www.facebook.com/DireitosHumanosECidadaniaSP/" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
            </a>
            <a href="https://www.instagram.com/direitoshumanos.sp/" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
            </a>
            <a href="https://www.youtube.com/@DireitosHumanoseCidadania" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
            </a>
            <a href="https://br.linkedin.com/company/direitoshumanos" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="copyright">
          © 2025 Prefeitura de São Paulo, SMDHC. Todos os direitos reservados.
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';

/**
 * Footer component with contact information, links, and social media
 * Displays project information, contact details, useful links, and social media connections
 */
defineComponent({
  name: 'Footer'
});
</script>

<style scoped>
.footer-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.footer-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 32, 56, 0.7) 0%, rgba(5, 20, 40, 0.6) 50%, rgba(0, 10, 25, 0.8) 100%);
  z-index: -9999;
}

.footer-content {
  width: 90%;
  max-width: 1400px;
  padding: 60px 40px;
  color: #ffffff;
  font-family: "Roboto", sans-serif;
}

.footer-logo-section {
  text-align: center;
  margin-bottom: 60px;
}

.footer-logo {
  width: 120px;
  height: 120px;
  background: url('/src/assets/logo.png') no-repeat center center;
  background-size: contain;
  margin: 0 auto 20px auto;
}

.footer-title {
  font-size: 32px;
    font-weight: 800;
    letter-spacing: 1.5px;
  margin-bottom: 10px;
  color: #ffffff;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

}

.footer-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
}

.footer-section {
  padding: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ffffff;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 10px;
}

.section-text {
  font-size: 16px;
  font-weight: 300;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  text-align: justify;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.contact-value {
  font-size: 16px;
  font-weight: 300;
  color: #ffffff;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  font-weight: 300;
  transition: all 0.3s ease;
  padding: 8px 0;
  border-left: 3px solid transparent;
  padding-left: 12px;
}

.footer-link:hover {
  color: #ffffff;
  border-left-color: rgba(255, 255, 255, 0.5);
  padding-left: 20px;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  font-weight: 300;
  transition: all 0.3s ease;
  padding: 8px 0;
  border-left: 3px solid transparent;
  padding-left: 12px;
}

.social-link:hover {
  color: #ffffff;
  border-left-color: rgba(255, 255, 255, 0.5);
  padding-left: 20px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  flex-wrap: wrap;
  gap: 20px;
}

.copyright {
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
}

</style>