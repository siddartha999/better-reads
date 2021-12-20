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
import EditProfileDialog from '../EditProfileDialog/EditProfileDialog';

const Profile = () => {
    const {user, setUser} = useContext(UserContext);
    const history = useLocation();
    const profileName = history.pathname.split('/').pop();
    const [profile, setProfile] = useState(null);
    const width = useContext(ScreenWidthContext);
    const [rating, setMyRating] = useState(null);
    const [reviewsCount, setReviewsCount] = useState(null);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const [profileActions, setProfileActions] = useState(null);
    const [openReviewChart, setOpenReviewChart] = useState(false);
    const profileBooks = useRef(null);
    const navigate = useNavigate();
    const [retrieveProfileInfo, setRetrieveProfileInfo] = useState(1);
    const [dialogOpen, setDialogOpen] = useState(false);

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

        const response = await axios({
            method: 'GET',
            url: process.env.REACT_APP_SERVER_URL + '/api/profile/' + profileName,
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
    }, [retrieveProfileInfo, profileName]);

    //Retrieve the profile specific info in the initial-run.
    useEffect(async () => {
        const response = await axios({
            method: 'GET',
            url: process.env.REACT_APP_SERVER_URL + '/api/profileActivity/' + profileName,
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
    }, [profileName]);

    /**
     * Retrieve the profile's actions in the initial run.
     */
    useEffect(async () => {
        const response = await axios({
            method: 'GET',
            url: process.env.REACT_APP_SERVER_URL + '/api/profileActions/' + profileName,
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
    }, [profileName]);

    /**
     * Handler to navigate to the user rated books page.
     */
     const handleRatedPageNavigation = (event) => {
        navigate('/' + profileName + '/rated', {state: {profileName: profileName}});
    };

    /**
     * Handler to navigate to the user's reviews page.
     */
    const handleUserReviewsNavigation = () => {
        navigate('/' + profileName + '/reviews');
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
        navigate('/' + profileName + '/' + type, {state: {profileName: profileName}});
    };


    /**
     * Handler to follow/unFollow a user profile by the current User.
     */
    const handleUserProfileFollow = async (event) => {
        try{
            const response = await axios({
                method: "PATCH",
                url: process.env.REACT_APP_SERVER_URL + '/api/profile/' + profileName + '/follow',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if(response.status === 200) {
               setRetrieveProfileInfo(retrieveProfileInfo === 1 ? 2 : 1);
               raiseSnackbarMessage(response.data.message, 'success');
            }
        }
        catch(err) {
            if(err.response.status === 401) {
                raiseSnackbarMessage(err.response.data.message, 'error');
                localStorage.setItem("betterreadsuserinfo", null);
                setUser(null);
            }
            else {
                raiseSnackbarMessage(err.response.data.message, 'error');
            }
        }
    };

    /**
     * Handler to open the UserBookExtrasDialog.
    */
    const handleDialogOpen = () => {
        setDialogOpen(true);
    };


    /**
     * Handler to navigate to the followers component.
     */
    const handleFollowersClicked = async () => {
        try {
            const response = await axios({
                method: "GET",
                url: process.env.REACT_APP_SERVER_URL + '/api/profile/' + profileName + '/followers',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response);
        }
        catch(err) {
            if(err.response && err.response.status === 401) {
                raiseSnackbarMessage(err.response.data.message, 'error');
                localStorage.setItem("betterreadsuserinfo", null);
                setUser(null);
            }
            else {
                raiseSnackbarMessage(err.response.data.message, 'error');
            }
        }
    };

    const handleFollowingClicked = async () => {
        try {
            const response = await axios({
                method: "GET",
                url: process.env.REACT_APP_SERVER_URL + '/api/profile/' + profileName + '/following',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response);
        }
        catch(err) {
            if(err.response && err.response.status === 401) {
                raiseSnackbarMessage(err.response.data.message, 'error');
                localStorage.setItem("betterreadsuserinfo", null);
                setUser(null);
            }
            else {
                raiseSnackbarMessage(err.response.data.message, 'error');
            }
        }
    };

    return (
        <div className={`Profile  ${width < 1400 ? 'mobile' : ''}`}>
            <div className={`Profile-details-wrapper`}>
                <div className='Profile-details-header-wrapper'>
                    <div className="Profile-image-wrapper">
                        <img src={profile?.profilePicUrl}
                        className="Profile-user-pic" />
                    </div>
                    <div className={`Profile-details-header-content-wrapper`}>
                        {
                            profileName !== user?.profile?.profileName ?
                                <div className={`Profile-follow-wrapper`} onClick={handleUserProfileFollow}>
                                    {
                                        profile?.isFollowedByCurrentUser === true ?
                                            <p attr='unFollow'>UnFollow</p>
                                            : 
                                            <p attr='follow'>Follow</p>
                                    }
                                    
                                </div>
                                :
                                <div className={'Profile-edit-wrapper'} onClick={handleDialogOpen}>
                                    <p>Edit profile</p>
                                </div>
                        }
                    </div>
                </div>
                <div className="Profile-info-wrapper">
                    <div className="Profile-info-name-wrapper">
                        <p className="Profile-name" title={profile?.name}>{profile?.name}</p>
                        {
                            profile && profile.profileName ?
                                <p className='Profile-profile-name' title={profile?.name}>@{profile.profileName}</p>
                                : null
                        }
                    </div>
                    {
                        profile && profile.bio ?
                            <div className='Profile-info-bio-wrapper'>
                                <p>{profile.bio}</p>
                            </div>
                            :
                            null

                    }
                    <div className='Profile-info-follow-details-wrapper'>
                        <div className='Profile-info-following-wrapper'>
                            <p onClick={handleFollowingClicked}>{abbreviateNumber(profile?.following?.length)} Following</p>
                        </div>
                        <div className='Profile-info-followers-wrapper'>
                            <p onClick={handleFollowersClicked}>{abbreviateNumber(profile?.followers?.length)} Followers</p>
                        </div>
                    </div>
                    <div className='Profile-info-extras-wrapper'>
                        {
                            rating ?
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
                        {
                            profileName === user?.profile?.profileName ?
                                <Button className="Profile-sign-out" variant="outlined" color="error" onClick={signOutUser}>Sign Out</Button>
                                : null
                        }
                    </div>
                    <UserRatingsChart data={rating?.ratingMap} open={openReviewChart} setOpenReviewChart={setOpenReviewChart} 
                        profileName={user?.profile?.profileName}
                    />
                </div>
            </div>

            <div className="Profile-BookShelf-wrapper">
                <BookShelf data={profileBooks.current} handleProfileBooksNavigation={handleProfileBooksNavigation} />
            </div>

            <div className="Profile-profile-actions-wrapper">
                <ProfileActions data={profileActions?.profileActions} name={profile?.name} />
            </div>

            <EditProfileDialog name={profile?.name} bio={profile?.bio} setOpen={dialogOpen} 
                setDialogOpen={setDialogOpen} setRetrieveProfileInfo={setRetrieveProfileInfo} retrieveProfileInfo={retrieveProfileInfo} />
        </div>
    );
};

export default Profile;