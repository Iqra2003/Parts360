import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddPart from './pages/AddPart';
import PartsList from './pages/PartsList';
import ImageMatching from './pages/ImageMatching';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-part" element={<AddPart />} />
          <Route path="parts" element={<PartsList />} />
          <Route path="matching" element={<ImageMatching />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
