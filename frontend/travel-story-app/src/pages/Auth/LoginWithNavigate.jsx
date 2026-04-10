import { useNavigate } from 'react-router-dom';
import Login from './Login';

const LoginWithNavigate = (props) => {
  const navigate = useNavigate();
  return <Login {...props} navigate={navigate} />;
};

export default LoginWithNavigate;
