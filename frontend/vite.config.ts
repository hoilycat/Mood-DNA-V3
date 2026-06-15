import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        // 무거운 차트 라이브러리(recharts + d3 의존성)를 별도 청크로 분리해
        // 초기 번들 크기를 줄이고 브라우저 캐싱 효율을 높인다.
        manualChunks: {
          charts: ['recharts'],
        },
      },
    },
  },
})
