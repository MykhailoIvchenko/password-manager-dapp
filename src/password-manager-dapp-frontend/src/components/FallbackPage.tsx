import React from 'react';
import Button from './ui/Button';

interface FallbackRenderProps {
  error: Error;
}

const FallBackPage: React.FC<FallbackRenderProps> = ({ error }) => {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <main>
      <section className='fallback-page'>
        <h1 className='fallback-page_title'>Something went wrong</h1>
        <p>Error: {error.message}</p>
        <Button text={'Try again'} onClick={refreshPage} />
      </section>
    </main>
  );
};

export default FallBackPage;
