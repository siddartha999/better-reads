import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router';
import './Book.css';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import Chip from '@mui/material/Chip';
import AuthorWorks from '../AuthorWorks/AuthorWorks';
import { useNavigate } from 'react-router-dom';
import UserBookStatus from '../UserBookStatus/UserBookStatus';
import { UserContext } from '../../contexts/UserContext';
import UserBookRating from '../UserBookRating/UserBookRating';
import BookReviews from '../BookReviews/BookReviews';

const BOOK_SEARCH_URL_PREFIX = "https://openlibrary.org/works/";
const AUTHOR_INFO_URL_PREFIX = "https://openlibrary.org";
const BOOK_THUMBNAIL_URL_PREFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const CHIP_STYLES = [
    {background: "linear-gradient(#7D141D, #FF1E27)", color: "#F4EFEA"},
    {backgroundColor: "#292826", color: "#F9D342"},
    {backgroundColor: "#FBEAEB", color: "#2F3C7E"},
    {background: "linear-gradient(#F6B042, #F9ED4E)", color: "#533549,"},
    {backgroundColor: "#AA96DA", color: "#FFFFD2"},
    {backgroundColor: "#080A52", color: "#EB2188"}
];

const Book = () => {
    const state = useLocation();
    const [book, setBook] = useState(null);
    const [author, setAuthor] = useState(null);
    const [userBook, setUserBook] = useState(null);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const {user, setUser} = useContext(UserContext);
    const width = useContext(ScreenWidthContext);
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [bookReviews, setBookReviews] = useState(null);

    //Fetch the book data from the provided ID in the initial-run.
    useEffect(() => {
        axios({
            method: "GET",
            url: BOOK_SEARCH_URL_PREFIX + state.pathname.split("/").pop() + ".json"
        }).then(response => {
            if(response.status !== 200) {
                raiseSnackbarMessage('Unable to retrieve the Book info. Please try again', 'error');
            }
            else {
                setBook(response.data);
                const authorId = response.data.authors && response.data.authors.length ? response.data.authors[0].author.key : null;
                if(authorId === null) return;
                //Get the Author info from the ID retrieved from the Book's response.
                axios({
                    method: "GET",
                    url: AUTHOR_INFO_URL_PREFIX + authorId + ".json",
                }).then(response => {
                    setAuthor(response.data);
                });
            }
        });

        //Fetch the User's status for the current book.
        const token = user?.token;
        axios({
            method: "GET",
            url: process.env.REACT_APP_SERVER_URL + `/api/book/` + state.pathname.split("/").pop(),
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            if(response.status === 500) {
                raiseSnackbarMessage(response.data.message, 'error');
            }
            else {
                setUserBook(response.data);
                setStatus(response.data.status);
            }
        });

        //Fetch the reviews for the current book.
        axios({
            method: "GET",
            url: process.env.REACT_APP_SERVER_URL + '/api/bookReviews/' + state.pathname.split("/").pop(),
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            if(response.status !== 200) {
                raiseSnackbarMessage(response.data.message, 'error');
            }
            else {
                setBookReviews(response.data);
            }
        });

    }, [state.pathname]);

    /**
     * Handler to navigate to the Author's view.
     */
    const authorNavigationHandler = (event) => {
        const authorId = event.currentTarget.getAttribute("authorid").split("/").pop();
        navigate(`/author/${authorId}`, {state: authorId});
    };
    
    const noResultsJSX = (
        <div className="BookResults-no-results">
            <p>No results to display. Please try a different Search</p>
        </div>
    );

    return (
        <div className={`Book ${width < 1200 ? 'mobile1200' : ''}`}>
            { (!book || !book.title) ? noResultsJSX :
                <> 
                    <div className="Book-header">
                        <div className={`Book-Thumbnail-section-wrapper`}>
                            <div className="Book-Thumbail-wrapper">
                                <img src={book && book.covers && book.covers.length ? BOOK_THUMBNAIL_URL_PREFIX + book?.covers[0] + "-M.jpg" : ALT_IMAGE_PATH} alt={ALT_IMAGE_PATH} />
                            </div>
                        </div>
                        <div className={`Book-details-section-wrapper ${width <= 900 ? 'mobile' : ''}`}>
                            <div className="Book-details-title-wrapper" title={book?.title}>
                                <p>{book?.title}</p>
                            </div>
                            {author && author.name &&
                                <div className="Book-details-author-wrapper" title={author?.name}>
                                    by <p authorid={author?.key} onClick={authorNavigationHandler}> {author?.name} </p>
                                </div>
                            }
                            <div className="Book-details-description-wrapper" title={book && book.description ? book.description.value : ''}>
                                <p>{book && book.description ? book.description.value : ''}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`Book-current-user-utils-wrapper ${status}`}>
                        <div className="Book-current-user-status-wrapper">
                            <UserBookStatus bookId={state.pathname.split("/").pop()} cover={book && book.covers && book.covers.length ? book.covers[0] : ALT_IMAGE_PATH} name={book?.title}  
                                status={status} rating = {userBook?.rating} startDate={userBook?.startDate} endDate={userBook?.endDate} targetDate={userBook?.targetDate} 
                                updateStatus={setStatus} reviewContent={userBook?.reviewContent} reviewTimeStamp={userBook?.reviewTimeStamp}/>
                        </div>
                        <div className="Book-current-user-rating-wrapper">
                            <UserBookRating bookId={state.pathname.split("/").pop()} cover={book && book.covers && book.covers.length ? book.covers[0] : ALT_IMAGE_PATH} 
                            name={book?.title} status={userBook?.status} rating = {userBook?.rating}/>
                        </div>
                        <div className="Book-current-user-stats-wrapper">

                        </div>
                    </div>
        
                    { book && (book.subject_people || book.subject_places) &&
                         <div className="Book-extras">
                            <div className={`Book-characters-wrapper ${width <= 850 ? 'mobile' : ''}`}>
                                {book && book.subject_people && book.subject_people.filter((val, idx) => idx < 10).map((value, index) => {
                                    return <Chip label={value} key={value} title={value} style={CHIP_STYLES[index % CHIP_STYLES.length]} />
                                })}
                            </div>
                            <div className={`Book-places-wrapper ${width <= 850 ? 'mobile' : ''}`}>
                                {book && book.subject_places && book.subject_places.filter((val, idx) => idx < 10).map((value, index) => {
                                    return <Chip label={value} key={value} title={value} style={CHIP_STYLES[(CHIP_STYLES.length - 1) - (index % CHIP_STYLES.length)]} color="primary" />
                                })}
                            </div>
                        </div>
                    }

                    { author && author.name ?
                        <>
                            <div className="Book-author-works-title-wrapper">
                                <p> Works by {author.name} </p>
                            </div>
                            <div className="Book-author-works-wrapper">
                                <AuthorWorks id={author?.key} limit={20} />
                            </div>
                        </>
                        : null
                    }

                    {
                        bookReviews && bookReviews.reviews && bookReviews.reviews.length ?
                            <div className="Book-reviews-wrapper">
                                <div className="Book-reviews-title-wrapper">
                                    <p>Community Reviews</p>
                                </div>
                                <BookReviews reviews={bookReviews.reviews} userBook={userBook} userId={bookReviews.userId} />
                            </div>
                            : null
                    }

                    <div className="Book-footer">
                    </div>
                </>
            }
        </div>
    );
};

export default Book;