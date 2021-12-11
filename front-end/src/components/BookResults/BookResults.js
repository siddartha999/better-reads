import React, { useState, useContext, useEffect } from 'react'
import { useLocation } from 'react-router';
import './BookResults.css';
import Pagination from '@mui/material/Pagination';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';


const COVER_PIC_URL_PREFIX = "https://covers.openlibrary.org/b/id/";
const ALT_IMAGE_PATH = process.env.PUBLIC_URL + "/ImgNotAvailable.jpg";
const SEARCH_QUERY_PREFIX = "https://openlibrary.org/search.json";

const BookResults = (props) => {
    const state = useLocation();
    const [data, setData] = useState(state.state?.docs || []);
    const paginationCount = Math.ceil((state.state?.numFound || state.state?.num_found) / 10);
    const [paginationIndex, setPaginationIndex] = useState(1);
    const width = useContext(ScreenWidthContext);
    const {raiseSnackbarMessage} = useContext(SnackbarContext);
    const navigate = useNavigate();
    const [displayLoadingSpinner, setDisplayLoadingSpinner] = useState(false);

    /**
     * Function to handle the change in pagination index.
     */
    const handlePaginationChange = async (event, value) => {
        setPaginationIndex(value);
        setDisplayLoadingSpinner(true);
        const response = await axios({
            method: "GET",
            url: SEARCH_QUERY_PREFIX + state.search + `&limit=10&offset=${value}`
        });
        setDisplayLoadingSpinner(false);
        if(response.status !== 200 || response.data.numFound === 0) {
            raiseSnackbarMessage('Unable to fetch the Search result. Please try again later or try a different search', 'error');
        }
        else {
            setData(response.data.docs);
        }
    };

    /**
     * This function redirects the user to the selected individual search result page.
     */
    const searchResultSelected = (event) => {
        const worksId = event.currentTarget.getAttribute("itemid");
        let id = worksId.split("/");
        id = id.pop();
        navigate(`/book/${id}`, {state: id});
    };

    /**
     * Update the pagination index to 1 whenever there is a change in search query.
     */
    useEffect(() => {
        setPaginationIndex(1);
        setData(state.state?.docs || []);
    }, state.key);

    const noResultsJSX = (
        <div className="BookResults-no-results">
            <p>No results to display. Please try a different Search</p>
        </div>
    );
    const displayResultsJSX = (
        <div className="BookResults-wrapper">
            {
                data && data.length ? 
                    data.map(obj => (
                        <div key={obj.key} coverid={obj.cover_i} itemID={obj.key} 
                            className={`BookResults-result-card ${width < 800 ? 'mobile' : width < 1000 ? 'tablet' : ''}`}>
                            <Card sx={{ maxWidth: 345 }} itemID={obj.key} onClick={searchResultSelected}>
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
                    : null
            }

            {
                displayLoadingSpinner ? 
                <div className="BookResults-loading-spinner-wrapper">
                    <CircularProgress /> 
                </div> 
                : null
            }
        </div>
    );
    return (
        <div className="BookResults">
            {data ? displayResultsJSX : noResultsJSX}
            {data ? 
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