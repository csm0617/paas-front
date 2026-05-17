import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import NamespaceList from "@/pages/NamespaceList";
import PodList from "@/pages/PodList";
import ServiceList from "@/pages/ServiceList";
import IngressList from "@/pages/IngressList";
import NodeList from "@/pages/NodeList";
import ConfigMapList from "@/pages/ConfigMapList";
import DeploymentList from "@/pages/DeploymentList";
import { ToastProvider } from "@/components/Toast";

function NotFound() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-600">404</h1>
        <p className="text-xl text-slate-500 dark:text-slate-400">页面未找到</p>
        <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">返回首页</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nodes" element={<NodeList />} />
            <Route path="/namespaces" element={<NamespaceList />} />
            <Route path="/deployments" element={<DeploymentList />} />
            <Route path="/pods" element={<PodList />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/ingresses" element={<IngressList />} />
            <Route path="/configmaps" element={<ConfigMapList />} />
            <Route path="/settings" element={
              <div className="flex h-full items-center justify-center text-slate-500">
                设置页面 - 即将推出
              </div>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}
