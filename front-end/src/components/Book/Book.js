import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router';
import './Book.css';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import Chip from '@mui/material/Chip';
import { color } from '@mui/system';

const BOOK_SEARCH_URL_PREFIX = "https://openlibrary.org/works/";
const AUTHOR_INFO_URL_PREFIX = "https://openlibrary.org";
const BOOK_THUMBNAIL_URL_PRFEFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const Book = () => {
    const state = useLocation();
    const bookId = state?.state || "0000";
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
            url: BOOK_SEARCH_URL_PREFIX + bookId + ".json"
        }).then(response => {
            console.log(response.data);
            if(response.status !== 200) {
                raiseSnackbarError();
            }
            else {
                setBook(response.data);
                const authorId = response.data.authors[0].author.key;
                console.log(authorId);
                //Get the Author info from the ID retrieved from the Book's response.
                axios({
                    method: "GET",
                    url: AUTHOR_INFO_URL_PREFIX + authorId + ".json",
                }).then(response => {
                    console.log("Author", response.data);
                    setAuthor(response.data);
                });
            }
        });
    }, []);
    
    const noResultsJSX = (
        <div className="BookResults-no-results">
            <p>No results to display. Please try a different Search</p>
        </div>
    );
    const bookResultJSX = (
        <div className="Book">
            <div className="Book-header">
                <div className={`Book-Thumbnail-section-wrapper ${width <= 900 ? 'mobile' : ''}`}>
                    <div className="Book-Thumbail-wrapper">
                        <img src={BOOK_THUMBNAIL_URL_PRFEFIX + book?.covers[0] + "-M.jpg"} alt={ALT_IMAGE_PATH} />
                    </div>
                </div>
                <div className={`Book-details-section-wrapper ${width <= 900 ? 'mobile' : ''}`}>
                    <div className="Book-details-title-wrapper" title={book?.title}>
                        <p>{book?.title}</p>
                    </div>
                    <div className="Book-details-author-wrapper" title={author?.name}>
                        by <p> {author?.name} </p>
                    </div>
                    <div className="Book-details-description-wrapper" title={book?.description.value}>
                        <p>{book?.description.value}</p>
                    </div>
                </div>
            </div>

            <div className="Book-extras">
                <div className="Book-characters-wrapper">
                    {book?.subject_people.filter((val, idx) => idx < 10).map(value => {
                        return <Chip label={value} color="primary" />
                    })}
                </div>
                <div className="Book-places-wrapper">
                    {book?.subject_places.filter((val, idx) => idx < 10).map(value => {
                        return <Chip label={value} color="primary" />
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {bookId ? bookResultJSX : noResultsJSX}
        </>
    );
};

export default Book;