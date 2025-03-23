import { useEffect, useState } from 'react';
import CheckAccess from './components/CheckAccess';
import DefaultPageLayout from './components/ui/DefaultPageLayout';
// @ts-ignore
import { default as vetkd_init } from './vetkd_user_lib/ic_vetkd_utils.js';
// @ts-ignore
import vetkd_wasm_url from './vetkd_user_lib/ic_vetkd_utils_bg.wasm?url';

function App() {
  useEffect(() => {
    if (!WebAssembly) {
      console.error('WebAssembly is not supported in this browser.');
    }

    // fetch(vetkd_wasm_url)
    //   .then((res) => res.arrayBuffer())
    //   .then((buffer) => WebAssembly.instantiate(buffer, {}))
    //   .then((wasmModule) => {
    //     vetkd_init(wasmModule.instance);
    //   })
    //   .catch((error) => console.error('Wasm Error', error.message));

    WebAssembly.instantiateStreaming(fetch(vetkd_wasm_url), {})
      .then((wasmModule) => {
        vetkd_init(wasmModule.instance);
      })
      .catch((error) => console.error('Wasm Error', error.message));
  }, []);

  return (
    <DefaultPageLayout>
      <CheckAccess />
    </DefaultPageLayout>
  );
}

export default App;
