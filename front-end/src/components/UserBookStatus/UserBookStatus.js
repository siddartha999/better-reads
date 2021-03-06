import React, { useState, useContext, useEffect, useRef } from 'react';
import './UserBookStatus.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { UserContext } from '../../contexts/UserContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import axios from 'axios';
import USER_BOOK_STATUS_CONSTANTS from '../../utils/userBookStatusConstants';
import UserBookExtrasDialog from '../UserBookExtrasDialog/UserBookExtrasDialog';


const USER_BOOK_STATUS_LIST = [USER_BOOK_STATUS_CONSTANTS.NONE, USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ,
   USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING, USER_BOOK_STATUS_CONSTANTS.READ];

const UserBookStatus = (props) => {
  const [status, setStatus] = useState('');
  const {user, setUser} = useContext(UserContext);
  const {raiseSnackbarMessage} = useContext(SnackbarContext);
  const renderCount = useRef(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  /**
   * Handler to open the UserBookExtrasDialog.
   */
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  /**
   * Handler to modify the status of the book for the current user.
   */
  const handleChange = async (event) => {
    const prevVal = status;
    const statusVal = event.target.value;
    setStatus(statusVal);
    if(props.updateStatus) {
      props.updateStatus(statusVal);
    }
    renderCount.current += 1;
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
            status: {
                current: statusVal,
                prev: prevVal
            },
            cover : props.cover,
            name: props.name,
            startDate: props.startDate,
            endDate: props.endDate,
            targetDate: props.targetDate
        }
    });

    if(response.status === 401) {
        raiseSnackbarMessage(response.data.message, 'error');
        localStorage.setItem("betterreadsuserinfo", null);
        setUser(null);
    }

  };

  /**
   * Due to the async nature of useState, the value of status isn't updated when navigating from the Authorworks.
   * To make sure the component renders with the expected status value, setting the status again.
   */
  useEffect(() => {
    setStatus(props.status ? props.status : USER_BOOK_STATUS_LIST[0]);
  }, [props.status]);

  return (
    <div className="UserBookStatus">
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">Status</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          inputProps={{MenuProps: {disableScrollLock: true}}}
          id="demo-simple-select-standard"
          value={status}
          onChange={handleChange}
          label="Status"
        >
            {USER_BOOK_STATUS_LIST.map( (val, idx) => <MenuItem value={val} key={idx}>{val}</MenuItem>)}
        </Select>
      </FormControl>
      
      <UserBookExtrasDialog setOpen={dialogOpen} setDialogOpen={setDialogOpen} bookName={props.name} status={status} 
        bookId={props.bookId} bookCover={props.cover} startDate={props.startDate} endDate={props.endDate} targetDate={props.targetDate}
          rating={props.rating} reviewContent={props.reviewContent} reviewTimeStamp={props.reviewTimeStamp} />

      { 
        status !== USER_BOOK_STATUS_CONSTANTS.NONE &&
          <div className="UserBookStatus-edit-details-wrapper">
              <p onClick={handleDialogOpen}>{`Edit Dates & Submit Review`}</p>
          </div>
      }
    </div>
  );
};

export default UserBookStatus;
