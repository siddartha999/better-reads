import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import './ProfileReviews.css';
import axios from 'axios';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { useLocation } from 'react-router';
import Pagination from '@mui/material/Pagination';
import { useNavigate } from 'react-router-dom';
import { ScreenWidthContext } from "../../contexts/ScreenWidthContext";

const BOOK_THUMBNAIL_URL_PREFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const ProfileReviews = (props) => {
    const {user, setUser} = useContext(UserContext);
    const splitPath = useLocation().pathname.split('/');
    const profileName = splitPath[splitPath.length - 2];
    const [reviews, setReviews] = useState(null);
    const width = useContext(ScreenWidthContext);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const paginationCount = Math.ceil((reviews && reviews.length ? reviews.length : 0) / 10);
    const [paginationIndex, setPaginationIndex] = useState(1);
    const navigate = useNavigate();

    /**
     * Set the reviews in the initial-run.
     */
    useEffect(async () => {
        const token = user?.token;
        if(!token) {
            raiseSnackbarMessage('Unable to Authenticate the User. Please login again', 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }

        else {
            const response = await axios({
                method: 'GET',
                url: process.env.REACT_APP_SERVER_URL + '/api/profileActivity/' + profileName + '/reviews',
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
            setReviews(response.data.reviews);
        }
    }, []);

    /**
     * Function to handle the change in pagination index.
     */
     const handlePaginationChange = (event, value) => {
        setPaginationIndex(value);
    };

    /**
     * Handler to navigate the user to the corresponding Book page.
     */
    const handleBookNavigation = (event) => {
        const bookId = event.currentTarget.getAttribute("bookid");
        navigate(`/book/${bookId}`, {state: bookId});
    };

    return (
        <div className={`ProfileReviews ${width < 1200 ? 'mobile1200' : null}`}>
            {
                reviews && reviews.length ?
                reviews.slice(10 * (paginationIndex - 1), 10 * paginationIndex).map((review, idx) => 
                    <div className="ProfileReviews-row" key={idx}>
                        <div className="ProfileReviews-row-cover-wrapper">
                            <img src={review.cover ? BOOK_THUMBNAIL_URL_PREFIX + review.cover + "-M.jpg" : ALT_IMAGE_PATH} 
                                onClick={handleBookNavigation} bookid={review._id}
                            />
                        </div>
                        <div className="ProfileReviews-row-details-wrapper">
                            <div className="ProfileReviews-row-title-wrapper">
                                <p>{review.name}</p>
                            </div>
                            <div className="ProfileReviews-row-review-wrapper">
                                <p>{review.reviewContent}</p>
                            </div>
                        </div>
                    </div>
                    )
                : null
            }
            {reviews && reviews.length ? 
                <div className="ProfileReviews-pagination-wrapper">
                    <Pagination count={paginationCount} page={paginationIndex} onChange={handlePaginationChange} 
                        variant="outlined" color="primary" />  
                </div> 
                : null
            }
        </div>
    );
};

export default ProfileReviews;