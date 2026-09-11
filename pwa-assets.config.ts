import {
    defineConfig,
    minimal2023Preset as preset
} from '@vite-pwa/assets-generator/config'
  
export default defineConfig({
    headLinkOptions: {
        preset: '2023'
    },
    preset,
    images: ['public/app-icon.png'] // Path to your master SVG or high-res PNG
})