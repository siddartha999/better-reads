import React, { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import SearchBar from '../SearchBar/SearchBar';
import axios from 'axios';
import './Home.css';
import { SnackbarContext } from '../../contexts/SnackbarContext';
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

    /**
     * Function to raise the error message when the search result isn't retrieved.
     */
    const raiseSnackbarError = () => {
        snackbarObj.current = {}; 
        snackbarObj.current.severity = "error";
        snackbarObj.current.message = "Unable to retrieve the search result. Please retry.";
        toggleSnackbar(true);
    };

    const onSubmitSearch = (searchObj) => {
        const query = searchObj.inputValue;
        if(searchObj.searchTypeValue == CONST_SEARCH_TYPES_OBJ.BOOK) {
            axios({
                method: "GET",
                url: BOOK_SEARCH_URL_PREFIX + encodeURI(query)
            }).then(response => {
                console.log(response);
                console.lop(response.data.numFound);
                if(response.status !== 200 || response.data.numFound == 0) {
                    raiseSnackbarError();
                }
            });
        }
        else {
            axios({
                method: "GET",
                url: AUTHOR_SEARCH_URL_PREFIX + encodeURI(query)
            }).then(response => {
                console.log(response);
                if(response.status !== 200 || response.data.numFound == 0) {
                    raiseSnackbarError();
                }
            });
        }
    };

    return (
       <div className="Home">
            <div className="Home-SearchBar-wrapper">
                <SearchBar setClassName="Home-SearchBar" setPlaceHolder="Search Books, Authors" searchSubmit={onSubmitSearch} 
                searchTypes={CONST_SEACRH_TYPES} searchTypeDefault={CONST_SEACRH_TYPES[0]}/>
            </div>
       </div>
    );
};

export default Home;