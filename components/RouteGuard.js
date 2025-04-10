'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function RouteGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [authorized, setAuthorized] = useState(false);
    const { user } = useAuth();
    const userRef = useRef(user);

    useEffect(() => {
        // on initial load - run auth check 
        const url = [pathname, searchParams].join('?');
        userRef.current = user; // Keep the ref updated with latest user
        authCheck(url);

        // previously, user was never getting updated in this component after login.
        // we now dispatch an event from the AuthContext and listen for it here.
        // if we hear this event, we update the user. This fixes two issues:
        // 1. a person logs in and is unable to access protected routes until after a refresh.
        // 2. a person logs out but is able to hit protected routes anonymously.
        window.addEventListener('mcdoodleUserUpdated', (e) => {
            userRef.current = JSON.parse(e.detail) || null;
            // Re-run auth check when user changes via event
            authCheck(url);
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams, user]);

    function authCheck(url) {
        // redirect to login page if accessing a private page and not logged in 
        const restrictedPaths = []
        const privatePaths = ['/settings', '/new-poll'];
        const adminPaths = ['/admin', '/users'];
        const path = url.split('?')[0];

        // if user is an admin, allow access to admin paths.
        if (userRef.current?.isAdmin) {
            setAuthorized(true);
        } else {
            // not an admin
            restrictedPaths.push(...adminPaths);
            // check if logged in
            if (!userRef.current?.id) {
                restrictedPaths.push(...privatePaths);
            }
        }
        if (restrictedPaths.includes(path)) {
            setAuthorized(false);
            router.replace(`/login?returnUrl=${url}`);
        } else {
            setAuthorized(true);
        }
    }

    return (authorized && children);
}
