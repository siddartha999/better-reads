import React, { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';

function Home() {
    const {user} = useContext(UserContext);
    return (
        <p>Welcome to Home Page</p>
    );
};

export default Home;