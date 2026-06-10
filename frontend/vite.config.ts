import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const BACKEND_RENDER_URL = "https://awaam-assist.onrender.com";
const PYTHON_AI_RENDER_URL = "https://awaam-assist-ai.onrender.com";

const resolveDeploymentUrl = (value: string | undefined, fallback: string, mode: string) => {
  const trimmed = value?.trim().replace(/\/+$/, "") || "";
  if (!trimmed) return fallback;

  const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(trimmed);
  const isOldBackendIp = /^https?:\/\/98\.70\.247\.91:5000/i.test(trimmed);

  if (mode === "production" && (isLocalhost || isOldBackendIp)) {
    return fallback;
  }

  return trimmed;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = resolveDeploymentUrl(env.VITE_API_URL, BACKEND_RENDER_URL, mode);
  const aiUrl = resolveDeploymentUrl(env.VITE_AI_URL, PYTHON_AI_RENDER_URL, mode);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
      "import.meta.env.VITE_AI_URL": JSON.stringify(aiUrl),
    },
  };
});
