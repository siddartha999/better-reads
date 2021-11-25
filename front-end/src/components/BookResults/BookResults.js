import React, { useState, useContext } from 'react'
import { useLocation } from 'react-router';
import './BookResults.css';
import Pagination from '@mui/material/Pagination';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';

const COVER_PIC_URL_PREFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";

const BookResults = (props) => {
    const { state } = useLocation();
    const data = state?.docs || [];
    console.log(data);
    const paginationCount = Math.ceil(data.length / 10);
    const [paginationIndex, setPaginationIndex] = useState(1);
    const width = useContext(ScreenWidthContext);

    /**
     * Function to handle the change in pagination index.
     */
    const handlePaginationChange = (event, value) => {
        setPaginationIndex(value);
    };

    const noResultsJSX = (
        <div className="BookResults-no-results">
            <p>No results to display. Please try a different Search</p>
        </div>
    );
    const displayResultsJSX = (
        <div className="BookResults-wrapper">
            {
                data.slice(10 * (paginationIndex - 1), 10 * paginationIndex).map(obj => (
                    <div key={obj.key} coverid={obj.cover_i} itemid={obj.key} 
                        className={`BookResults-result-card ${width < 800 ? 'mobile' : width < 1000 ? 'tablet' : ''}`}>
                        <Card sx={{ maxWidth: 345 }}>
                            <CardMedia
                                component="img"
                                alt={ALT_IMAGE_PATH}
                                image={obj.cover_i ? COVER_PIC_URL_PREFIX + obj.cover_i + "-M.jpg" : ALT_IMAGE_PATH}
                            />
                            <div className="BookResults-result-card-details-wrapper">
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div" title={obj.title}>
                                        {obj.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Initial Published Year: {obj.first_publish_year}
                                    </Typography>
                                </CardContent>
                            </div>
                        </Card>
                    </div>
                ))
            }
        </div>
    );
    return (
        <div className="BookResults">
            {state ? displayResultsJSX : noResultsJSX}
            {state ? 
                <div className="BookResults-pagination-wrapper">
                    <Pagination count={paginationCount} page={paginationIndex} onChange={handlePaginationChange} 
                        variant="outlined" color="primary" />  
                </div> 
                : null
            }
        </div>
    );
};

export default BookResults;