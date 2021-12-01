import React, { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();
  
    return (
       <div className="Home"> 
       </div>
    );
};

export default Home;