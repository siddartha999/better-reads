import React, { useContext } from 'react';
import './BookShelf.css';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import USER_BOOK_STATUS_CONSTANTS, { USER_BOOK_STATUS_CONSTANTS_LIST } from '../../utils/userBookStatusConstants';
import { useNavigate } from 'react-router-dom';
const BOOK_THUMBNAIL_URL_PREFIX = "https://covers.openlibrary.org/b/id/";

const BookShelf = (props) => {
    const data = props.data;
    const width = useContext(ScreenWidthContext);
    const navigate = useNavigate();

    /**
     * Handler to navigate the user to the current profile's books type page.
     */
    const handleProfileBooksNavigation = (event) => {
        console.log(event.currentTarget.getAttribute("type"));
        props.handleProfileBooksNavigation(event.currentTarget.getAttribute("type"));
    };

    /**
     * Function to generate a class name for the image wrapper.
     */
    const generateClass = (obj, index) => {
        if(obj.length === 3) {
            return index === 0 ? 'left' : index === 2 ? 'right' : null;
        }
        else if(obj.length === 2) {
            return index === 0 ? 'left' : 'right';
        }
    }

    return (
        <div className={`BookShelf ${width < 1200 ? 'mobile1200' : null}`}>
            {
                USER_BOOK_STATUS_CONSTANTS_LIST.map((value, idx) =>
                   
                    data && data[USER_BOOK_STATUS_CONSTANTS_LIST[idx]] && data[USER_BOOK_STATUS_CONSTANTS_LIST[idx]].length ?
                        <div className={`BookShelf-row ${USER_BOOK_STATUS_CONSTANTS_LIST[idx]}`} key={idx}>
                            <div className={`BookShelf-row-tag-wrapper ${USER_BOOK_STATUS_CONSTANTS_LIST[idx]}`}
                                type={USER_BOOK_STATUS_CONSTANTS_LIST[idx]}
                                onClick={handleProfileBooksNavigation}>
                                <p>{USER_BOOK_STATUS_CONSTANTS_LIST[idx]}</p>
                            </div>
                            <div className="BookShelf-row-covers-wrapper">
                                {
                                    data[USER_BOOK_STATUS_CONSTANTS_LIST[idx]].map((obj, index) => 
                                        <div 
                                            className={`BookShelf-row-cover-wrapper ${generateClass(data[USER_BOOK_STATUS_CONSTANTS_LIST[idx]], index)}`} 
                                                key={index}>
                                            <img src={BOOK_THUMBNAIL_URL_PREFIX + obj.cover + '-M.jpg'} title={obj.name} />
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    : null
                      
                )
            }
        </div>
    );
};

export default BookShelf;