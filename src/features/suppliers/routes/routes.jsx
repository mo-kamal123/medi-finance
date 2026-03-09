import SuppliersPage from "../pages/suppliers-page";
import SupplierDetails from "../pages/supplier-details";
import SupplierCreate from "../pages/supplier-create";

export const suppliersRoutes = [
  {
    path: "/suppliers",
    element: <SuppliersPage />,
  },
  {
    path: "/suppliers/new",
    element: <SupplierCreate />,
  },
  {
    path: "/suppliers/:id",
    element: <SupplierDetails />,
  },
];