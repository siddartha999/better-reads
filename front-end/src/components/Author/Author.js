import React, { useState, useContext, useEffect } from 'react';
import './Author.css';
import { useLocation } from 'react-router';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import AuthorWorks from '../AuthorWorks/AuthorWoks';
import axios from 'axios';

const AUHTOR_INFO_URL_PREFIX = "https://openlibrary.org/authors/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";
const AUTHOR_IMAGE_URL_PREFIX = "https://covers.openlibrary.org/a/id/";

const Author = (props) => {
    const state = useLocation();
    console.log(state);
    const authorId = state.pathname.split("/").pop();
    console.log(authorId);
    const [author, setAuthor] = useState(null);
    const {snackbarOpen, toggleSnackbar, snackbarObj} = useContext(SnackbarContext);
    const width = useContext(ScreenWidthContext);

    /**
     * Function to display the error message when the query result isn't retrieved.
     */
     const raiseSnackbarError = () => {
        snackbarObj.current = {}; 
        snackbarObj.current.severity = "error";
        snackbarObj.current.message = "Unable to retrieve the Author information. Please try again.";
        toggleSnackbar(true);
    };

    /**
     * Fetch the author details in the initiaal-setup.
     */
    useEffect(async () => {
        const response = await axios({
            method: "GET",
            url: AUHTOR_INFO_URL_PREFIX + authorId + ".json"
        });

        if(!response || !response.data || response.status !== 200) {
            raiseSnackbarError();
            return;
        }
        console.log(response.data);
        setAuthor(response.data);
    }, []);

    const noResultsJSX = (
        <div className="BookResults-no-results">
            <p>Nothing to display.</p>
        </div>
    );

    return (
        <div className={`Author ${width < 1200 ? 'mobile1200' : ''}`}>
            {!author ? noResultsJSX : 
            <>
                <div className="Author-header">
                    
                    <div className="Author-pic-wrapper">
                        <img src={ALT_IMAGE_PATH} 
                        src={author && author.photos && author.photos.length ? AUTHOR_IMAGE_URL_PREFIX + author.photos[0] + "-L.jpg" : ALT_IMAGE_PATH}/>
                    </div>

                    <div className="Author-details-wrapper">
                        <div className="Author-details-name-wrapper">
                            <p>{author?.name}</p>
                        </div>
                        <div className="Author-details-birth-date-wrapper">
                            <span>Birth Date: </span>
                            <span className="Author-details-birth-date">{author?.birth_date}</span>
                        </div>
                        <div className="Author-details-bio-wrapper">
                            <p>{author?.bio}</p>
                        </div>
                        <div className="Author-details-links-wrapper">
                            {author && author.links && author.links.length && author.links.filter((val, idx) => idx < 1).map((obj, index) => 
                                <div className="Author-details-link" key={index}> 
                                    <a href={obj.url} target="_blank">Website</a>
                                </div>
                            )}
                            <div className="Author-details-link">
                                {author && author.wikipedia && <a href={author.wikipedia}>Wiki</a>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="Author-author-works-wrapper">
                    <div className="Author-author-wroks-title-wrapper">
                        <p> Author Works </p>
                    </div>
                    <AuthorWorks id={author?.key} limit={30} />
                </div>

                <div className="Author-footer">
                </div>
            </>
            }
        </div>
    );
};

export default Author;