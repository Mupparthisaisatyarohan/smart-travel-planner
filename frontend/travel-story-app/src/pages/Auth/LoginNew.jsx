import React, { useState } from 'react'
import './Login.css'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { validateEmail } from '../../utils/helper';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onChangeEmail = (event) => setEmail(event.target.value);
  const onChangePassword = (event) => setPassword(event.target.value);
  const onTogglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const onClickSubmit = async (event) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    try {
      const response = await axiosInstance.post('/api/login', {
        email: email.trim(),
        password,
      });
      console.log(response);
      if (response.data && !response.data.error) {
        localStorage.setItem('accessToken', response.data.accessToken);
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Login failed: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google authentication failed.');
      return;
    }

    try {
      const response = await axiosInstance.post('/google-auth', {
        idToken: credentialResponse.credential,
      });
      if (response.data && !response.data.error) {
        localStorage.setItem('accessToken', response.data.accessToken);
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Google login failed: ' + (response.data?.message || 'Unknown server error'));
      }
    } catch (error) {
      console.error('Google login failed:', error);
      toast.error('Google login error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed.');
  };

  const onClickCreateAccount = () => {
    navigate('/signup');
  };

  const passwordInputType = passwordVisible ? 'text' : 'password';
  return (
    <div className='login-container'>
      <div className='login-content'>
        <div className='login-info'>
          <div className='login-header'>
            <h4 className='login-heading'>Capture Your <br />Journeys </h4>
            <p className='login-para'>Record your travel experiences and memories in your personal travel journal.</p>
          </div>
        </div>
        <div>
          <form className='login-form' onSubmit={onClickSubmit}>
            <h4 className='login-form-heading'>Login</h4>
            <input type="email" placeholder='Email' className='email-input' onChange={onChangeEmail} value={email} />
            <div className='password-input-container'>
              <input type={passwordInputType} placeholder='Password' className='password-input' onChange={onChangePassword} value={password} />
              <span className='password-icon' onClick={onTogglePasswordVisibility}>
                {passwordVisible ? (<FaEyeSlash />) : (<FaEye />)}
              </span>
            </div>
            <button type="submit" className='login-button'>LOGIN</button>
            <p className='or-para'>Or</p>
            <div className='google-login-wrap'>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>
            <button type="button" className='create-account-button' onClick={onClickCreateAccount}>CREATE ACCOUNT</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
