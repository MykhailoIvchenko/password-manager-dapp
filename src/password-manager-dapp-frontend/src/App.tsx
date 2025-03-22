import { useEffect, useState } from 'react';
import CheckAccess from './components/CheckAccess';
import DefaultPageLayout from './components/ui/DefaultPageLayout';
// @ts-ignore
import { default as vetkd_init } from './vetkd_user_lib/ic_vetkd_utils.js';
// @ts-ignore
import vetkd_wasm_url from './vetkd_user_lib/ic_vetkd_utils_bg.wasm?url';

function App() {
  const [isWasmLoaded, setIsWasmLoaded] = useState(false);

  useEffect(() => {
    fetch(vetkd_wasm_url)
      .then((res) => res.arrayBuffer())
      .then((buffer) => WebAssembly.instantiate(buffer, {}))
      .then((wasmModule) => {
        vetkd_init(wasmModule.instance);
        setIsWasmLoaded(true);
      })
      .catch(console.error);
  }, []);

  if (!isWasmLoaded) {
    return <div>Loading WebAssembly...</div>;
  }

  return (
    <DefaultPageLayout>
      <CheckAccess />
    </DefaultPageLayout>
  );
}

export default App;
