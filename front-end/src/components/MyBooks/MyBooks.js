import React, { useContext, useEffect, useState, useRef } from 'react';
import './MyBooks.css';
import BooksTile from '../BooksTile/BooksTile';
import { UserContext } from '../../contexts/UserContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import axios from 'axios';
import USER_BOOK_STATUS_CONSTANTS from '../../utils/userBookStatusConstants';
import { useNavigate } from 'react-router-dom';

const MyBooks = () => {
    const {user, setUser} = useContext(UserContext);
    const width = useRef(window.innerWidth);
    const {snackbarOpen, toggleSnackbar, snackbarObj} = useContext(SnackbarContext);
    const [myBooks, setMyBooks] = useState(null);
    const navigate = useNavigate();

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

    /**
     * Handler to navigate to the selected status page.
     */
    const handleNavigation = (event) => {
        const type = event.currentTarget.getAttribute('type').trim();
        console.log(type);
        console.log(type.trim());
        navigate(`${type}`, {state: myBooks[type]});
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
                                <span className="MyBooks-title">{USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING}</span>
                                {
                                    myBooks[USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING] && myBooks[USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING].length > 10 ?
                                        <span className="Mybooks-show-more" type={USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING} onClick={handleNavigation}>Show more</span>
                                    : null
                                }
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
                                <span className="MyBooks-title">{USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ}</span>
                                {
                                    myBooks[USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ] && myBooks[USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ].length > 10 ?
                                        <span className="Mybooks-show-more" type={USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ} onClick={handleNavigation}>Show more</span>
                                    : null
                                }
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
                                <span className="MyBooks-title">{USER_BOOK_STATUS_CONSTANTS.READ}</span>
                                {
                                    myBooks[USER_BOOK_STATUS_CONSTANTS.READ] && myBooks[USER_BOOK_STATUS_CONSTANTS.READ].length > 10 ?
                                        <span className="Mybooks-show-more" type={USER_BOOK_STATUS_CONSTANTS.READ} onClick={handleNavigation}>Show more</span>
                                    : null
                                }
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