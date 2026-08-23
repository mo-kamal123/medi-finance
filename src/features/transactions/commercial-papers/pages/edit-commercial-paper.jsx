import { useParams } from 'react-router-dom';
import { useCommercialPaper } from '../hooks/commercial-papers.queries';
import CommercialPaperForm from '../components/commercial-paper-form';

const EditCommercialPaper = () => {
  const { id } = useParams();
  const { data } = useCommercialPaper(id);

  return (
    <CommercialPaperForm defaultValues={data} paperType={data?.paperType} />
  );
};

export default EditCommercialPaper;
