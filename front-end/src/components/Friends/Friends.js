import React, { useContext } from 'react';
import './Friends.css';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import CountdownClock from '../CountdownClock/CountdownClock';

const Friends = () => {
    const width = useContext(ScreenWidthContext);
    return (
        <div className="Friends Home"> 
            <div className={`Home-count-down-wrapper ${width < 1200 ? 'mobile1200' : null}`}>
                <p>F.R.I.E.N.D.S feature development is in progress. Keep an eye out</p>
                <CountdownClock targetDate={"Dec 22, 2021 00:00:00"} />
            </div>
       </div>
    );
};

export default Friends;