import { useEffect } from 'react';
import CheckAccess from './components/CheckAccess';
import DefaultPageLayout from './components/ui/DefaultPageLayout';
// // @ts-ignore
// import { default as vetkd_init } from './vetkd_user_lib/ic_vetkd_utils.js';
// // @ts-ignore
// import vetkd_wasm from './vetkd_user_lib/ic_vetkd_utils_bg.wasm';

function App() {
  // useEffect(() => {
  //   vetkd_wasm().then((res: any) => vetkd_init(res));
  // }, []);

  return (
    <DefaultPageLayout>
      <CheckAccess />
    </DefaultPageLayout>
  );
}

export default App;
