import React, { useContext, useRef, useEffect } from 'react';
import './Profile.css';
import { UserContext } from '../../contexts/UserContext';
import Button from '@mui/material/Button';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';

const Profile = () => {
    const {user, setUser} = useContext(UserContext);
    const width = useContext(ScreenWidthContext);
    const name = user.profile.name;
    const profilePicUrl = user.profile.profilePicUrl;

    /*
    Function to signout the current logged-in user.
    */
    const signoutUser = () => {
        localStorage.setItem("betterreadsuserinfo", null);
        setUser(null);
    };

    return (
        <div className={`Profile  ${width < 1400 ? 'mobile' : ''}`}>
            <div className={`Profile-details-wrapper`}>
                <div className="Profile-image-wrapper">
                    <img src={profilePicUrl} alt={process.env.PUBLIC_URL + "/altimage.png"} 
                    className="Profile-user-pic" />
                </div>
                <div className="Profile-info-wrapper">
                    <p className="Profile-name" title={name}>{name}</p>
                    <p>Ratings:</p>
                    <Button className="Profile-sign-out" variant="outlined" color="error" onClick={signoutUser}>Sign Out</Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;