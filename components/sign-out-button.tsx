'use client';

import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
    return (
        <Button variant="destructive" onClick={() => signOut()}>
            Sign Out
        </Button>
    );
}
