import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from "./components/Home/Home";
import NavSidebar from './components/NavSideBar/NavSideBar';
import Login from './components/Login/Login';
import { UserContext } from './contexts/UserContext';
import Profile from './components/Profile/Profile';

function App() {
  const userObj = JSON.parse(localStorage.getItem("betterreadsuserinfo"));
  const [user, setUser] = useState(userObj);
  const appFlow = (
    <>
      <NavSidebar />
      <Routes>
        <Route exact path='/' element={<Home />} />
        <Route exact path='/profile' element={<Profile />} />
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
