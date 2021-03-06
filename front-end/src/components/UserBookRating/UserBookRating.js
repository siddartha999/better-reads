import React, { useState, useContext, useEffect, useRef } from 'react';
import './UserBookRating.css'
import Rating from '@mui/material/Rating';
import { UserContext } from '../../contexts/UserContext';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import axios from 'axios';

const UserBookRating = (props) => {
    const [rating, setRating] = useState(props.rating || 0);
    const {user, setUser} = useContext(UserContext);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    
    /**
     * Handler to update the rating of the current book by the current user.
    */
    const handleRatingUpdate = async (event, value) => {
        const token = user?.token;
        if(!token) {
            raiseSnackbarMessage('Unable to Authenticate the User. Please login again', 'error');
            localStorage.setItem("betterreadsuserinfo", null);
            setUser(null);
        }
        
        setRating(value);
        try {
            const response = await axios({
                method: "PATCH",
                url: process.env.REACT_APP_SERVER_URL + `/api/book/${props.bookId}`,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                data: {
                    rating: {
                        prev: rating,
                        current: value
                    },
                    cover : props.cover,
                    name: props.name
                }
            });
        }
        catch(err) {
            if(err?.response?.status === 401) {
                raiseSnackbarMessage(err.response?.data?.message, 'error');
                localStorage.setItem("betterreadsuserinfo", null);
                setUser(null);
            }
            else {
                raiseSnackbarMessage(err.response?.data?.message, 'error');
            }
        }
    };

    /**
     * Due to the async nature of useState, the rating isn't updated while navigating from the AuthorWorks.
     * Setting the rating again to make sure the component renders with the expected rating.
    */
    useEffect(() => {
        setRating(props.rating ? props.rating : 0);
    }, [props.bookId, props.rating]);


    return (
        <div className="UserBookRating">
             <div className="UserBookRating-title-wrapper">
                 <p>{rating > 0 ? 'My rating' : 'Rate this book'}</p>
             </div>
            <Rating name="half-rating" value={rating} precision={0.5} onChange={handleRatingUpdate} />
        </div>
    );
};

export default UserBookRating;