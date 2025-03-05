
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ["20719278-0089-482a-bb22-47ce16dd4b7d-00-391dfl6r97mcq.sisko.replit.dev", "all"]
  }
})
