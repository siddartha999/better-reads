import React, { useState, useRef, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from "./components/Home/Home";
import NavSidebar from './components/NavSideBar/NavSideBar';
import Login from './components/Login/Login';
import { UserContext } from './contexts/UserContext';
import { SnackbarContext } from './contexts/SnackbarContext';
import { ScreenWidthContext } from './contexts/ScreenWidthContext';
import Profile from './components/Profile/Profile';
import SnackBar from './components/Snackbar/Snackbar';
import BookResults from './components/BookResults/BookResults';
import Book from './components/Book/Book';
import Author from './components/Author/Author';
import MyBooks from './components/MyBooks/MyBooks';

function App() {
  const userObj = JSON.parse(localStorage.getItem("betterreadsuserinfo"));
  const [user, setUser] = useState(userObj);
  const [width, setWidth] = useState(window.innerWidth);
  const [snackbarOpen, toggleSnackbar] = useState(false);
  const snackbarObj = useRef(null);

  /**
   * useEffect for initial-setup to add an event listener that tracks the current screen's width on resize.
   */
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWidth(window.innerWidth);
    });
  }, []);

  const appFlow = (
    <>
      <NavSidebar />
      <div className={`App-body-wrapper ${width < 600 ? 'mobile' : ''}`}>
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/bookresults' element={<BookResults />} />
            <Route path='/book/:bookId' element={<Book />} />
            <Route path='/author/:authorId' element={<Author />} />
            <Route path='/mybooks' element={<MyBooks />} />
        </Routes>
      </div>
    </>
  );
  return (
    <div className="App">
      <UserContext.Provider value={{user, setUser}}> 
        <SnackbarContext.Provider value={{snackbarOpen, toggleSnackbar, snackbarObj}}>
          <ScreenWidthContext.Provider value={width}> 
            {user ? appFlow : (<Login />)}
          </ScreenWidthContext.Provider>
          <SnackBar />
        </SnackbarContext.Provider>
      </UserContext.Provider>
    </div>
  );
}

export default App;
