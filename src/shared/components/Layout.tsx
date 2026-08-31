import { Outlet } from "react-router-dom";
import { Nav } from "./Nav";

export function Layout() {
  return (
    <div className="flex flex-col sm:min-h-svh sm:flex-row">
      <Nav />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
