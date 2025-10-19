import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const isProduction = process.env.NODE_ENV === 'production';

export default [
  // Background script - ES module (service worker supports modules)
  {
    input: 'background.js',
    output: {
      file: 'dist/background.js',
      format: 'es'
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      copy({
        targets: [
          // Copy manifest and static files
          { src: 'manifest.json', dest: 'dist' },
          
          // Copy HTML and CSS files
          { src: 'popup/index.html', dest: 'dist/popup' },
          { src: 'popup/index.css', dest: 'dist/popup' },
          { src: 'popup/menu.html', dest: 'dist/popup' },
          { src: 'popup/menu.css', dest: 'dist/popup' },
          { src: 'popup/menu.js', dest: 'dist/popup' },
          { src: 'sidepanel/index.html', dest: 'dist/sidepanel' },
          { src: 'sidepanel/index.css', dest: 'dist/sidepanel' },
          
          // Copy styles
          { src: 'styles', dest: 'dist' },
          
          // Copy AI API modules
          { src: 'src/ai-apis', dest: 'dist/src' },
          { src: 'src/editor', dest: 'dist/src' },
          { src: 'src/meeting', dest: 'dist/src' },
          { src: 'src/icons', dest: 'dist/src' },
          { src: 'src/components', dest: 'dist/src' },
          
          // Copy quick translate overlay
          { src: 'content-scripts/quick-translate.js', dest: 'dist/content-scripts' },
          
          // Copy images (when they exist)
          { src: 'images', dest: 'dist', copyOnce: true },
          
          // Copy any additional assets
          { src: 'README.md', dest: 'dist', copyOnce: true }
        ],
        copyOnce: true
      }),
      // Only minify in production
      isProduction && terser({
        format: {
          comments: false
        },
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ].filter(Boolean),
    external: [
      // Chrome extension APIs are external
      'chrome'
    ],
    onwarn(warning, warn) {
      // Suppress certain warnings
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  },
  // Content script - IIFE format (content scripts can't use ES modules)
  {
    input: 'content-scripts/content-script.js',
    output: {
      file: 'dist/content-scripts/content-script.js',
      format: 'iife',
      name: 'IntelliPenContentScript'
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      // Only minify in production
      isProduction && terser({
        format: {
          comments: false
        },
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ].filter(Boolean),
    external: [
      // Chrome extension APIs are external
      'chrome'
    ],
    onwarn(warning, warn) {
      // Suppress certain warnings
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  },
  // Popup - IIFE format to avoid chunk files
  {
    input: 'popup/index.js',
    output: {
      file: 'dist/popup/index.js',
      format: 'iife',
      name: 'IntelliPenPopup'
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      // Only minify in production
      isProduction && terser({
        format: {
          comments: false
        },
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ].filter(Boolean),
    external: [
      // Chrome extension APIs are external
      'chrome'
    ],
    onwarn(warning, warn) {
      // Suppress certain warnings
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  },
  // Sidepanel - IIFE format to avoid chunk files
  {
    input: 'sidepanel/index.js',
    output: {
      file: 'dist/sidepanel/index.js',
      format: 'iife',
      name: 'IntelliPenSidepanel'
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      // Only minify in production
      isProduction && terser({
        format: {
          comments: false
        },
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ].filter(Boolean),
    external: [
      // Chrome extension APIs are external
      'chrome'
    ],
    onwarn(warning, warn) {
      // Suppress certain warnings
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  }
];