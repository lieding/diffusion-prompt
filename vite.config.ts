import react from "@vitejs/plugin-react";
import { resolve } from 'path';
import { defineConfig } from "vite";

export default defineConfig((configEnv) => {
	const isDevelopment = configEnv.mode === "development";

	return {
		plugins: [react()],
		server: {
			// open: './src/index.html',
		},
		css: {
			modules: {
				generateScopedName: isDevelopment ? "[name]__[local]__[hash:base64:5]" : "[hash:base64:5]",
			},
		},
		build: {
			modulePreload: false,
			cssCodeSplit: true,
			rollupOptions: {
				input: {
					index: resolve(__dirname, 'src/index.html'),
					promptGeneration: resolve(__dirname, 'src/PromptGeneration/promptGeneration.html'),
				}
			}
		}
	};
});