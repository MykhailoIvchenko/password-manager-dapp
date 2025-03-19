import clsx from 'clsx';
import infinityIcon from '../../assets/img/ic.svg';

interface ILoaderProps {
  isSmall?: boolean;
}

const Loader: React.FC<ILoaderProps> = ({ isSmall = false }) => {
  return (
    <img
      alt='Infinity icon'
      src={infinityIcon}
      className={clsx('loader', {
        'loader--small': isSmall,
      })}
    />
  );
};

export default Loader;
