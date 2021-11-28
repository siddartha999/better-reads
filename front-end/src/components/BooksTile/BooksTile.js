import React from 'react';
import './BooksTile.css';
import { useNavigate } from 'react-router-dom';

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
            {books && books.filter((val, idx) => idx < 10).map(obj => 
                <div className="BooksTile-book-wrapper" key={obj._id}>
                    <div className="BooksTile-cover-wrapper" onClick={navigationHandler} bookid={obj._id}>
                        <img src={obj.cover ? WORK_COVER_URL_PREFIX + obj.cover + '-M.jpg' : ALT_IMAGE_PATH} alt ={ALT_IMAGE_PATH} />
                    </div>
                    <div className="BooksTile-name-wrapper" title={obj.name}>
                        <p>{obj.name}</p>
                    </div>
                </div>    
            )}
        </div>
    );
};

export default BooksTile;