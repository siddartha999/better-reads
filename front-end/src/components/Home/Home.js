import React, { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import CountdownClock from '../CountdownClock/CountdownClock';

const Home = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();
    const width = useContext(ScreenWidthContext);
  
    return (
       <div className="Home"> 
            <div className={`Home-count-down-wrapper ${width < 1200 ? 'mobile1200' : null}`}>
                <p>Home tab feature development is in progress. Keep an eye out</p>
                <CountdownClock targetDate={"Dec 22, 2021 00:00:00"} />
            </div>
       </div>
    );
};

export default Home;