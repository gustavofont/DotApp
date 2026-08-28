import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Login } from "./auth/Login";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./shared/components/Layout";
import { Home } from "./features/home/Home";
import { Catalog } from "./features/catalog/Catalog";
import { PullReveal } from "./features/pull-reveal/PullReveal";
import { Friends } from "./features/friends/Friends";
import { Trades } from "./features/trades/Trades";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/pull" element={<PullReveal />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/trades" element={<Trades />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
