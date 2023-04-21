import { useRouter } from 'next/router'
import LoginForm from '../components/LoginForm.js';

export default function Login() {
  const router = useRouter()
  function handleLogin() {
    // on login, check returnUrl query param.
    // if not exists, route to /
    const returnUrl = router.query?.returnUrl || '/'
    router.push(returnUrl)
  }

  return <LoginForm onLogin={handleLogin} />
}
