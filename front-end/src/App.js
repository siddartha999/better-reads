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
import MyBooksDetails from './components/MyBooksDetails/MyBooksDetails';
import ProfileReviews from './components/ProfileReviews/ProfileReviews';
import Friends from './components/Friends/Friends';
import Communities from './components/Communities/Communities';
import NotFound from './components/NotFound/NotFound';
import UpdateProfileName from './components/UpdateProfileName/UpdateProfileName';
import ProfileSocial from './components/ProfileSocial/ProfileSocial';

function App() {
  const userObj = JSON.parse(localStorage.getItem("betterreadsuserinfo"));
  const [user, setUser] = useState(userObj);
  const [width, setWidth] = useState(window.innerWidth);
  const [snackbarOpen, toggleSnackbar] = useState(false);
  const snackbarObj = useRef(null);

  /**
   * Handler to invoke the snackbar with the message & severity provided.
   */
  const raiseSnackbarMessage = (message, severity) => {
    snackbarObj.current = {}; 
    snackbarObj.current.severity = severity;
    snackbarObj.current.message = message;
    toggleSnackbar(true);
  };

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
            <Route path='/:profileName' element={<Profile />} />
            <Route path='/bookresults' element={<BookResults />} />
            <Route path='/book/:bookId' element={<Book />} />
            <Route path='/author/:authorId' element={<Author />} />
            <Route path='/mybooks' element={<MyBooks />} />
            <Route path='/mybooks/:status' element={<MyBooksDetails />} />
            <Route path='/:profileName/:status' element={<MyBooksDetails />} />
            <Route path="/:profileName/reviews" element={<ProfileReviews />} />
            <Route path="/:profileName/following" element={<ProfileSocial />} />
            <Route path="/:profileName/followers" element={<ProfileSocial />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
  return (
    <div className="App">
      <UserContext.Provider value={{user, setUser}}> 
        <SnackbarContext.Provider value={{snackbarOpen, toggleSnackbar, snackbarObj ,raiseSnackbarMessage}}>
          <ScreenWidthContext.Provider value={width}> 
            {
              user ? 
                user.profile && user.profile.profileName ? appFlow : <UpdateProfileName /> 
                : (<Login />)
            }
          </ScreenWidthContext.Provider>
          <SnackBar />
        </SnackbarContext.Provider>
      </UserContext.Provider>
    </div>
  );
}

export default App;
