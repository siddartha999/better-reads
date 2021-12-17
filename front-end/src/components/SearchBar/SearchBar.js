import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import './SearchBar.css';
import ClearIcon from '@mui/icons-material/Clear';
import CircularProgress from '@mui/material/CircularProgress';

const SearchBar = (props) => {
    const className = props.setClassName || "";
    const placeholder = props.setPlaceHolder || "Better Reads search...";
    const [inputValue, setInputValue] = useState('');

    /**
     * Function to call the parent's search submit function with the value entered in the search field.
     * @param {*} event 
     */
    const submitSearch = (event) => {
        event.preventDefault();
        props.searchSubmit({
            inputValue: inputValue,
        });
    };

    /**
     * Handler to update the state of the search bar.
     */
    const handleChange = (event) => {
        setInputValue(event.target.value);
    };

    /**
     * Handler to clear the input entered in the search field.
     */
    const handleClearSearch = (event) => {
        setInputValue('');
    };

  return (
      <div className="SearchBar">
          <Paper className={className}
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
            >
            
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={placeholder}
                inputProps={{ 'aria-label': 'search google maps' }}
                onSubmit={submitSearch}
                value={inputValue}
                onChange={handleChange}
            />

            {
                props.displayLoadingSpinner ?
                    <div className="SearchBar-loading-spinner-wrapper">
                        <CircularProgress /> 
                    </div> 
                    :
                    <>
                        {
                            inputValue && inputValue.length > 0 ?
                                <ClearIcon className="Searchbar-clear" onClick={handleClearSearch} /> : null
                        }
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" onClick={submitSearch}>
                        <SearchIcon />
                        </IconButton>
                    </>
                    
            }

        </Paper>
      </div>
  );
};

export default SearchBar;
