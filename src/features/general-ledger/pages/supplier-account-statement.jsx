import { UserCheck } from 'lucide-react';
import { useSuppliers } from '../../invoices/hooks/invoices.queries';
import PartyAccountStatement from '../components/party-account-statement';

const SupplierAccountStatementPage = () => (
  <PartyAccountStatement
    partyLabel="مورد"
    partyIdField={{
      idKey: 'supplierID',
      nameArKey: 'supplierNameAr',
      nameEnKey: 'supplierNameEn',
      filterKey: 'supplierId',
    }}
    usePartyList={useSuppliers}
    hiddenFilterFields={{ supplierId: true }}
    emptyIcon={UserCheck}
    emptyTitle="اختر مورد"
    emptyDescription="قم باختيار المورد من القائمة أعلاه لعرض كشف الحساب"
  />
);

export default SupplierAccountStatementPage;
