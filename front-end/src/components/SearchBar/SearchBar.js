import React, { useRef, useState } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const SearchBar = (props) => {
    const className = props.setClassName || "";
    const placeholder = props.setPlaceHolder || "Better Reads search...";
    const inputValue = useRef(null);
    const [searchTypeValue, setSearchTypeValue] = useState(props.searchTypeDefault);

    /**
     * Function to call the parent's search submit function with the value entered in the search field.
     * @param {*} event 
     */
    const submitSearch = (event) => {
        event.preventDefault();
        props.searchSubmit({
            inputValue: inputValue.current.querySelector('input').value,
            searchType: searchTypeValue
        });
    };

    /** 
     * Function to keep track of the current search-type value.
    */
    const handleSearchTypeChange = (event) => {
        setSearchTypeValue(event.target.value);
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
                ref = {inputValue}
            />

            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-standard-label">Type</InputLabel>
                <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                onChange={handleSearchTypeChange}
                value = {searchTypeValue}
                label="Search"
                >
                    {props.searchTypes.map(value => <MenuItem value={value} key={value}> {value} </MenuItem>)}

                </Select>
            </FormControl>

            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" onClick={submitSearch}>
                <SearchIcon />
            </IconButton>
        </Paper>
      </div>
  );
};

export default SearchBar;
