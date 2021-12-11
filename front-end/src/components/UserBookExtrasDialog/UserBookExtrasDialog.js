import React, { useState, useContext, useEffect, useRef } from 'react';
import './UserBookExtrasDialog.css';
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
import UserBookContext from '../../contexts/UserBookContext';
import CircularProgress from '@mui/material/CircularProgress';

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




const UserBookExtrasDialog = (props) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [targetDate, setTargetDate] = useState(null);
    const {user, setUser} = useContext(UserContext);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const dateError = useRef(false);
    const width = useContext(ScreenWidthContext);
    const [currentReviewContent, setReviewContent] = useState('');
    const prevReviewContent = useRef(props.reviewContent);
    const {setCurrentUserReview, bookId} = useContext(UserBookContext);
    /**
     * Handler to close the dialog.
     */
    const handleClose = () => {
        props.setDialogOpen(false);
    };

    /**
     * Handler to update the review state.
     */
    const handleReviewUpdate = (event) => {
        setReviewContent(event.target.value);
    };

    
    /**
     * Due to the async nature of useState, the value of endDate, startDate isn't updated when navigating from the Author-works.
     * To make sure the component renders with the expected status value, setting the status again.
     */
    useEffect(() => {
        setStartDate(props.startDate || null);
        setEndDate(props.endDate || null);
        setTargetDate(props.targetDate || null);
        setReviewContent(props.reviewContent); console.log('In UseEffect', bookId, props.reviewContent);
    }, [props.startDate, props.endDate, props.setTargetDate, props.reviewContent, bookId]);


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
            url: process.env.REACT_APP_SERVER_URL + `/api/book/${bookId}`,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: {
                extras: {
                    userName: user.profile?.name,
                    profilePicUrl: user.profile?.profilePicUrl,
                    rating: props.rating,
                    startDate: startDate,
                    endDate: endDate,
                    targetDate: targetDate,
                    status: props.status,
                    prevReview: prevReviewContent.current,
                    reviewContent: currentReviewContent
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
            return;
        }

        if(prevReviewContent.current !== currentReviewContent) {
            setCurrentUserReview({
                reviewContent: currentReviewContent, 
                reviewTimeStamp: Date.now()
            });
        }

        //Storing the currentReviewContent as prevReviewContent in-case the User sticks to the same screen & edits his
        //review
        prevReviewContent.current = currentReviewContent;
    };

    return (
        <div className="UserBookExtrasDialog">
            <Dialog
                onClose={handleClose}
                aria-labelledby="draggable-dialog-title"
                open={props.setOpen}
                PaperComponent={PaperComponent}
            >
                <DialogHeader id="customized-dialog-title" onClose={handleClose} style={{cursor: 'move'}}>
                    <p className="UserBookExtrasDialog-title">{props.bookName}</p>
                </DialogHeader>

                    <DialogContent dividers>
                        <div className="UserBookExtrasDialog-content-wrapper">
                            <div className={`UserBookExtrasDialog-content-dates-wrapper ${width < 600 ? 'mobile600' : null}`}>
                                {
                                    props.status && (props.status === USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING || 
                                        props.status === USER_BOOK_STATUS_CONSTANTS.READ) && 
                                        <div className="UserBookExtrasDialog-start-date-wrapper">
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
                                        <div className={`UserBookExtrasDialog-end-date-wrapper ${dateError.current === true ? 'error' : null}`}> 
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label="End Date"
                                                        value={endDate}
                                                        onChange={(newValue) => {
                                                            if(props.status === USER_BOOK_STATUS_CONSTANTS.READ && startDate) {
                                                                //If the start Date is greater than the end date, mark for error
                                                                //and disable 'Save Changes'.
                                                                const val1 = Date.parse(moment(startDate).format("YYYY-MM-DD") + "T00:00:00");
                                                                const val2 = Date.parse(moment(newValue).format("YYYY-MM-DD") + "T00:00:00");
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
                                        <div className="UserBookExtrasDialog-end-date-wrapper"> 
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
                            <div className="UserBookExtrasDialog-review-wrapper">
                                <TextField value={currentReviewContent} multiline 
                                inputProps={{ maxLength: 280 }} fullWidth label="review" id="fullWidth" 
                                onChange={handleReviewUpdate} />
                                <div className="UserBookExtrasDialog-review-utils-wrapper">
                                    { (currentReviewContent !== null && currentReviewContent !== undefined) ?
                                        <div className='UserBookExtrasDialog-review-progress-wrapper' title={`${currentReviewContent.length} / 280`}>
                                            <CircularProgress variant="determinate" color="secondary" 
                                                value={((currentReviewContent.length * 100) / 280).toFixed(2)} />
                                        </div>
                                        : null
                                    }
                                    {
                                        props.reviewTimeStamp && 
                                            <div className="UserBookExtrasDialog-timestamp-wrapper">
                                                <p>last updated: {moment(props.reviewTimeStamp).format("D MMM YYYY")}</p>
                                            </div>
                                    }
                                </div>
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

export default UserBookExtrasDialog;