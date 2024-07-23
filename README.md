# Command line excutable for generating and saving  Report 2. (generste-historical-oss-data)

## Generate the executable

1. Run node build.js.
  
   - Example **_build.js_**
      
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

        
   - esbuild is used to bundle up the code with its dependencies, and convert it into a single cjs module that will work correctly in our binary. build.js provides esbuild parameters.
2. Run __node --experimental-sea-config sea-config.json__
   - sea-config.json This tells node how to package your executable
    { 
        "main": "dist/bundle.cjs", 
        "output": "sea-prep.blob"
    }
   - This creates a "blob" of code that will get inserted into a node binary, to make it into a single executable that you can distribute. It will write the "blob" to the location you specified in the output field of sea-config.json
3. Run __node -e "require('fs').copyFileSync(process.execPath, 'generate-historical-data.exe')"__
   - This creates a copy of the node executable.
4. Run __npx postject generate-historical-data.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2__
   - This injects the blob inot the copied binary.
5. Open Powershell
   - Launch the Run box by pressing Windows + R on your keyboard. Type PowerShell in the search box and click OK.
   - A PowerShell window will open, but note that it’s not in Administrator mode.