import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// O produto trata datas no calendário de São Paulo, e há testes que dependem disso
// (sessão de estudo às 22h, mentoria noturna). A CI roda em UTC: sem fixar o fuso, os
// testes passariam na máquina de quem escreveu e falhariam lá.
process.env.TZ = 'America/Sao_Paulo'

/**
 * Configuração própria, sem herdar a do build: o build de produção não precisa saber
 * que testes existem, e importar `vite.config` aqui só traz o aviso do carregador de
 * config do Vite. O único ponto em comum é o plugin do React, necessário para o JSX.
 *
 * `environment: jsdom` porque os testes exercitam código que fala com o DOM e com o
 * `localStorage` (a guarda do token, por exemplo).
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    env: { TZ: 'America/Sao_Paulo' },
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/test/**'],
    },
  },
})
