import React, { useState, useContext, useEffect } from 'react';
import './ProfileSocial.css';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useLocation, useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import Pagination from '@mui/material/Pagination';

const TAB_TYPES = ['following', 'followers'];

const ProfileSocial = (props) => {
    const {user, setUser} = useContext(UserContext);
    const location = useLocation();
    const pathSplit = location.pathname.split('/');
    const tabType = pathSplit.pop();
    const profileName = pathSplit.pop();
    const [tab, setTab] = useState(tabType === 'following' ? 0 : 1);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const width = useContext(ScreenWidthContext);
    const [totalCount, setTotalCount] = useState(0);
    const paginationCount = Math.ceil((totalCount ? totalCount : 0) / 10);
    const [paginationIndex, setPaginationIndex] = useState(1);

    const token = user?.token;
    if(!token) {
        raiseSnackbarMessage('Unable to Authenticate the User. Please login again', 'error');
        localStorage.setItem("betterreadsuserinfo", null);
        setUser(null);
    }


    /**
     * Function to retrieve the Profile's followers/following based on the active tabType.
    */
    const retrieveProfileSocialProfiles = async (paginationIndex) => {
        try {
            const response = await axios({
                method: "GET",
                url: process.env.REACT_APP_SERVER_URL + '/api/profile/' + profileName + '/' + tabType,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    skip: paginationIndex ? paginationIndex : 0  * 10
                }
            });
            setData(response.data?.data);
            setTotalCount(response.data?.count);
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
     * Retrieve the Profile's followers/following based on the active tabType.
    */
    useEffect(retrieveProfileSocialProfiles, [tabType]);


    /**
     * Handler to toggle the tabs between following/followers
    */
    const handleToggleTabs = (event, newTab) => {
        setTab(newTab);
        navigate(`/${profileName}/${TAB_TYPES[newTab]}`);
    };

    /**
     * Handler to navigate the User to the profile in-focus.
     */
    const handleProfileNavigation = () => {
        navigate(`/${profileName}`);
    };

    /**
     * Handler to navigate the User to the selected Profile.
     */
    const handleProfileNavigate= (event) => {
        navigate(`/${event.currentTarget.getAttribute('profile')}`);
    };

    /**
     * Handler to follow/unFollow a user profile by the current User.
    */
     const handleUserProfileFollow = async (event) => {
        event.stopPropagation();
        const targetProfileName = event.currentTarget.getAttribute('profile');
        const currentTarget = event.currentTarget;
        try{
            const response = await axios({
                method: "PATCH",
                url: process.env.REACT_APP_SERVER_URL + '/api/profile/' + targetProfileName + '/follow',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if(response.status === 200) {
                raiseSnackbarMessage(response.data.message, 'success');
                const index = currentTarget.getAttribute('index');
                const newData = [...data];
                newData[index - 0].isFollowedByCurrentUser = !newData[index]?.isFollowedByCurrentUser;
                setData(newData);
            }
        }
        catch(err) {
            if(err.response?.status === 401) {
                raiseSnackbarMessage(err.response?.data?.message, 'error');
                localStorage.setItem("betterreadsuserinfo", null);
                setUser(null);
            }
            else {
                raiseSnackbarMessage(err.response?.data?.message, 'error');
            }
        }
    };

    /**
     * Handler to paginate.
     */
     const handlePaginationChange = (event, value) => {
        setPaginationIndex(value);
        retrieveProfileSocialProfiles(value);
    };

    return (
        <div className={`ProfileSocial ${width < 800 ? 'mobile800' : null}`}>
            <div className='ProfileSocial-header'>
                <div className='ProfileSocial-user-profile-wrapper'>
                    <div className='Profile-social-back-wrapper' onClick={handleProfileNavigation}>
                        <ArrowBackIcon />
                    </div>
                    <div className='ProfileSocial-user-profile-name-wrapper'>
                        {
                            profileName ?
                                <p>@{profileName}</p>
                            :   null
                        }
                    </div>
                </div>
                <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    <Tabs value={tab} onChange={handleToggleTabs} centered>
                        <Tab label="Following" />
                        <Tab label="Followers" />
                    </Tabs>
                </Box>
            </div>
            <div className='ProfileSocial-content'>
               {
                   data && data.length ?
                    data.map((obj, idx) => (
                        <div className='ProfileSocial-profile-wrapper' key={idx} onClick={handleProfileNavigate} profile={obj.profileName}>
                            <div className='ProfileSocial-profile-header-wrapper'>
                                <div className='ProfileSocial-profile-image-wrapper'>
                                    <img src={obj.profilePicUrl} />
                                </div>
                                <div className='ProfileSocial-profile-name-wrapper'>
                                    <p className='name' title={obj.name}>{obj.name}</p>
                                    <p className='profileName' title={obj.profileName}>@{obj.profileName}</p>
                                </div>
                                {
                                    obj.profileName !== user.profile?.profileName ?
                                        <div className={`ProfileSocial-profile-user-follow-wrapper ${obj.isFollowedByCurrentUser}`} 
                                            onClick={handleUserProfileFollow} profile={obj.profileName} index={idx}>
                                            {
                                                obj.isFollowedByCurrentUser === true ?
                                                    <p attr='unFollow' className='Following'>Following</p>
                                                    : 
                                                    <p attr='follow' className='Follow'>Follow</p>
                                            }
                                        </div>
                                        : null
                                }
                            </div>
                            {
                                obj.bio ?
                                    <div className='ProfileSocial-profile-bio-wrapper'>
                                        <p>{obj.bio}</p>
                                    </div>
                                    : null
                            }
                        </div>
                    ))
                    : null
               }
            </div>

            {
                totalCount && totalCount > 0 ? 
                    <div className="ProfileSocial-pagination-wrapper">
                        <Pagination count={paginationCount} page={paginationIndex} onChange={handlePaginationChange} 
                            variant="outlined" color="primary" />  
                    </div> 
                    : null
            }
        </div>
    );
};

export default ProfileSocial;