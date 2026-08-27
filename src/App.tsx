import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Login } from "./auth/Login";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Home } from "./features/home/Home";
import { Catalog } from "./features/catalog/Catalog";
import { Collection } from "./features/collection/Collection";
import { Friends } from "./features/friends/Friends";
import { Trades } from "./features/trades/Trades";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/trades" element={<Trades />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
