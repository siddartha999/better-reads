import React, { useState } from 'react';
import './CountdownClock.css';

const CountdownClock = (props) => {
    const countDownDate = new Date(props.targetDate || "Jan 06, 2022 00:00:00").getTime();
    let [countDownValue, setCountDownValue] = useState("");
    const interval = setInterval(function() {
        // Get today's date and time
        var now = new Date().getTime();
          
        // Find the distance between now and the count down date
        var distance = countDownDate - now;
          
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
        setCountDownValue(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");
        // If the count down is over, write some text 
        if (distance < 0) {
          clearInterval(interval);
          setCountDownValue("The latest features are on their way!");
        }
      }, 1000);

    return (
        <div className="CountdownClock">
            {countDownValue}
        </div>
    );
};

export default CountdownClock;