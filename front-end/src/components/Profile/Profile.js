import React, { useContext, useRef, useEffect, useState } from 'react';
import './Profile.css';
import { UserContext } from '../../contexts/UserContext';
import Button from '@mui/material/Button';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { abbreviateNumber } from '../../utils/numbersUtils';

const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/altimage.png";

const Profile = () => {
    const {user, setUser} = useContext(UserContext);
    const width = useContext(ScreenWidthContext);
    const name = user.profile.name;
    const profilePicUrl = user.profile.profilePicUrl;
    const [rating, setMyRating] = useState(null);
    const [reviews, setReviews] = useState(null);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const navigate = useNavigate();

    //Retrieve the user specific info in the initial-run.
    useEffect(async () => {
        const token = user?.token;
        if(!token) {
            raiseSnackbarMessage('Unable to Authenticate the User. Please login again', 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }

        const response = await axios({
            method: 'GET',
            url: process.env.REACT_APP_SERVER_URL + '/api/userActivity',
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
        let averageRating = 0;
        if(response.data && response.data.ratingMap && response.data.ratingCount) {
            let sum = 0;
            for(let key in response.data.ratingMap) {
                //sum  += key * response.data.ratingMap[key];
                averageRating += (key * response.data.ratingMap[key]) / response.data.ratingCount;
            }
            //averageRating = sum / response.data.ratingCount;
            averageRating = averageRating.toFixed(2);
        }
        setMyRating({ratingCount: response.data.ratingCount, averageRating: averageRating});
        setReviews(response.data.reviews);
    }, []);

    /**
     * Handler to navigate to the user rated books page.
     */
     const handleRatedPageNavigation = (event) => {
        navigate(`/mybooks/rated`, {state: 'rated'});
    };

    /**
     * Handler to navigate to the user's reviews page.
     */
    const handleUserReviewsNavigation = () => {
        navigate('/myReviews', {state: {
            reviews: reviews
        }});
    };

    /*
    Function to sign-out the current logged-in user.
    */
    const signOutUser = () => {
        localStorage.setItem("betterreadsuserinfo", null);
        setUser(null);
    };

    return (
        <div className={`Profile  ${width < 1400 ? 'mobile' : ''}`}>
            <div className={`Profile-details-wrapper`}>
                <div className="Profile-image-wrapper">
                    <img src={profilePicUrl}
                    className="Profile-user-pic" />
                </div>
                <div className="Profile-info-wrapper">
                    <p className="Profile-name" title={name}>{name}</p>
                    {rating ?
                        <div className="Profile-rating-wrapper">
                            {
                                rating.ratingCount ?
                                    <span className="Profile-rating-count" onClick={handleRatedPageNavigation}>
                                        {abbreviateNumber(rating.ratingCount)} {rating.ratingCount > 1 ? 'ratings' : 'rating'}
                                    </span>
                                    : null
                            }
                            {
                                rating.averageRating > 0 ?
                                    <span className="Profile-average-rating">
                                        ({rating.averageRating} average)
                                    </span>
                                    : null
                            }
                        </div>
                        : null
                    }
                    {
                        reviews && reviews.length ?
                        <div className="Profile-review-wrapper">
                            <span className="Profile-review-count" onClick={handleUserReviewsNavigation}>
                                {reviews.length} reviews
                            </span>
                        </div>
                        : null
                    }
                    <Button className="Profile-sign-out" variant="outlined" color="error" onClick={signOutUser}>Sign Out</Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;