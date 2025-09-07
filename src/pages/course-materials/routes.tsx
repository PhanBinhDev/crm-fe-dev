import { Navigate, Route } from "react-router-dom";
import MaterialsList from "./list";

export const materialRoutes = [
  <Route path="/materials" element={<Navigate to="/materials/list" />} />,
  <Route path="/materials/list" element={<MaterialsList />} />,

];
