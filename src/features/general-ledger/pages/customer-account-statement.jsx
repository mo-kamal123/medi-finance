import { Users } from 'lucide-react';
import { useCustomers } from '../../invoices/hooks/invoices.queries';
import PartyAccountStatement from '../components/party-account-statement';

const CustomerAccountStatementPage = () => (
  <PartyAccountStatement
    partyLabel="عميل"
    partyIdField={{
      idKey: 'customerID',
      nameArKey: 'customerNameAr',
      nameEnKey: 'customerNameEn',
      filterKey: 'customerId',
    }}
    usePartyList={useCustomers}
    hiddenFilterFields={{ customerId: true }}
    emptyIcon={Users}
    emptyTitle="اختر عميل"
    emptyDescription="قم باختيار العميل من القائمة أعلاه لعرض كشف الحساب"
  />
);

export default CustomerAccountStatementPage;
