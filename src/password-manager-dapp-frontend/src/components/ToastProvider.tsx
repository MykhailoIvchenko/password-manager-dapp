import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastProvider = () => {
  return (
    <ToastContainer hideProgressBar={true} autoClose={1000} theme='dark' />
  );
};

export default ToastProvider;
