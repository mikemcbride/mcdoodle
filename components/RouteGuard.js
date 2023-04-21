import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RouteGuard({ children }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // on initial load - run auth check 
        authCheck(router.asPath);

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
        const privatePaths = ['/admin'];
        const path = url.split('?')[0];
        let LS_USER_ID = window.localStorage.getItem('mcdoodle.userId')
        if (privatePaths.includes(path) && LS_USER_ID === null) {
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
