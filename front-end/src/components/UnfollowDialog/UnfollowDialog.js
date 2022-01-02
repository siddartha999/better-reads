import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const UnfollowDialog = (props) => {
    const [open, setOpen] = useState(props.setOpen || false);

    /**
     * Handler to close the dialog.
     */
    const handleClose = () => {
        setOpen(false);
    };

    /**
     * Handler to unfollow a user profile.
     */
    const handleUnFollowProfile = () => {
        if(props.unFollowUserProfile) {
            props.unFollowUserProfile();
        }
        handleClose();
    };

    return (
        <div className='Unfollow-Dialog'>
            <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Unfollow {} ?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={handleUnFollowProfile}>Unfollow</Button>
                    <Button onClick={handleClose} autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UnfollowDialog;