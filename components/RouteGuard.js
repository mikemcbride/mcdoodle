import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function RouteGuard({ children }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    let { user } = useAuth();

    useEffect(() => {
        // on initial load - run auth check 
        authCheck(router.asPath);

        // previously, user was never getting updated in this component after login.
        // we now dispatch an event from the AuthContext and listen for it here.
        // if we hear this event, we update the user. This fixes two issues:
        // 1. a person logs in and is unable to access protected routes until after a refresh.
        // 2. a person logs out but is able to hit protected routes anonymously.
        window.addEventListener('mcdoodleUserUpdated', (e) => {
            user = JSON.parse(e.detail) || null
        })

        // on route change start - hide page content by setting authorized to false  
        const hideContent = () => setAuthorized(false);
        router.events.on('routeChangeStart', hideContent);

        // on route change complete - run auth check 
        router.events.on('routeChangeComplete', authCheck)

        // unsubscribe from events in useEffect return function
        return () => {
            router.events.off('routeChangeStart', hideContent);
            router.events.off('routeChangeComplete', authCheck);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function authCheck(url) {
        // redirect to login page if accessing a private page and not logged in 
        const privatePaths = ['/settings', '/new-poll'];
        const adminPaths = ['/admin', '/users'];
        const path = url.split('?')[0];
        const LS_USER_ID = user?.id
        // if user is an admin, allow access to admin paths.
        if (user?.isAdmin) {
            privatePaths.push(...adminPaths);
        }
        if (privatePaths.includes(path) && !LS_USER_ID) {
            setAuthorized(false);
            router.push({
                pathname: '/login',
                query: { returnUrl: router.asPath } // handle returnUrl in login form
            });
        } else {
            setAuthorized(true);
        }
    }

    return (authorized && children);
}
