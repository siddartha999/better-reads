import React, { useState, useContext } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { UserContext } from '../../contexts/UserContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import axios from 'axios';

const USER_BOOK_STATUS = {
    WANT_TO_READ: 'Want to Read',
    CURRENTLY_READING: 'Currently Reading',
    READ: 'Read',
    NONE: 'None'
};

const USER_BOOK_STATUS_LIST = [USER_BOOK_STATUS.NONE, USER_BOOK_STATUS.WANT_TO_READ, USER_BOOK_STATUS.CURRENTLY_READING, 
                                USER_BOOK_STATUS.READ];

const UserBookStatus = (props) => {
  const [status, setStatus] = useState(USER_BOOK_STATUS_LIST[0]);
  const {user, setUser} = useContext(UserContext);
  const {snackbarOpen, toggleSnackbar, snackbarObj} = useContext(SnackbarContext);

  /**
   * Handler to modify the status of the book for the current user.
   */
  const handleChange = async (event) => {
    const statusVal = event.target.value;
    setStatus(statusVal);
    const token = user?.token;

    if(!token) {
        raiseSnackbarError('Unable to Authenticate the User. Please login again');
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
            status: statusVal
        }
    });

    if(response.status === 401) {
        raiseSnackbarError(response.data.message);
        localStorage.setItem("betterreadsuserinfo", null);
        setUser(null);
    }

  };

   /**
     * Function to display an error message
     */
    const raiseSnackbarError = (message) => {
        snackbarObj.current = {}; 
        snackbarObj.current.severity = "error";
        snackbarObj.current.message = message;
        toggleSnackbar(true);
    };

  return (
    <div className="UserBookStatus">
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">Status</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={status}
          onChange={handleChange}
          label="Status"
        >
            {USER_BOOK_STATUS_LIST.map( (val, idx) => <MenuItem value={val} key={idx}>{val}</MenuItem>)}
        </Select>
      </FormControl>
    </div>
  );
};

export default UserBookStatus;
