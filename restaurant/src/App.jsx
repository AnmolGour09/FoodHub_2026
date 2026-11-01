// import { Routes, Route } from "react-router-dom";

// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Orders from "./pages/Orders";
// import Menu from "./pages/Menu";
// import Restaurant from "./pages/Restaurant";
// import Categories from "./pages/Categories";

// import PrivateRoute from "./routes/PrivateRoute";
// import DashboardLayout from "./layouts/DashboardLayout";

// function App() {
//   return (
//     <Routes>
//       {/* Public */}
//       <Route path="/" element={<Login />} />
    
//       {/* Protected */}
//       <Route
//         element={
//           <PrivateRoute>
//             <DashboardLayout />
//           </PrivateRoute>
//         }
//       >
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/categories" element={<Categories />} />
//         <Route path="/menu" element={<Menu />} />
//         <Route path="/orders" element={<Orders />} />
//         <Route path="/restaurant" element={<Restaurant />} />
//       </Route>
//     </Routes>
//   );
// }

// export default App;


import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Menu from "./pages/Menu";
import Restaurant from "./pages/Restaurant";
import Categories from "./pages/Categories";

import PrivateRoute from "./routes/PrivateRoute";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/restaurant" element={<Restaurant />} />
      </Route>

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
