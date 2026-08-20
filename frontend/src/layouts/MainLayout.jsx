import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import PageContainer from "../components/layout/PageContainer";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content starts after the 18rem sidebar */}
      <div className="ml-72 flex min-h-screen min-w-0 flex-col">
        <Header />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <PageContainer>
            {children || <Outlet />}
          </PageContainer>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;