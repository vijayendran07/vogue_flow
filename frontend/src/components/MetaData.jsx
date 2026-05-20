import { Helmet } from 'react-helmet-async';

const MetaData = ({ title, description }) => {
  return (
    <Helmet>
      <title>{title ? `${title} | VogueFlow` : 'VogueFlow - Premium Clothing'}</title>
      <meta name="description" content={description || 'Discover premium clothing and accessories at VogueFlow. Shop the latest trends with confidence.'} />
    </Helmet>
  );
};

export default MetaData;
