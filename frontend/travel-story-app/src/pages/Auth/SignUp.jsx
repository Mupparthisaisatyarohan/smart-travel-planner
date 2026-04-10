import './Login.css'
import { FaEye,FaEyeSlash } from "react-icons/fa";
import axiosInstance from '../../utils/axiosInstance';
import { Component }  from 'react';
import { validateEmail } from '../../utils/helper';

class SignUp extends Component {
  
  state = {
    passwordVisible: false,
    email: '',
    password: '',
    fullname:""
  };
  onChangeEmail = (event) => {
    this.setState({ email: event.target.value });
  }
  onChangePassword = (event) => {
    this.setState({ password: event.target.value });
  }
  onChangeFullname = (event) => {
    this.setState({ fullname: event.target.value });
  }
  onTogglePasswordVisibility = () => {
    this.setState((prevState) => ({
      passwordVisible: !prevState.passwordVisible,
    }));
  }
  onClickSubmit =async (event) => {
    const { password } = this.state;
    event.preventDefault();
    if (!validateEmail(this.state.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if(!password){
      alert('Please enter your password.');
      return;
    }

    //Login API call
    try{
      const response=await axiosInstance.post('/login',{
        email:this.state.email,
        password:password
      });

      //Handle successful response
      console.log(response);
      if(response.data && !response.data.error){
        if (response.data && !response.data.error) {
        localStorage.setItem('accessToken', response.data.accessToken);
        alert('Login successful!');
        this.props.navigate('/');   // redirect to home
      }

      }else{
        alert('Login failed: ' + response.data.message);
      }
    }catch(error){
      //Handle error response
      console.error('Login failed:',error);
    }
  }
  render(){
    
    const { passwordVisible,email,password,fullname } = this.state;
    let passwordInputType = passwordVisible ? 'text' : 'password';    
    return (
    <div className='login-container'>
      <div className='login-content'>
        <div className='login-info'>
          <div className='login-header'>
            <h4 className='login-heading'>Capture Your <br/>Journeys </h4>
            <p className='login-para'>Record your travel experiences and memories in your personal travel journal.</p>
          </div>
        </div>
        <div >
          <form className='login-form' onSubmit={this.onClickSubmit}>
            <h4 className='login-form-heading'>Sign Up</h4>
            <input type="text" placeholder='Full Name' className='email-input' onChange={this.onChangeFullname} value={fullname} />
            <input type="email" placeholder='Email' className='email-input' onChange={this.onChangeEmail} value={email} />
            <div className='password-input-container'>
              <input type={passwordInputType} placeholder='Password' className='password-input' onChange={this.onChangePassword} value={password} />
              <span className='password-icon' onClick={this.onTogglePasswordVisibility}>
                {passwordVisible ? (<FaEyeSlash/>) : (<FaEye/>)}
              </span>
            </div>
            <button type="submit" className='login-button'>CREATE ACCOUNT</button>
            <p className='or-para'>Or</p>
            <button type="button" className='create-account-button'>LOGIN</button>
          </form>
        </div>
      </div>
    </div>
  )
  }
}

export default SignUp