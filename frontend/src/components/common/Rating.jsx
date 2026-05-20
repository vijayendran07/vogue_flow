import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text }) => {
  return (
    <div className="flex items-center space-x-1">
      <span className="flex text-yellow-400">
        {value >= 1 ? <FaStar /> : value >= 0.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        {value >= 2 ? <FaStar /> : value >= 1.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        {value >= 3 ? <FaStar /> : value >= 2.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        {value >= 4 ? <FaStar /> : value >= 3.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        {value >= 5 ? <FaStar /> : value >= 4.5 ? <FaStarHalfAlt /> : <FaRegStar />}
      </span>
      {text && <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{text}</span>}
    </div>
  );
};

export default Rating;
