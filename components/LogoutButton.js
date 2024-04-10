import { useAuth } from '../context/AuthContext.js';

export default function LogoutButton() {
  const { logout } = useAuth();
  return <button className="text-white hover:underline" onClick={logout}>Log Out</button>;
}
