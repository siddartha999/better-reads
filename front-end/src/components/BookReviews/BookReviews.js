import React, {useContext, useState} from "react";
import './BookReviews.css';
import moment from 'moment';
import { ScreenWidthContext } from "../../contexts/ScreenWidthContext";
import Pagination from '@mui/material/Pagination';
import { UserContext } from '../../contexts/UserContext';
import { useLocation } from "react-router-dom";

const BookReviews = (props) => {
    const { user } = useContext(UserContext);
    const state = useLocation();
    const reviews = props.reviews;
    const userId = props.userId;
    const userReview = props.userReview;
    const width = useContext(ScreenWidthContext);
    const paginationCount = Math.ceil((reviews && reviews.length ? reviews.length : 0) / 10);
    const [paginationIndex, setPaginationIndex] = useState(1);
    const userName = user.profile.name;
    const profilePicUrl = user.profile.profilePicUrl;

    /**
     * Function to handle the change in pagination index.
     */
     const handlePaginationChange = (event, value) => {
        setPaginationIndex(value);
    };


    return (
        <div className="BookReviews">
            { userReview && userReview.reviewContent ?
                <div className="BookReviews-review">
                    <div className="BookReviews-review-image-wrapper">
                            <img src={profilePicUrl} />
                       </div>
                       <div className="BookReviews-review-body-wrapper">
                            <div className={`BookReviews-review-header-wrapper ${width < 900 ? 'mobile900' : null}`}>
                                <p className="BookReviews-review-user-name">{userName}</p>
                                <p className="BookReviews-review-published-date">{moment(userReview.reviewTimeStamp).format("D MMM, YY")}</p>
                            </div>
                            <div className="BookReviews-review-content-wrapper">
                                <span>{userReview.reviewContent}</span>
                            </div> 
                       </div>
                </div>
                : null
            }
            {
                reviews && reviews.length ? reviews.slice(10 * (paginationIndex - 1), 10 * paginationIndex).filter((obj) => obj._id !== userId).map((review, idx) => 
                    <div className="BookReviews-review" key={idx}>
                       <div className="BookReviews-review-image-wrapper">
                            <img src={review.profilePicUrl} />
                       </div>
                       <div className="BookReviews-review-body-wrapper">
                            <div className={`BookReviews-review-header-wrapper ${width < 900 ? 'mobile900' : null}`}>
                                <p className="BookReviews-review-user-name">{review.userName}</p>
                                <p className="BookReviews-review-published-date">{moment(review.timeStamp).format("D MMM, YY")}</p>
                            </div>
                            <div className="BookReviews-review-content-wrapper">
                                <span>{review.reviewContent}</span>
                            </div>
                       </div>
                    </div>
                )
                : null
            }
            {
                reviews && reviews.length ? 
                    <div className="BookReviews-pagination-wrapper">
                        <Pagination count={paginationCount} page={paginationIndex} onChange={handlePaginationChange} 
                            variant="outlined" color="primary" />  
                    </div> 
                    : null
            }
        </div>
    );
};

export default BookReviews;