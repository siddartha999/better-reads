import React, { useContext, useRef, useEffect } from 'react';
import './Profile.css';
import { UserContext } from '../../contexts/UserContext';
import Button from '@mui/material/Button';

const Profile = () => {
    const {user, setUser} = useContext(UserContext);
    const width = useRef(window.innerWidth);
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
        <div className="Profile">
            <div className={`Profile-details-wrapper ${width.current < 600 ? 'mobile' : ''}`}>
                <div className="Profile-image-wrapper">
                    <img src={profilePicUrl} alt={process.env.PUBLIC_URL + "/altimage.png"} 
                    className="Profile-user-pic" />
                </div>
                <div className="Profile-info-wrapper">
                    <p className="Profile-name">{name}</p>
                    <p>Ratings:</p>
                    <Button variant="outlined" color="error" onClick={signoutUser}>Sign Out</Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;