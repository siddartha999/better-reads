import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router';
import './Book.css';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import Chip from '@mui/material/Chip';
import AuthorWorks from '../AuthorWorks/AuthorWoks';

const BOOK_SEARCH_URL_PREFIX = "https://openlibrary.org/works/";
const AUTHOR_INFO_URL_PREFIX = "https://openlibrary.org";
const BOOK_THUMBNAIL_URL_PRFEFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const CHIP_STYLES = [
    {backgroundColor: "wheat", color: "darkslategrey"},
    {backgroundColor: "black", color: "white"},
    {backgroundColor: "turquoise", color: "darkred"},
    {backgroundColor: "chocolate", color: "cornsilk"},
    {backgroundColor: "brown", color: "aliceblue"},
    {backgroundColor: "rebeccapurple", color: "papayawhip"}
];

const Book = () => {
    const state = useLocation();
    const [bookId, setBookId] = useState(state?.state || "0000");
    const [book, setBook] = useState(null);
    const [author, setAuthor] = useState(null);
    const {snackbarOpen, toggleSnackbar, snackbarObj} = useContext(SnackbarContext);
    const width = useContext(ScreenWidthContext);

    /**
     * Function to display the error message when the query result isn't retrieved.
     */
     const raiseSnackbarError = () => {
        snackbarObj.current = {}; 
        snackbarObj.current.severity = "error";
        snackbarObj.current.message = "Unable to retrieve the book information. Please try again.";
        toggleSnackbar(true);
    };

    //Fetch the book data from the provided ID in the initial-run.
    useEffect(() => {
        axios({
            method: "GET",
            url: BOOK_SEARCH_URL_PREFIX + (state? state.state : "0000") + ".json"
        }).then(response => {
            if(response.status !== 200) {
                raiseSnackbarError();
            }
            else {
                setBook(response.data);
                const authorId = response.data.authors[0].author.key;
                //Get the Author info from the ID retrieved from the Book's response.
                axios({
                    method: "GET",
                    url: AUTHOR_INFO_URL_PREFIX + authorId + ".json",
                }).then(response => {
                    setAuthor(response.data);
                });
            }
        });
    }, [state.pathname]);
    
    const noResultsJSX = (
        <div className="BookResults-no-results">
            <p>No results to display. Please try a different Search</p>
        </div>
    );

    return (
        <div className="Book">
            { (!book || !book.title) ? noResultsJSX :
                <> 
                    <div className="Book-header">
                        <div className={`Book-Thumbnail-section-wrapper ${width <= 900 ? 'mobile' : ''}`}>
                            <div className="Book-Thumbail-wrapper">
                                <img src={book && book.covers && book.covers.length ? BOOK_THUMBNAIL_URL_PRFEFIX + book?.covers[0] + "-M.jpg" : ALT_IMAGE_PATH} alt={ALT_IMAGE_PATH} />
                            </div>
                        </div>
                        <div className={`Book-details-section-wrapper ${width <= 900 ? 'mobile' : ''}`}>
                            <div className="Book-details-title-wrapper" title={book?.title}>
                                <p>{book?.title}</p>
                            </div>
                            <div className="Book-details-author-wrapper" title={author?.name}>
                                by <p> {author?.name} </p>
                            </div>
                            <div className="Book-details-description-wrapper" title={book && book.description ? book.description.value : ''}>
                                <p>{book && book.description ? book.description.value : ''}</p>
                            </div>
                        </div>
                    </div>
        
                    { book && (book.subject_people || book.subject_places) &&
                         <div className="Book-extras">
                            <div className={`Book-characters-wrapper ${width <= 850 ? 'mobile' : ''}`}>
                                {book && book.subject_people && book.subject_people.filter((val, idx) => idx < 15).map((value, index) => {
                                    return <Chip label={value} key={value} title={value} style={CHIP_STYLES[index % CHIP_STYLES.length]} />
                                })}
                            </div>
                            <div className={`Book-places-wrapper ${width <= 850 ? 'mobile' : ''}`}>
                                {book && book.subject_places && book.subject_places.filter((val, idx) => idx < 10).map((value, index) => {
                                    return <Chip label={value} key={value} title={value} style={CHIP_STYLES[index % CHIP_STYLES.length]} color="primary" />
                                })}
                            </div>
                        </div>
                    }

                    <div className="Book-author-works-wrapper">
                        <div className="Book-author-wroks-title-wrapper">
                            <p> Author Works </p>
                        </div>
                        <AuthorWorks id={author?.key} limit={20} />
                    </div>

                    <div className="Book-footer">
                    </div>
                </>
            }
        </div>
    );
};

export default Book;