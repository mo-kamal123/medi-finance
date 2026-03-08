import CustomersPage from "../pages/customers-page";
import NewCustomer from "../pages/new-customer";
import CustomerDetails from "../pages/customer-details";

export const customersRoutes = [
  {
    path: "/customers",
    element: <CustomersPage />,
  },
  {
    path: "/customers/new",
    element: <NewCustomer />,
  },
  {
    path: "/customers/:id",
    element: <CustomerDetails />,
  },
];