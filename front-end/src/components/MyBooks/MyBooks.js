import React, { useContext, useEffect, useState, useRef } from 'react';
import './MyBooks.css';
import BooksTile from '../BooksTile/BooksTile';
import { UserContext } from '../../contexts/UserContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import axios from 'axios';
import USER_BOOK_STATUS_CONSTANTS from '../../utils/userBookStatusConstants';

const MyBooks = () => {
    const {user, setUser} = useContext(UserContext);
    const width = useRef(window.innerWidth);
    const {snackbarOpen, toggleSnackbar, snackbarObj} = useContext(SnackbarContext);
    const [myBooks, setMyBooks] = useState(null);

    //Load the books info for the user in the intital-setup.
    useEffect(async () => {
        const token = user?.token;
        if(!token) {
            raiseSnackbarMessage('Unable to Authenticate the User. Please login again', 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }

        const response = await axios({
            method: 'GET',
            url: process.env.REACT_APP_SERVER_URL + '/api/mybooks',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if(response.status === 401) {
            raiseSnackbarMessage(response.data.message, 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }

        if(response.status !== 200) {
            raiseSnackbarMessage(response.data.message, 'error');
            return;
        }
        console.log(response.data);
        setMyBooks(response.data);

    }, []);

    /**
     * Function to display the snackbar message.
    */
   const raiseSnackbarMessage = (message, severity) => {
        snackbarObj.current = {}; 
        snackbarObj.current.severity = severity;
        snackbarObj.current.message = message;
        toggleSnackbar(true);
    };

    return (
        <div className="MyBooks">
            {myBooks &&
            <>
                {
                    myBooks[USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING].length ?
                        (
                        <>
                            <div className="MyBooks-title-wrapper">
                            <   p>{USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING}</p>
                            </div>    
                            <div className="MyBooks-currenty-reading-wrapper">
                                <BooksTile books={myBooks[USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING]} />
                            </div> 
                        </>) : null
                }

                {
                    myBooks[USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ].length ?
                        (<>
                            <div className="MyBooks-title-wrapper">
                                <p>{USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ}</p>
                            </div>
                            <div className="MyBooks-want-to-read-wrapper">
                                <BooksTile books={myBooks[USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ]} />
                            </div>
                        </>) : null
                }

                {
                    myBooks[USER_BOOK_STATUS_CONSTANTS.READ].length ? 
                        ( <>
                            <div className="MyBooks-title-wrapper">
                                <p>{USER_BOOK_STATUS_CONSTANTS.READ}</p>
                            </div>
                            <div className="MyBooks-read-wrapper">
                                <BooksTile books={myBooks[USER_BOOK_STATUS_CONSTANTS.READ]} />
                            </div>
                        </>) : null
                }
            </>
            }
            <div className="MyBooks-recommended-wrapper">

            </div>
        </div>
    );
};

export default MyBooks;