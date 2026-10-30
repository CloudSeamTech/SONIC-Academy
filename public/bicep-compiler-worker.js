/* Microsoft Bicep WASM interop pattern, MIT: https://github.com/Azure/bicep
 * Compiler assets are separately pinned by content/bicep/runtime-lock.json. */
let methods;
let files = {};
self.addEventListener('message', async ({ data }) => {
  try {
    if (data.type === 'init') {
      self.postMessage({type:'progress', message:'Loading the pinned Microsoft compiler loader…'});
      const { dotnet } = await import('/bicep-runtime/dotnet.js');
      self.postMessage({type:'progress', message:'Starting the WebAssembly runtime and downloading compiler assemblies…'});
      const runtime = await dotnet.create();
      self.postMessage({type:'progress', message:'Compiler assemblies loaded; connecting the Bicep language service…'});
      runtime.setModuleImports('bicepWorker', { loadQuickstart: async path => files[path] ?? null });
      const exports = await runtime.getAssemblyExports(runtime.getConfig().mainAssemblyName);
      methods = exports.Bicep.Wasm.WorkerInterop;
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'compile') {
      if (!methods) throw new Error('Compiler is not ready.');
      files = data.files ?? {};
      // A fresh virtual entry point prevents stale dependent-module cache results.
      const entrypoint = `practice-${data.id}/main.bicep`;
      files = Object.fromEntries(Object.entries(files).map(([name, text]) => [`practice-${data.id}/${name}`, text]));
      // The upstream interop writes its entry point into its in-memory file explorer.
      // Stage companion contents there too, including text files used by loadTextContent.
      // Only the final main.bicep result is the project's compilation result.
      for (const [path, content] of Object.entries(files)) {
        await methods.CompileAndEmitDiagnostics(content, path);
      }
      const result = JSON.parse(await methods.CompileAndEmitDiagnostics(data.code, entrypoint));
      self.postMessage({ type: 'result', id: data.id, result });
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
});
