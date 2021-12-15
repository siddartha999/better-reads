import React, { useContext, useRef, useEffect, useState } from 'react';
import './Profile.css';
import { UserContext } from '../../contexts/UserContext';
import Button from '@mui/material/Button';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { abbreviateNumber } from '../../utils/numbersUtils';
import ProfileActions from '../ProfileActions/ProfileActions';
import UserRatingsChart from '../UserRatingsChart/UserRatingsChart';
import BookShelf from '../BookShelf/BookShelf';

const Profile = () => {
    const {user, setUser} = useContext(UserContext);
    const history = useLocation();
    const profileId = history.pathname.split('/').pop();
    const [profile, setProfile] = useState(null);
    const width = useContext(ScreenWidthContext);
    const [rating, setMyRating] = useState(null);
    const [reviewsCount, setReviewsCount] = useState(null);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const [profileActions, setProfileActions] = useState(null);
    const [openReviewChart, setOpenReviewChart] = useState(false);
    const profileBooks = useRef(null);
    const navigate = useNavigate();

    const token = user?.token;
        if(!token) {
            raiseSnackbarMessage('Unable to Authenticate the User. Please login again', 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }

    /**
     * Handler to display the Review chart.
     */
    const handleOpenReviewChart = () => {
        setOpenReviewChart(true);
    };

    /**
     * Retrieve profile info in the initial-run.
     */
    useEffect(async () => {

        //Current User's profile, required profile info is already present.
        if(profileId === user?.profile?._id) {
            setProfile({
                name: user.profile.name,
                profilePicUrl: user.profile.profilePicUrl
            });
            return;
        }

        const response = await axios({
            method: 'GET',
            url: process.env.REACT_APP_SERVER_URL + '/api/profile/' + profileId,
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

        setProfile(response.data);

    }, []);

    //Retrieve the profile specific info in the initial-run.
    useEffect(async () => {
        const response = await axios({
            method: 'GET',
            url: process.env.REACT_APP_SERVER_URL + '/api/profileActivity/' + profileId,
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
        profileBooks.current = response.data.profileBooks
        setMyRating({ratingCount: response.data.ratingCount, averageRating: averageRating, ratingMap: response.data.ratingMap});
        setReviewsCount(response.data.reviewsCount);
    }, []);

    /**
     * Retrieve the profile's actions in the initial run.
     */
    useEffect(async () => {
        const response = await axios({
            method: 'GET',
            url: process.env.REACT_APP_SERVER_URL + '/api/profileActions/' + profileId,
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
        setProfileActions(response.data);
    }, []);

    /**
     * Handler to navigate to the user rated books page.
     */
     const handleRatedPageNavigation = (event) => {
        navigate('/' + profileId + '/rated', {state: {profileId: profileId}});
    };

    /**
     * Handler to navigate to the user's reviews page.
     */
    const handleUserReviewsNavigation = () => {
        navigate('/' + profileId + '/reviews');
    };

    /*
    Function to sign-out the current logged-in user.
    */
    const signOutUser = () => {
        localStorage.setItem("betterreadsuserinfo", null);
        setUser(null);
    };

     /**
     * Handler to navigate the user to current profile's marked books.
     */
      const handleProfileBooksNavigation = (type) => {
        navigate('/' + profileId + '/' + type, {state: {profileId: profileId}});
    };

    return (
        <div className={`Profile  ${width < 1400 ? 'mobile' : ''}`}>
            <div className={`Profile-details-wrapper`}>
                <div className="Profile-image-wrapper">
                    <img src={profile?.profilePicUrl}
                    className="Profile-user-pic" />
                </div>
                <div className="Profile-info-wrapper">
                    <p className="Profile-name" title={profile?.name}>{profile?.name}</p>
                    {rating ?
                        <div className="Profile-rating-wrapper">
                            {
                                rating.ratingCount ?
                                    <>
                                        <span className="Profile-rating-count" onClick={handleRatedPageNavigation}>
                                            {abbreviateNumber(rating.ratingCount)} {rating.ratingCount > 1 ? 'ratings' : 'rating'}
                                        </span>
                                     </>
                                    : null
                            }
                            {
                                rating.averageRating > 0 ?
                                    <span className="Profile-average-rating" onClick={handleOpenReviewChart}>
                                        ({rating.averageRating} average)
                                    </span>
                                    : null
                            }
                        </div>
                        : null
                    }
                    {
                        reviewsCount && reviewsCount > 0 ?
                        <div className="Profile-review-wrapper">
                            <span className="Profile-review-count" onClick={handleUserReviewsNavigation}>
                                {reviewsCount} {reviewsCount > 1 ? 'reviews' : 'review'}
                            </span>
                        </div>
                        : null
                    }
                    <Button className="Profile-sign-out" variant="outlined" color="error" onClick={signOutUser}>Sign Out</Button>
                    <UserRatingsChart data={rating?.ratingMap} open={openReviewChart} setOpenReviewChart={setOpenReviewChart} />
                </div>
            </div>

            <div className="Profile-BookShelf-wrapper">
                <BookShelf data={profileBooks.current} handleProfileBooksNavigation={handleProfileBooksNavigation} />
            </div>

            <div className="Profile-profile-actions-wrapper">
                <ProfileActions data={profileActions?.profileActions} />
            </div>
        </div>
    );
};

export default Profile;