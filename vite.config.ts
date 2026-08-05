import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  const coreTarget = env.VITE_DEV_PROXY_CORE_TARGET ?? "http://localhost:3600"
  const beneficiariesTarget = env.VITE_DEV_PROXY_BENEFICIARIES_TARGET ?? "http://localhost:3601"
  const analyticsTarget = env.VITE_DEV_PROXY_ANALYTICS_TARGET ?? "http://localhost:3602"
  const realtimeTarget = env.VITE_DEV_PROXY_REALTIME_TARGET ?? "http://localhost:3603"

  return {
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      allowedHosts: true,
      proxy: {
        "/api/core": {
          target: coreTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/core/, "/api/v2"),
        },
        "/api/beneficiaries": {
          target: beneficiariesTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/beneficiaries/, "/api/v2"),
        },
        "/api/analytics": {
          target: analyticsTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/analytics/, "/api/v2"),
        },
        "/api/realtime": {
          target: realtimeTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/realtime/, "/api/v2"),
        },
      },
    },
  }
})
