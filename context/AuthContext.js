import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

const LS_USER_KEY = "mcdoodle.user";

export const AuthContext = createContext({
  user: null,
  login: () => { },
  logout: () => { },
  updateUser: () => { },
  onUserUpdated: () => { },
})

const Provider = ({ children }) => {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // check for user in localStorage. we'll do this as soon as the app loads.
  useEffect(() => {
    const localUser = localStorage.getItem(LS_USER_KEY);
    if (localUser) {
      setUser(JSON.parse(localUser));
    }
    setAuthReady(true);
  }, []);

  const updateUser = (val) => {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(val));
    setUser(val);
    dispatchUserChange(val);
  }

  const dispatchUserChange = (val) => {
    const userEvent = new CustomEvent('mcdoodleUserUpdated', { detail: JSON.stringify(val) });
    window.dispatchEvent(userEvent);
  }

  const login = (val) => {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(val));
    setUser(val);
    dispatchUserChange(val);
    const returnUrl = router.query?.returnUrl || '/'
    router.push(returnUrl)
  }

  const logout = (redirect = true) => {
    localStorage.removeItem(LS_USER_KEY);
    setUser(null);
    dispatchUserChange(null);
    if (redirect) {
      router.push('/login');
    }
  }

  const exposed = {
    user,
    login,
    logout,
    updateUser
  }

  // this essentially prevents the app from rendering until we have
  // a chance to check for the user. If we don't do this, we cannot
  // directly hit protected routes because the user object will be null
  // on the server, since we're storing it in localStorage.
  if (authReady) {
    return (
      <AuthContext.Provider value={exposed}>
        {children}
      </AuthContext.Provider>
    )
  } else {
    return null;
  }
}

export const useAuth = () => useContext(AuthContext);

export default Provider;
