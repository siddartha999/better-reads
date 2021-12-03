import React, { useState, useContext, useEffect, useRef } from 'react';
import './UserBookStatusDialog.css';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import USER_BOOK_STATUS_CONSTANTS from '../../utils/userBookStatusConstants';
import moment from 'moment';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));

const DialogHeader = (props) => {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
                >
                <CloseIcon />
                </IconButton>
            ) : null}
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




const UserBookStatusDialog = (props) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [targetDate, setTargetDate] = useState(null);
    const {user, setUser} = useContext(UserContext);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const dateError = useRef(false);
    const width = useContext(ScreenWidthContext);
    /**
     * Handler to close the dialog.
     */
    const handleClose = () => {
        props.setDialogOpen(false);
    };

    
    /**
     * Due to the async nature of useState, the value of endDate, startDate isn't updated when navigating from the Author-works.
     * To make sure the component renders with the expected status value, setting the status again.
     */
    useEffect(() => {
        setStartDate(props.startDate || null);
        setEndDate(props.endDate || null);
        setTargetDate(props.targetDate || null);
    }, [props.startDate, props.endDate, props.setTargetDate]);


    /**
     * Handler to submit the changes for he book by the user.
     */
    const handleSubmit = async () => {
        handleClose();
        const token = user?.token;
      
        if(!token) {
            raiseSnackbarMessage('Unable to Authenticate the User. Please login again', 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }

        const response = await axios({
            method: "PATCH",
            url: process.env.REACT_APP_SERVER_URL + `/api/book/${props.bookId}`,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: {
                extras: {
                    startDate: startDate,
                    endDate: endDate,
                    targetDate: targetDate,
                    status: props.status
                },
                cover : props.bookCover,
                name: props.bookName
            }
        });
    
        if(response.status === 401) {
            raiseSnackbarMessage(response.data.message, 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }
        if(response.status !== 200) {
            raiseSnackbarMessage(response.data.message, 'error');
        }
    };

    return (
        <div className="UserBookStatusDialog">
            <Dialog
                onClose={handleClose}
                aria-labelledby="draggable-dialog-title"
                open={props.setOpen}
                PaperComponent={PaperComponent}
            >
                <DialogHeader id="customized-dialog-title" onClose={handleClose} style={{cursor: 'move'}}>
                    <p className="UserBookStatusDialog-title">{props.bookName}</p>
                </DialogHeader>

                    <DialogContent dividers>
                        <div className="UserBookStatusDialog-content-wrapper">
                            <div className={`UserBookStatusDialog-content-dates-wrapper ${width < 600 ? 'mobile600' : null}`}>
                                {
                                    props.status && (props.status === USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING || 
                                        props.status === USER_BOOK_STATUS_CONSTANTS.READ) && 
                                        <div className="UserBookStatusDialog-start-date-wrapper">
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker 
                                                    label="Start Date"
                                                    value={startDate}
                                                    onChange={(newValue) => {
                                                        if(props.status === USER_BOOK_STATUS_CONSTANTS.READ && endDate) {
                                                            //If the start Date is greater than the end date, mark for error
                                                            //and disable 'Save Changes'.
                                                            const val1 = Date.parse(moment(newValue).format("YYYY-MM-DD") + "T00:00:00");
                                                            const val2 = Date.parse(moment(endDate).format("YYYY-MM-DD") + "T00:00:00");
                                                            console.log(val1, val2);
                                                            if(val1 > val2) {
                                                                dateError.current = true;
                                                            }
                                                            else {
                                                                dateError.current = false;
                                                            }
                                                        }
                                                        else {
                                                            dateError.current = false;
                                                        }
                                                        setStartDate(newValue);
                                                    }}
                                                    maxDate = {new Date()}
                                                    renderInput={(params) => (
                                                    <TextField {...params}/>
                                                    )}
                                                />
                                            </LocalizationProvider>
                                        </div>
                                }
                                {
                                    props.status && props.status === USER_BOOK_STATUS_CONSTANTS.READ &&
                                        <div className={`UserBookStatusDialog-end-date-wrapper ${dateError.current === true ? 'error' : null}`}> 
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label="End Date"
                                                        value={endDate}
                                                        onChange={(newValue) => {
                                                            setEndDate(newValue);
                                                        }}
                                                        maxDate = {new Date()}
                                                        renderInput={(params) => (
                                                        <TextField {...params}/>
                                                        )}
                                                    />
                                            </LocalizationProvider>
                                        </div>
                                }
                                {
                                    props.status && props.status === USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ &&
                                        <div className="UserBookStatusDialog-end-date-wrapper"> 
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label="Target Date"
                                                        value={targetDate}
                                                        onChange={(newValue) => {
                                                            setTargetDate(newValue);
                                                        }}
                                                        minDate = {new Date()}
                                                        renderInput={(params) => (
                                                        <TextField {...params}/>
                                                        )}
                                                    />
                                            </LocalizationProvider>
                                        </div>
                                }
                            </div>
                        </div>
                    </DialogContent>
                
                    <DialogActions>
                        <Button autoFocus onClick={handleSubmit} disabled={dateError.current}>
                            Save changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
};

export default UserBookStatusDialog;