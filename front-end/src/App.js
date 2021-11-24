import React, { useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Home from "./components/Home/Home";
import NavSidebar from './components/NavSideBar/NavSideBar';
import Login from './components/Login/Login';
import { UserContext } from './contexts/UserContext';

function App() {
  const userObj = JSON.parse(localStorage.getItem("betterreadsuserinfo"));
  const [user, setUser] = useState(userObj);
  const appFlow = (
    <>
      <NavSidebar />
      <Routes>
        <Route exact path='/' element={<Home />} />
      </Routes>
    </>
  );
  return (
    <div className="App">
      <UserContext.Provider value={{user, setUser}}> 
        {user ? appFlow : (<Login />)}
      </UserContext.Provider>
    </div>
  );
}

export default App;
