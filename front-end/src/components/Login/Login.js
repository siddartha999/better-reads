import React, { useContext } from 'react';
import './Login.css';
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';

function Login() {
    const {user, setUser} = useContext(UserContext);
    const responseGoogle = (res) => {
        axios({
            method: "POST",
            url: process.env.REACT_APP_SERVER_URL + "/api/login/googlelogin",
            data: {tokenId: res.tokenId}
        }).then(response => {
            if(response.status === 400) {
                alert(response.data.error);
            }
            else {
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

    const responseFacebook = (response) => {
        console.log(response);
    };

    return(
       <div className="Login">
           <div className="Login-header">
               <div className="Login-header-title-wrapper">
                    <img src={process.env.PUBLIC_URL + "/Logo.png"} />
                    <p className="Login-header-title">Better Reads</p>
               </div>
                <p className="Login-header-caption">A social network for Bookworms!</p>
           </div>
            <div className="Login-wrapper">
                <div className="Login-google">
                    <GoogleLogin
                        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                        buttonText="Continue with Google"
                        onSuccess={responseGoogle}
                        onFailure={responseFailureGoogle}
                        cookiePolicy={'single_host_origin'}
                    />
                </div>
            </div>
       </div>
    );
}

export default Login;