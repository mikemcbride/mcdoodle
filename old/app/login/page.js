import { useAuth } from '../../context/AuthContext.js';
import LoginForm from '../../components/LoginForm.js';

export default function Login() {
  const { login, logout } = useAuth()

  function handleLogin(val) {
    if (val === null) {
      logout()
    } else {
      login(val)
    }
  }

  return <LoginForm onLogin={handleLogin} />
} 