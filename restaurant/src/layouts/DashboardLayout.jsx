import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Adjust path if your components folder is elsewhere
import Navbar from "../components/Navbar";   // Adjust path if your components folder is elsewhere

function DashboardLayout() {
  return (
    <div className="flex h-screen w-full max-w-[100vw] overflow-hidden bg-slate-50">
      
      {/* Sidebar handles its own mobile hiding (hidden md:block) */}
      <Sidebar />
      
      {/* 
        CRITICAL FIX: 
        Adding 'min-w-0', 'max-w-full', and 'overflow-x-hidden' to this main flex column.
        This forces the layout to shrink to the mobile phone's width and prevents 
        any inner components (like tables or tabs) from stretching the entire app!
      */}
      <div className="flex flex-col flex-1 w-full min-w-0 max-w-[100vw] md:max-w-full overflow-y-auto overflow-x-hidden">
        <Navbar />
        
        <main className="flex-1 w-full min-w-0 max-w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default DashboardLayout;