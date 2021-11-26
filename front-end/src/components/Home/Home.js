import React, { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import SearchBar from '../SearchBar/SearchBar';
import axios from 'axios';
import './Home.css';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { useNavigate } from 'react-router-dom';

const SEARCH_QUERY_PREFIX = "http://openlibrary.org/search.json?q=";

function Home() {
    const {user} = useContext(UserContext);
    const {snackbarOpen, toggleSnackbar, snackbarObj} = useContext(SnackbarContext);
    const navigate = useNavigate();
    /**
     * Function to raise the error message when the search result isn't retrieved.
     */
    const raiseSnackbarError = () => {
        snackbarObj.current = {}; 
        snackbarObj.current.severity = "error";
        snackbarObj.current.message = "Unable to retrieve the search result. Please retry";
        toggleSnackbar(true);
    };

    /**
     * Function to redirect the user to Book results / Author Results page or throw an error if the search result
     * isn't retrieved.
     */

    const onSubmitSearch = async (searchObj) => {
        const query = searchObj.inputValue;
        const response = await axios({
            method: "GET",
            url: SEARCH_QUERY_PREFIX + encodeURI(query)
        });

        if(response.status !== 200 || response.data.numFound === 0) {
            raiseSnackbarError();
        }
        else {
            navigate(`bookresults?q=${query}`, {state: response.data});
        }
    };

    return (
       <div className="Home">
           <div className="Home-SearchBar-wrapper">
                <SearchBar setClassName="Home-SearchBar" setPlaceHolder="Search Books, Authors" searchSubmit={onSubmitSearch} />
            </div> 
       </div>
    );
};

export default Home;