import React, { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import SearchBar from '../SearchBar/SearchBar';
import axios from 'axios';
import './Home.css';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { useNavigate } from 'react-router-dom';
const CONST_SEARCH_TYPES_OBJ = {
    BOOK: 'Book',
    AUTHOR: 'Author'
}

const BOOK_SEARCH_URL_PREFIX = "http://openlibrary.org/search.json?title=";
const AUTHOR_SEARCH_URL_PREFIX = "http://openlibrary.org/search.json?author=";

const CONST_SEACRH_TYPES = [CONST_SEARCH_TYPES_OBJ.BOOK, CONST_SEARCH_TYPES_OBJ.AUTHOR];

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
        snackbarObj.current.message = "Unable to retrieve the search result. Please retry.";
        toggleSnackbar(true);
    };

    /**
     * Function to redirect the user to Book results / Author Results page or throw an error if the search result
     * isn't retrieved.
     */

    const onSubmitSearch = (searchObj) => {
        const query = searchObj.inputValue;
        if(searchObj.searchType === CONST_SEARCH_TYPES_OBJ.BOOK) {
            axios({
                method: "GET",
                url: BOOK_SEARCH_URL_PREFIX + encodeURI(query)
            }).then(response => {
                if(response.status !== 200 || response.data.numFound === 0) {
                    raiseSnackbarError();
                }
                else {
                    navigate(`bookresults?q=${query}`, {state: response.data});
                }
            });
        }
        else {
            axios({
                method: "GET",
                url: AUTHOR_SEARCH_URL_PREFIX + encodeURI(query)
            }).then(response => {
                if(response.status !== 200 || response.data.numFound === 0) {
                    raiseSnackbarError();
                }
                else {
                    navigate('authorresults', {state: response.data});
                }
            });
        }
    };

    return (
       <div className="Home">
           <div className="Home-SearchBar-wrapper">
                <SearchBar setClassName="Home-SearchBar" setPlaceHolder="Search Books, Authors" searchSubmit={onSubmitSearch} 
                searchTypes={CONST_SEACRH_TYPES} searchTypeDefault={CONST_SEARCH_TYPES_OBJ.BOOK}/>
            </div> 
       </div>
    );
};

export default Home;