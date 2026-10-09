import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CaseDrilldown from "./pages/CaseDrilldown";
import Compare from "./pages/Compare";
import Dashboard from "./pages/Dashboard";
import Datasets from "./pages/Datasets";
import Failures from "./pages/Failures";
import RunDetail from "./pages/RunDetail";
import Runs from "./pages/Runs";
import Traces from "./pages/Traces";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/runs" element={<Runs />} />
        <Route path="/runs/:runId" element={<RunDetail />} />
        <Route path="/runs/:runId/cases/:resultId" element={<CaseDrilldown />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/failures" element={<Failures />} />
        <Route path="/datasets" element={<Datasets />} />
        <Route path="/traces" element={<Traces />} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Route>
    </Routes>
  );
}
