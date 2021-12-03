import React from 'react';
import './BooksTile.css';
import { useNavigate } from 'react-router-dom';
import Rating from '@mui/material/Rating';
import Moment from 'react-moment';

const WORK_COVER_URL_PREFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const BooksTile = (props) => {
    const books = props.books;
    const navigate = useNavigate();

    /**
     * Handler to navigate the user to the selected book page.
     */
     const navigationHandler = (event) => {
        const bookId = event.currentTarget.getAttribute("bookid");
        navigate(`/book/${bookId}`, {state: bookId});
    };

    return (
        <div className="BooksTile">
            {books && books.filter((val, idx) => idx < 10).map((obj, idx) => 
                <div className="BooksTile-book-wrapper" key={obj._id + " " + idx}>
                    <div className="BooksTile-cover-wrapper" onClick={navigationHandler} bookid={obj._id}>
                        <img src={obj.cover ? WORK_COVER_URL_PREFIX + obj.cover + '-M.jpg' : ALT_IMAGE_PATH} alt ={ALT_IMAGE_PATH} />
                    </div>
                    <div className="BooksTile-name-wrapper" title={obj.name}>
                        <p>{obj.name}</p>
                        {props.displayRating ? 
                            (obj && obj.rating ? 
                                <Rating value={obj.rating} precision={0.5} readOnly/>
                                : null) 
                        
                        : null}
                        {
                            props.displayStarted ?
                            (obj && obj.startDate ?
                                <span className="BooksTile-name-wrapper-started">
                                    Started: <Moment date={obj.startDate} format="MMM Do YYYY" /> 
                                </span>
                                : null)
                            : null
                        }
                         {
                            props.displayCompleted ?
                            (obj && obj.endDate ?
                               <span className="BooksTile-name-wrapper-completed"> 
                                   Completed: <Moment date={obj.endDate} format="MMM Do YYYY" />
                                </span>
                                : null)
                            : null
                        }
                    </div>
                </div>    
            )}
        </div>
    );
};

export default BooksTile;