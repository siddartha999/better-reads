import React, { useState, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from "./components/Home/Home";
import NavSidebar from './components/NavSideBar/NavSideBar';
import Login from './components/Login/Login';
import { UserContext } from './contexts/UserContext';
import { SnackbarContext } from './contexts/SnackbarContext';
import Profile from './components/Profile/Profile';
import SnackBar from './components/Snackbar/Snackbar';

function App() {
  const userObj = JSON.parse(localStorage.getItem("betterreadsuserinfo"));
  const [user, setUser] = useState(userObj);
  const [snackbarOpen, toggleSnackbar] = useState(false);
  const snackbarObj = useRef(null);
  const width = (window.innerWidth);
  const appFlow = (
    <>
      <NavSidebar />
      <div className={`App-body-wrapper ${width < 600 ? 'mobile' : ''}`}>
        <Routes>
            <Route exact path='/' element={<Home />} />
            <Route exact path='/profile' element={<Profile />} />
        </Routes>
      </div>
    </>
  );
  return (
    <div className="App">
      <UserContext.Provider value={{user, setUser}}> 
        <SnackbarContext.Provider value={{snackbarOpen, toggleSnackbar, snackbarObj}}>
          {user ? appFlow : (<Login />)}
          <SnackBar />
        </SnackbarContext.Provider>
      </UserContext.Provider>
    </div>
  );
}

export default App;
