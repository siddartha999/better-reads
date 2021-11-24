import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Home from "./components/Home/Home";
import NavSidebar from './components/NavSideBar/NavSideBar';

function App() {
  return (
    <div className="App">
      <NavSidebar />
      <Routes>
        <Route exact path='/' element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
