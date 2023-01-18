import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    setupFiles: ["src/vitest.setup.ts"],
    environment: "jsdom",
    include: ["src/**/**.{test,spec}.{tsx,ts}"],
  },
  plugins: [react()],
});
