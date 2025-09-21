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
          { src: 'sidepanel/index.html', dest: 'dist/sidepanel' },
          { src: 'sidepanel/index.css', dest: 'dist/sidepanel' },
          
          // Copy styles
          { src: 'styles', dest: 'dist' },
          
          // Copy content scripts and platform adapters
          { src: 'content-scripts/grammar-overlay.js', dest: 'dist/content-scripts' },
          { src: 'content-scripts/platform-adapters', dest: 'dist/content-scripts' },
          
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
  // Content scripts - IIFE format (content scripts can't use ES modules)
  {
    input: 'content-scripts/universal-integration.js',
    output: {
      file: 'dist/content-scripts/universal-integration.js',
      format: 'iife',
      name: 'IntelliPenUniversalIntegration'
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
  // Grammar overlay - IIFE format
  {
    input: 'content-scripts/grammar-overlay.js',
    output: {
      file: 'dist/content-scripts/grammar-overlay.js',
      format: 'iife',
      name: 'IntelliPenGrammarOverlay'
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