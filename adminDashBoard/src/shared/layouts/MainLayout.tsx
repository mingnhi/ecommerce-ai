import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <main className="min-h-screen p-6">
      <Outlet />
    </main>
  );
};

export default MainLayout;
