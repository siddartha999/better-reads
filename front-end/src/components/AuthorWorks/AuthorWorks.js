import React, { useState, useEffect, useContext } from 'react';
import './AuthorWorks.css';
import axios from 'axios';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { useNavigate } from 'react-router-dom';

const AUTHOR_WORKS_URL_PREFIX = "https://openlibrary.org";
const WORK_COVER_URL_PREFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const AuthorWorks = (props) => {
    const authorId = props.id;
    const limit = props.limit || 50;
    const [works, setWorks] = useState(null);
    const {snackbarOpen, toggleSnackbar, snackbarObj} = useContext(SnackbarContext);
    const navigate = useNavigate();

    /**
     * Function to display the error message when the query result isn't retrieved.
     */
     const raiseSnackbarError = () => {
        snackbarObj.current = {}; 
        snackbarObj.current.severity = "error";
        snackbarObj.current.message = "Unable to retrieve the works of Author.";
        toggleSnackbar(true);
    };

    /**
     * Handler to navigate the user to the selected book page.
     */
    const navigationHandler = (event) => {
        const worksId = event.currentTarget.getAttribute("bookid");
        let id = worksId.split("/").pop();
        console.log("before nav", id);
        navigate(`/book/${id}`, {state: id});
    };


    /**
     * Retrive the Author's works in the initial-run.
     */
    useEffect(async () => {
            const response = await axios({
            method: "GET",
            url: AUTHOR_WORKS_URL_PREFIX + authorId + "/works.json?limit=" + limit,
        });
        if(!response || !response.data || response.status !== 200) {
            raiseSnackbarError();
            return;
        }
        console.log(response.data.entries);
        setWorks(response.data.entries);
    }, [props.id]);

    const noResultsJSX = (
        <div className="BookResults-no-results">
            <p>No Author works to display.</p>
        </div>
    );

    return (
        <div className="AuthorWorks">
            {!works ? noResultsJSX :
                <>
                    {works?.map(obj => 
                        <div className="AuthorWorks-work-wrapper" key={obj.key}>
                            <div className="AuthorWorks-work-cover-wrapper" bookid={obj.key} onClick={navigationHandler}>
                                <img alt={ALT_IMAGE_PATH} src={obj && obj.covers && obj.covers.length ? WORK_COVER_URL_PREFIX + obj.covers[0] + "-M.jpg" : ALT_IMAGE_PATH} />
                            </div>
                            <div className="Authorworks-work-title-wrapper" title={obj.title}>
                                <p>{obj.title}</p>
                            </div>
                        </div>    
                    )}
                </>
            }
        </div>
    );
};

export default AuthorWorks;