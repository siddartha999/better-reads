import React,  { useState, useRef, useContext } from 'react';
import './UpdateProfileName.css';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import TextField from '@mui/material/TextField';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { UserContext } from '../../contexts/UserContext';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

const UpdateProfileName = () => {
    const [profileName, setProfileName] = useState('');
    const {user, setUser} = useContext(UserContext);
    const validationRef = useRef({});
    const width = useContext(ScreenWidthContext);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const [saveChanges, setSaveChanges] = useState(false);
    const [loadingSpinner, setLoadingSpinner] = useState(false);
    const responseMessage = useRef(null);
    const timeoutID = useRef(null);

    /**
     * Utility function to verify whether the profileName contains special characters.
     */
    const hasSpecialCharacters = (profileName) => {
        const format = /[ !@#$%^&*()`~_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if(format.test(profileName)) {
            return true;
        }
        return false;
    };

    /**
     * Utility function to verify whether the profileName starts with a digit or contains only digits.
     */
    const validateDigitsConstraint = (profileName) => {
        if(!profileName || profileName.length === 0) return false;
        
        //If the first character is a digit
        if(profileName[0] >= '0' && profileName[0] <= '9') {
            return true;
        }

        //Check if all the characters are digits.
        let countDigits = 0;
        for(let index in profileName) {
            if(profileName[index] >= '0' && profileName[index] <= '9')
            {
                countDigits++;
            }
        }

        return countDigits === profileName.length;
    };

    /**
     * Handler to update the profileName;
     */
    const handleProfileNameChange = (event) => {
        const value = event.target.value.slice(0, 15);
        if(!validationRef.current) {
            validationRef.current = {};
        }
       
        //Validate length constraint
        if(value.length < 5) {
            validationRef.current.lc = false;
        }
        else {
            validationRef.current.lc = true;
        }

        //Validate characters-constraint #1
        if(!value || hasSpecialCharacters(value)) {
            validationRef.current.cc1 = false;
        }
        else {
            validationRef.current.cc1 = true;
        }

        //Validate characters-constraint #2
        if(!value || validateDigitsConstraint(value)) {
            validationRef.current.cc2 = false;
        }
        else {
            validationRef.current.cc2 = true;
        }

        //Check to verify whether all the constraints have been satisfied.
        if(validationRef.current.lc && validationRef.current.cc1 && validationRef.current.cc2) {
            validationRef.current.valid = true;
            debounce(() => validateProfileName(value), 500)(value);
        }
        else {
            validationRef.current.valid = false;
            responseMessage.current = null;
            setSaveChanges(false);
            clearTimeout(timeoutID.current);
        }

        setProfileName(value);
    };



    /**
     * Function to validate whether the entered Profile Name has already been taken or not.
     */
    const validateProfileName = async (value) => {
        const token = user?.token;
        try {
            setLoadingSpinner(true);
            const response = await axios({
                method: "GET",
                url: process.env.REACT_APP_SERVER_URL + '/api/profile/profileName/' + value,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            responseMessage.current = {};
            responseMessage.current.message = response.data.message;
            responseMessage.current.severity = response.data.severity;
            if(response.status === 200) {
                if(response.data.severity === 'success') {
                    setSaveChanges(true);
                }
                else {//The ProfileName is not available
                    setSaveChanges(false);
                }
            }
            else {
                setSaveChanges(false);
            }
            setLoadingSpinner(false);
        }
        catch(err) {
            responseMessage.current = null;
            setLoadingSpinner(false);
            setSaveChanges(false);
            if(err.response.status === 401) {
                raiseSnackbarMessage(err.response.data.message, 'error');
                localStorage.setItem("betterreadsuserinfo", null);
                setUser(null);
            }
        }
    };


    /**
     * Function to save the updated Profile Name
     */
    const handleSaveChanges = async () => {
        const token = user?.token;
        try {
            const response = await axios({
                method: "PATCH",
                url: process.env.REACT_APP_SERVER_URL + '/api/profile/profileName/' + profileName,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response);
            if(response.status === 200 && response.data.severity === 'success') { //Update the UserProfile Changes in the local storage.
                raiseSnackbarMessage('Profile Name has been updated successfully.', 'success');
                const userProfile = JSON.parse(localStorage.getItem("betterreadsuserinfo"));
                userProfile.profile.profileName = profileName;
                localStorage.setItem("betterreadsuserinfo", JSON.stringify(userProfile));
                setUser(userProfile);
            }
            else {
                raiseSnackbarMessage(response.data.message, 'error');
            }
        }
        catch(err) {
            if(err.response.status === 401) {
                raiseSnackbarMessage(err.response.data.message, 'error');
                localStorage.setItem("betterreadsuserinfo", null);
                setUser(null);
            }
        }
    };


    /**
     * Debounce function to fire network-calls within a given delay;
     */
    const debounce = (fn, delay) => {
        return (...args) => {
            console.log('TID: ', timeoutID);
            if(timeoutID.current) {
                clearTimeout(timeoutID.current);
            }
            timeoutID.current = setTimeout(() => {
                fn(...args);
            }, delay);
        };
    };

    return (
        <div className={`UpdateProfileName ${width < 1000 ? 'mobile1000' : null}`}>
            <div className='UpdateProfileName-wrapper'>
                <div className='UpdateProfileName-header'>
                    <div className='UpdateProfileName-header-title-wrapper'>
                        <p>Update your Profile Name to continue using Better Reads</p>
                    </div>
                    <div className='UpdateProfileName-header-rules-wrapper'>
                        <p>Rules:</p>
                        <div className={`UpdateProfileName-header-rule length-constraint ${validationRef.current?.lc === true ? null : 'invalid'}`}>
                            {
                                validationRef.current?.lc === true ?
                                    <CheckCircleOutlineIcon />
                                    :
                                    <DoNotDisturbIcon />
                            }
                            <p>Profile Name should be between 5 {`&`} 15 characters</p>
                        </div>
                        <div className={`UpdateProfileName-header-rule character-constraint-1 ${validationRef.current?.cc1 === true ? null : 'invalid'}`}>
                            {
                                validationRef.current?.cc1 === true ?
                                    <CheckCircleOutlineIcon />
                                    :
                                    <DoNotDisturbIcon />
                            }
                            <p>Profile Name can only include letters {`&`} digits</p>
                        </div>
                        <div className={`UpdateProfileName-header-rule character-constraint-2 ${validationRef.current?.cc2 === true ? null : 'invalid'}`}>
                            {
                                validationRef.current?.cc2 === true ?
                                    <CheckCircleOutlineIcon />
                                    :
                                    <DoNotDisturbIcon />
                            }
                            <p>Profile Name cannot start with a digit {`&`} cannot contain only digits</p>
                        </div>
                    </div>
                </div>

                <div className='UpdateProfileName-body-wrapper'>
                    <div className='UpdateProfileName-body-input-wrapper'>
                        <div className='UpdateProfileName-body-input'>
                            <TextField id="input-with-sx" label="Profile Name" variant="standard"
                                value = {profileName}
                                onChange={handleProfileNameChange}
                            />
                            <p className={`UpdateProfileName-body-input-message ${responseMessage.current?.severity}`}>
                                {responseMessage.current?.message}
                            </p>
                        </div>
                        {
                            loadingSpinner === true ?
                            <div className='UpdateProfileName-body-loading-spinner'>
                                <CircularProgress />
                            </div>
                            : null
                        }
                    </div>
                    { 
                        saveChanges === true ?
                        <div className='UpdateProfileName-body-save-wrapper'>
                            <LoadingButton
                            color="secondary"
                            onClick={handleSaveChanges}
                            startIcon={<SaveIcon />}
                            variant="contained"
                            >
                                Save
                            </LoadingButton>
                        </div>
                        : null
                    }
                </div>
            </div>
        </div>
    );
};

export default UpdateProfileName;