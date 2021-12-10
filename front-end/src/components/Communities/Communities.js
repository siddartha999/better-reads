import React, { useContext } from 'react';
import './Communities.css';
import { ScreenWidthContext } from '../../contexts/ScreenWidthContext';
import CountdownClock from '../CountdownClock/CountdownClock';

const Communities = () => {
    const width = useContext(ScreenWidthContext);
    return (
        <div className="Communities Home"> 
            <div className={`Home-count-down-wrapper ${width < 1200 ? 'mobile1200' : null}`}>
                <p>Communities feature development is in progress. Keep an eye out</p>
                <CountdownClock targetDate={"Dec 22, 2021 00:00:00"} />
            </div>
       </div>
    );
};

export default Communities;