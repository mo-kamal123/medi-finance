import CommercialPaperForm from '../components/commercial-paper-form';

const NewCommercialPaper = ({ paperType = 'RECEIVABLE' }) => {
  return <CommercialPaperForm paperType={paperType} />;
};

export default NewCommercialPaper;
