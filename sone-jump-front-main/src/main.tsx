import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { redirectToCanonicalHost } from './utils/canonical-host'

// Antes de montar a aplicação: quem chegou pelo `www` vai para o endereço oficial.
// Montar primeiro só faria a pessoa ver uma tela que seria descartada em seguida —
// e, pior, disparar chamadas à API de uma origem que o CORS recusa.
if (!redirectToCanonicalHost(window.location)) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
