'use client';

import { SuperTokensWrapper } from 'supertokens-auth-react';
import { initAuth } from '@/lib/auth/client';
import { useState } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loaded, setLoaded] = useState(false);

    if (typeof window !== 'undefined' && !loaded) {
        initAuth();
        setLoaded(true);
    }

    return (
        <SuperTokensWrapper>
            {children}
        </SuperTokensWrapper>
    );
}
