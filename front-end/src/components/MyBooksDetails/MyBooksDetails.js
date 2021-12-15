import React, { useState, useContext, useEffect } from 'react';
import './MyBookDetails.css';
import { useLocation } from 'react-router';
import USER_BOOK_STATUS_CONSTANTS from '../../utils/userBookStatusConstants';
import Pagination from '@mui/material/Pagination';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import Rating from '@mui/material/Rating';
import Moment from 'react-moment';


const COVER_PIC_URL_PREFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const MyBookDetails = (props) => {
    const state = useLocation();
    const splitPath = decodeURI(state.pathname).split('/'); 
    const type = splitPath.pop();
    const profileName = splitPath.pop();
    const {user, setUser} = useContext(UserContext);
    const [data, setData] = useState([]);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    let isValidPath = false;
    const paginationCount = Math.ceil((data && data.length ? data.length : 0) / 10);
    const [paginationIndex, setPaginationIndex] = useState(1);
    const width = useContext(ScreenWidthContext);
    const navigate = useNavigate();

    //Verify whether the current route is valid.
    if(type === 'rated') {
        isValidPath = true;
    }
    else {
        for(let key in USER_BOOK_STATUS_CONSTANTS) {
            if(USER_BOOK_STATUS_CONSTANTS[key] === type) {
                isValidPath = true;
                break;
            }
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

        let url = process.env.REACT_APP_SERVER_URL + '/api/mybooks/' + type;
        if(profileName && profileName !== 'mybooks') {
            url = process.env.REACT_APP_SERVER_URL + '/api/profile/' + profileName + '/' + type;
        }

        const response = await axios({
            method: 'GET',
            url: url,
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
        setData(response.data[type]);
    }, []);

    const notValidPathJSX = (
        <div className="BookResults-no-results">
            <p>No results to display.</p>
        </div>
    );

    return (
        <div className='MyBooksDetails'>
            {!isValidPath ? notValidPathJSX : 
                <div className="MyBooksDetails-results-wrapper">
                    { data && data.length ? 
                            data.slice(10 * (paginationIndex - 1), 10 * paginationIndex).map(obj => (
                                <div key={obj._id} coverid={obj.cover} itemID={obj._id} 
                                    className={`MyBooksDetails-result-card ${width < 800 ? 'mobile' : width < 1000 ? 'tablet' : ''}`}>
                                    <Card sx={{ maxWidth: 345 }} itemID={obj._id} onClick={bookSelected}>
                                        <CardMedia
                                            component="img"
                                            alt={ALT_IMAGE_PATH}
                                            image={obj.cover ? COVER_PIC_URL_PREFIX + obj.cover + "-M.jpg" : ALT_IMAGE_PATH}
                                        />
                                        <div className="MyBooksDetails-result-card-details-wrapper" title={obj?.name}>
                                            <p>{obj?.name}</p>
                                            {type === 'rated' ? 
                                                (obj && obj.rating ? 
                                                    <Rating value={obj.rating} precision={0.5} readOnly/>
                                                    : null) 
                                            : null}

                                            {
                                                type === USER_BOOK_STATUS_CONSTANTS.CURRENTLY_READING ?
                                                (obj && obj.startDate ? 
                                                    <span className="BooksTile-name-wrapper-started"> 
                                                        Started: <Moment date={obj.startDate} format="D MMM YYYY" /> 
                                                    </span>
                                                    : null
                                                    )
                                                : null
                                            }

                                            {
                                                type === USER_BOOK_STATUS_CONSTANTS.READ ?
                                                (obj && obj.endDate ? 
                                                    <span className="BooksTile-name-wrapper-completed"> 
                                                        Completed: <Moment date={obj.endDate} format="D MMM YYYY" /> 
                                                    </span>
                                                    : null
                                                    )
                                                : null
                                            }

                                            {
                                                type === USER_BOOK_STATUS_CONSTANTS.WANT_TO_READ ?
                                                (obj && obj.targetDate ? 
                                                    <span className="BooksTile-name-wrapper-target"> 
                                                        Target: <Moment date={obj.endDate} format="D MMM YYYY" /> 
                                                    </span>
                                                    : null
                                                    )
                                                : null
                                            }
                                        </div>
                                    </Card>
                                </div>
                             ))
                        :
                        <div className="MyBookDetails-no-results-wrapper">
                            <p>No results to display</p>
                        </div>
                    }
                </div>
            }

            {isValidPath && data && data.length ? 
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