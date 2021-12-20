import React, { useState } from 'react';
import './ProfileSocial.css';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useLocation, useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TAB_TYPES = ['following', 'followers'];

const ProfileSocial = (props) => {
    const location = useLocation();
    const pathSplit = location.pathname.split('/');
    const tabType = pathSplit.pop();
    const profileName = pathSplit.pop()
    const [tab, setTab] = useState(tabType === 'following' ? 0 : 1);
    const navigate = useNavigate();


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

    return (
        <div className='ProfileSocial'>
            <div className='ProfileSocial-header'>
                <div className='ProfileSocial-profile-wrapper'>
                    <div className='Profile-social-back-wrapper' onClick={handleProfileNavigation}>
                        <ArrowBackIcon />
                    </div>
                    <div className='ProfileSocial-profile-name-wrapper'>
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

            </div>
        </div>
    );
};

export default ProfileSocial;