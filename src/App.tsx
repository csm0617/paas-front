import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import NamespaceList from "@/pages/NamespaceList";
import PodList from "@/pages/PodList";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/namespaces" element={<NamespaceList />} />
          <Route path="/pods" element={<PodList />} />
          <Route path="/settings" element={
            <div className="flex h-full items-center justify-center text-slate-500">
              Settings Page - Coming Soon
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}
