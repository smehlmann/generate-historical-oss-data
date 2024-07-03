import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['index.js'], // Replace with the entry point of your application
  bundle: true,
  outfile: 'dist/bundle.cjs',
  platform: 'node', // Target platform is Node.js
  format: 'cjs', // Output format is CommonJS
  target: 'node20', // Specify the target Node.js version
  sourcemap: true, // Generate source maps (optional)
}).catch(() => process.exit(1));
