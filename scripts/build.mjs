import { rmSync, mkdirSync, cpSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
mkdirSync('dist/src', { recursive: true });
mkdirSync('dist/calc', { recursive: true });

// Homepage (defense)
cpSync('index.html', 'dist/index.html');

// Calculator page (CA) — in its own subfolder
cpSync('calc/index.html', 'dist/calc/index.html');

// Shared assets
cpSync('src/calculator.js', 'dist/src/calculator.js');
cpSync('src/style.css', 'dist/src/style.css');
cpSync('src/ui.js', 'dist/src/ui.js');

console.log('Build complete -> dist/');
