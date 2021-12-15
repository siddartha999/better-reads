import React, { useState, useContext } from 'react';
import './ProfileActions.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Pagination from '@mui/material/Pagination';
import Rating from '@mui/material/Rating';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';

const COVER_PIC_URL_PREFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const ProfileActions = (props) => {
    const actions = props.data;
    const width = useContext(ScreenWidthContext);
    const paginationCount = Math.ceil((actions && actions.length ? actions.length : 0) / 10);
    const [paginationIndex, setPaginationIndex] = useState(1);
    const navigate = useNavigate();

    /**
     * Handler to navigate to the corresponding Book page. 
    */
    const handleBookNavigation = (event) => {
        const id = event.currentTarget.getAttribute("bookid");
        navigate(`/book/${id}`, {state: id});
    };

    /**
    * Function to handle the change in pagination index.
    */
      const handlePaginationChange = (event, value) => {
        setPaginationIndex(value);
    };


    return (
        <>
            {
                actions && actions.length ? 
                    actions.slice(10 * (paginationIndex - 1), 10 * paginationIndex).map((action, idx) => 
                        <div className={`ProfileActions-action ${width < 1200 ? 'mobile1200' : null}`} key={idx}>
                            <div className="ProfileActions-book-cover-wrapper">
                                <img src={action.cover ? COVER_PIC_URL_PREFIX + action.cover + "-M.jpg" : ALT_IMAGE_PATH} 
                                    onClick={handleBookNavigation} bookid={action.bookId}/>
                                <div className="ProfileActions-book-timestamp-wrapper">
                                    <p>{moment(action.timestamp).format('Do MMM, YY')}</p>
                                </div>
                            </div>
                            <div className="ProfileActions-details-wrapper">
                                <div className="ProfileActions-action-wrapper">
                                    <p>{action.action}</p>
                                </div>
                                <div className="ProfileActions-book-name-wrapper">
                                    <span className="ProfileActions-book-name">{action.bookName}</span>
                                    {action.rating ? <span><Rating value={action.rating} precision={0.5} readOnly/></span> : null}
                                </div>
                                {
                                    action.reviewContent ?
                                        <div className="ProfileActions-book-review-content-wrapper">
                                            <p>{action.reviewContent}</p>
                                        </div>
                                        : null
                                }
                            </div>
                        </div>
                    )
                    : null
            }
            {
                 actions && actions.length ? 
                    <div className="ProfileActions-pagination-wrapper">
                        <Pagination count={paginationCount} page={paginationIndex} onChange={handlePaginationChange} 
                            variant="outlined" color="primary" />  
                    </div> 
                    : null
            }
        </>
    );
};

export default ProfileActions;