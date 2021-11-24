import React, { useContext } from 'react'
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';

function Login() {
    const {user, setUser} = useContext(UserContext);
    const responseGoogle = (res) => {
        console.log(res);
        axios({
            method: "POST",
            url: process.env.REACT_APP_SERVER_URL + "/api/login/googlelogin",
            data: {tokenId: res.tokenId}
        }).then(response => {
            if(response.status === 400) {
                alert(response.data.error);
            }
            else {
                console.log('Google Login success');
                console.log(response);
                const userObj = {
                    token: response.data.token,
                    profile: response.data.user
                };
                localStorage.setItem("betterreadsuserinfo", JSON.stringify(userObj));
                setUser(userObj);
            }
        });
    };

    const responseFailureGoogle = (res) => {
        //alert('Unable to Login via Google OAUTH. Please try again!');
    };

    return(
        <GoogleLogin
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        buttonText="Continue with Google"
        onSuccess={responseGoogle}
        onFailure={responseFailureGoogle}
        cookiePolicy={'single_host_origin'}
      />
    );
}

export default Login;