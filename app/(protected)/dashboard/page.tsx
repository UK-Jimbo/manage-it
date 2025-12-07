'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface UserData {
  userId: string;
  metadata: Record<string, unknown>;
  user: Record<string, unknown> | null;
}

export default function Dashboard() {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user')
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Failed to fetch user data');
        }
      })
      .then(d => {
        if (d.error) {
          toast.error(d.error, { duration: 5000, style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #dc2626' } });
        } else {
          setData(d);
        }
      })
      .catch(() => {
        toast.error('Failed to load user data. Please try refreshing the page.', { duration: 5000, style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #dc2626' } });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <p>Unable to load user data.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const { userId, metadata, user } = data;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold">
          Welcome,{" "}
          <span className="text-blue-600">
            {user?.emails?.[0] || metadata.email || userId}
          </span>
        </h1>
        <p className="mt-4 text-xl">This is a protected dashboard.</p>

        <div className="mt-8 flex gap-4">
          <Link href="/account">
            <Button variant="outline">Account Details</Button>
          </Link>
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
