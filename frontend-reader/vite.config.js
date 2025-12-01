import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,     // 🔥 đổi cổng tại đây
    // host: true,     // (không bắt buộc) cho phép truy cập từ mạng LAN
  },
})
