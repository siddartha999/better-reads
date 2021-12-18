import React, { useContext, useState, useRef, useEffect } from 'react';
import './EditProfileDialog.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Draggable from 'react-draggable';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';

const DialogHeader = (props) => {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            <IconButton
                aria-label="close"
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
                onTouchStart={onClose}
                onClick={onClose}
                >
                <CloseIcon />
            </IconButton>
        </DialogTitle>
    );
};

DialogHeader.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
};

const PaperComponent = (props) => {
    return (
      <Draggable
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper {...props} />
      </Draggable>
    );
}



const EditProfileDialog = (props) => {
    const width = useContext(ScreenWidthContext);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const isError = useRef(false);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const {user, setUser} = useContext(UserContext);

    /**
     * Set the name, bio in the initial run.
     */
    useEffect(() => {
        setName(props.name || '');
        setBio(props.bio || '');
    }, [props.name]);

    /**
     * Handler to close the dialog.
     */
    const handleClose = () => {
        props.setDialogOpen(false);
    };

    /**
     * Handler to submit the changes.
     */
    const handleSubmit = async () => {
        handleClose();
        const token = user?.token;
      
        if(!token) {
            raiseSnackbarMessage('Unable to Authenticate the User. Please login again', 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }

        try {
            const response = await axios({
                method: "PATCH",
                url: process.env.REACT_APP_SERVER_URL + `/api/profile/details`,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: {
                    profileDetails: {
                        name: name,
                        bio: bio
                    }
                }
            });
            if(response.status === 200) {
                raiseSnackbarMessage(response.data.message, 'success');
                if(props.setRetrieveProfileInfo) {
                    props.setRetrieveProfileInfo(props.retrieveProfileInfo === 1 ? 2 : 1);
                    const newUserDetails = user;
                    newUserDetails.profile.name = name;
                    localStorage.setItem("betterreadsuserinfo", JSON.stringify(newUserDetails));
                }
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
     * Handler to update the user name.
     */
    const handleNameUpdate = (event) => {
        const value = event.target.value.slice(0, 50).trim();
        if(value.length === 0) {
            isError.current = true;
        }
        else {
            isError.current = false;
        }
        setName(value);
    };

    /**
     * Handler to update the user's Bio.
     */
    const handleBioUpdate = (event) => {
        setBio(event.target.value.slice(0, 160));
    };

    return (
        <div className='EditProfileDialog'>
             <Dialog
                onClose={handleClose}
                aria-labelledby="draggable-dialog-title"
                open={props.setOpen}
                PaperComponent={PaperComponent}
            >

                <DialogHeader id="customized-dialog-title" onClose={handleClose}  style={{cursor: 'move'}}>
                    <p className="EditProfileDialog-title">Edit profile</p>
                </DialogHeader>

                <DialogContent dividers>
                    <div className='EditProfileDialog-content-wrapper'>
                        <div className={`EditProfileDialog-content-user-name-wrapper ${isError.current || name?.length === 0}`}>
                            <TextField label={`name (${name?.length} / 50)`} value={name} id="fullWidth" onChange={handleNameUpdate}  />
                        </div>
                        <div className='EditProfileDialog-content-bio-wrapper'>
                            <TextField value={bio} onChange={handleBioUpdate} multiline label={`Bio  (${bio?.length} / 160)`} 
                               inputProps={{ maxLength: 160 }} id="fullWidth"  />
                        </div>
                    </div>
                </DialogContent>        

                <DialogActions>
                    <Button autoFocus onClick={handleSubmit} disabled={isError.current}>
                        Save changes
                    </Button>
                </DialogActions>    
            </Dialog>
        </div>
    );
};

export default EditProfileDialog;