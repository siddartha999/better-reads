import React, { useState, useContext, useEffect } from 'react';
import './MyBookDetails.css';
import { useLocation } from 'react-router';
import USER_BOOK_STATUS_CONSTANTS from '../../utils/userBookStatusConstants';
import Pagination from '@mui/material/Pagination';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';

const COVER_PIC_URL_PREFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const MyBookDetails = (props) => {
    const state = useLocation();console.log(state);
    const type = state.pathname?.split('/')?.pop();
    const {user, setUser} = useContext(UserContext);
    const [data, setData] = useState([]);
    const {snackbarOpen, toggleSnackbar, snackbarObj} = useContext(SnackbarContext);
    let isValidPath = false;
    const paginationCount = Math.ceil((data && data.length ? data.length : 0) / 10);
    const [paginationIndex, setPaginationIndex] = useState(1);
    const width = useContext(ScreenWidthContext);
    const navigate = useNavigate();
    for(let key in USER_BOOK_STATUS_CONSTANTS) {
        if(USER_BOOK_STATUS_CONSTANTS[key] === type) {
            isValidPath = true;
        }
    }

    /**
     * Function to handle the change in pagination index.
     */
    const handlePaginationChange = (event, value) => {
        setPaginationIndex(value);
    };

     /**
     * This function redirects the user to the selected book page.
     */
    const bookSelected = (event) => {
        const id = event.currentTarget.getAttribute("itemid");
        navigate(`/book/${id}`, {state: id});
    };

    /**
     * Retrieve all the books of the current MyBooks type for the user.
     */
    useEffect(async () => {
        const token = user?.token;
        if(!token) {
            raiseSnackbarMessage('Unable to Authenticate the User. Please login again', 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }

        //No need to make the API call if the path isn't valid.
        if(!isValidPath) {
            raiseSnackbarMessage('No results to display.', 'info');
            return;
        }

        const response = await axios({
            method: 'GET',
            url: process.env.REACT_APP_SERVER_URL + '/api/mybooks/' + type,
            headers: {
                'Authorization': `Bearer ${token}`
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
        console.log(response.data[type]);
        setData(response.data[type]);
    }, []);

    /**
     * Function to display the snackbar message.
    */
   const raiseSnackbarMessage = (message, severity) => {
        snackbarObj.current = {}; 
        snackbarObj.current.severity = severity;
        snackbarObj.current.message = message;
        toggleSnackbar(true);
    };


    const notValidPathJSX = (
        <div className="BookResults-no-results">
            <p>No results to display.</p>
        </div>
    );

    return (
        <div className='MyBooksDetails'>
            {!isValidPath ? notValidPathJSX : 
                <div className="MyBooksDetails-results-wrapper">
                    {
                        data && data.length && data.slice(10 * (paginationIndex - 1), 10 * paginationIndex).map(obj => (
                            <div key={obj._id} coverid={obj.cover} itemID={obj._id} 
                                className={`MyBooksDetails-result-card ${width < 800 ? 'mobile' : width < 1000 ? 'tablet' : ''}`}>
                                <Card sx={{ maxWidth: 345 }} itemID={obj._id} onClick={bookSelected}>
                                    <CardMedia
                                        component="img"
                                        alt={ALT_IMAGE_PATH}
                                        image={obj.cover ? COVER_PIC_URL_PREFIX + obj.cover + "-M.jpg" : ALT_IMAGE_PATH}
                                    />
                                    <div className="MyBooksDetails-result-card-details-wrapper">
                                        <CardContent>
                                            <Typography gutterBottom variant="h6" component="div" title={obj.name}>
                                                {obj.name}
                                            </Typography>
                                        </CardContent>
                                    </div>
                                </Card>
                            </div>
                        ))
                    }
                </div>
            }

            {isValidPath ? 
                <div className="MyBooksDetails-pagination-wrapper">
                    <Pagination count={paginationCount} page={paginationIndex} onChange={handlePaginationChange} 
                        variant="outlined" color="primary" />  
                </div> 
                : null
            }
        </div>
    );
};

export default MyBookDetails;