import React, { useContext, useState } from 'react';
import './NavSideBar.css';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import GroupsIcon from '@mui/icons-material/Groups';
import GroupIcon from '@mui/icons-material/Group';
import HomeIcon from '@mui/icons-material/Home';
import { NavLink } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import SearchBar from '../SearchBar/SearchBar';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;
const SEARCH_QUERY_PREFIX = "https://openlibrary.org/search.json?q=";

const ResponsiveDrawer = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const {user} = useContext(UserContext);
  const profilePicUrl = user.profile.profilePicUrl;
  const profileName = (user && user.profile && user.profile.name) ? user.profile.name : '';
  const profileNames = profileName.split(' ');
  const [displayLoadingSpinner, setDisplayLoadingSpinner] = useState(false);
  let nameCaps = profileNames[0][0];
  if(profileNames.length > 1) {
    nameCaps += profileNames.pop()[0]; 
  }
  const {raiseSnackbarMessage} = useContext(SnackbarContext);
  const navigate = useNavigate();
  const width = useContext(ScreenWidthContext);

  /**
     * Function to redirect the user to Book results page or raise an error if the search result
     * isn't retrieved.
     */

   const onSubmitSearch = async (searchObj) => {
      const query = searchObj.inputValue;
      setDisplayLoadingSpinner(true);
      const response = await axios({
          method: "GET",
          url: SEARCH_QUERY_PREFIX + encodeURI(query) + '&limit=10'
      });
      setDisplayLoadingSpinner(false);
      if(response.status !== 200 || response.data.numFound === 0) {
        raiseSnackbarMessage('Unable to fetch the Search result. Please try again later or try a different search', 'error');
      }
      else {
          navigate(`bookresults?q=${query}`, {state: response.data});
      }
  };

  /**
   * Handler to navigate the user to Profile page.
   */
  const handleProfileNavigation = () => {
    navigate(`/profile`);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
          <NavLink to="/" className="NavSideBar-item"> 
            <ListItem button key="Home" onClick={handleDrawerToggle}> 
                <ListItemIcon>
                    <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
            </ListItem>
          </NavLink>

        <NavLink to="/profile" className="NavSideBar-item" onClick={handleDrawerToggle}>
            <ListItem button key="Profile"> 
                <ListItemIcon>
                    <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
            </ListItem>
        </NavLink>

        <NavLink to="/mybooks" className="NavSideBar-item" onClick={handleDrawerToggle}> 
            <ListItem button key="My Books"> 
                <ListItemIcon>
                    <BookIcon />
                </ListItemIcon>
                <ListItemText primary="My Books" />
            </ListItem>
        </NavLink>
        

        <NavLink to="/friends" className="NavSideBar-item" onClick={handleDrawerToggle}>
            <ListItem button key="Friends"> 
                <ListItemIcon>
                    <GroupIcon />
                </ListItemIcon>
                <ListItemText primary="Friends" />
            </ListItem>
        </NavLink>

        <NavLink to="/communities" className="NavSideBar-item" onClick={handleDrawerToggle}>
            <ListItem button key="Communities"> 
                <ListItemIcon>
                    <GroupsIcon />
                </ListItemIcon>
                <ListItemText primary="Communities" />
            </ListItem>
        </NavLink>

      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }} className="NavSideBar">
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <div className="NavSideBar-user-profile-wrapper">

            <div className="NavSideBar-Search-wrapper">
              <SearchBar setPlaceHolder="Search Books/Authors" searchSubmit={onSubmitSearch} displayLoadingSpinner={displayLoadingSpinner} />
            </div>

            <div className="NavSideBar-user-profile-info-wrapper" title={profileName} onClick={handleProfileNavigation}> 
              <div className="NavSideBar-user-profile-pic-wrapper">
                  <img src={profilePicUrl} className="NavSideBar-user-profile-pic" />
              </div>
              <div className={`NavSideBar-user-profile-name-wrapper ${width < 700 ? 'no-display' : null}`}>
                  <p className={`NavSideBar-user-profile-name`}>{nameCaps}</p>
              </div>
            </div>

          </div>

        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
      </Box>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;
