import { rmSync, mkdirSync, cpSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
mkdirSync('dist/src', { recursive: true });

cpSync('index.html', 'dist/index.html');
cpSync('src/calculator.js', 'dist/src/calculator.js');
cpSync('src/style.css', 'dist/src/style.css');
cpSync('src/ui.js', 'dist/src/ui.js');

console.log('Build complete -> dist/');
