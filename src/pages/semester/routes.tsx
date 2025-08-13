import { Route } from "react-router-dom";

import SemesterShow from "./show";
import { SemesterList } from "./list";
import { SemesterCreate } from "./create";
import { SemesterEdit } from "./edit";

export const semesterRoute = [
    <Route key="semesters-list" path="/semesters" element={<SemesterList />} />,
    <Route key="semesters-create" path="/semesters/create" element={<SemesterCreate />} />,
    <Route key="semesters-edit" path="/semesters/edit/:id" element={<SemesterEdit />} />,
    <Route key="semesters-show" path="/semesters/show/:id" element={<SemesterShow />} />
]