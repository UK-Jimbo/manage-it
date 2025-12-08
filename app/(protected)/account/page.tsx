"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

interface UserData {
  userId: string;
  metadata: Record<string, unknown>;
  user: {
    emails: string[];
    // add other fields if needed
  } | null;
}

export default function Account() {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 401) {
          router.push("/login");
          return;
        } else {
          throw new Error("Failed to fetch user data");
        }
      })
      .then((d) => {
        if (d.error) {
          toast.error(d.error, {
            duration: 5000,
            style: {
              background: "var(--error-toast-bg)",
              color: "var(--error-toast-color)",
            },
          });
        } else {
          setData(d);
        }
      })
      .catch(() => {
        toast.error(
          "Failed to load user data. Please try refreshing the page.",
          {
            duration: 5000,
            style: {
              background: "var(--error-toast-bg)",
              color: "var(--error-toast-color)",
            },
          }
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

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
        <h1 className="text-4xl font-bold">Account Details</h1>

        <div className="mt-8 p-6 border rounded-lg shadow-md text-left bg-white dark:bg-gray-800">
          <p>
            <strong>User ID:</strong> {userId}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {user?.emails?.[0] || (metadata.email as string)}
          </p>
          <p>
            <strong>Metadata:</strong>
          </p>
          <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded mt-2 overflow-auto max-w-md">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>

        <Link href="/dashboard" className="mt-8">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </main>
    </div>
  );
}
