import React, { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();
  
    return (
       <div className="Home"> 
       <p>Home Page</p>
       </div>
    );
};

export default Home;