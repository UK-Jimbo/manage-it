"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter, usePathname } from "next/navigation";

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
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousPathnameRef = useRef<string | null>(null);
  const hasCompletedFetchRef = useRef(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state synchronously before render when pathname changes
  useLayoutEffect(() => {
    // Only reset if pathname actually changed
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      hasCompletedFetchRef.current = false;
      setData(null);
      setLoading(false);
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  }, [pathname]);

  useEffect(() => {
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Start a timer to show loading spinner only if fetch takes longer than 200ms
    loadingTimeoutRef.current = setTimeout(() => {
      if (!abortController.signal.aborted) {
        setLoading(true);
      }
    }, 200);

    fetch("/api/user", { cache: "no-store", signal: abortController.signal })
      .then(async (res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 401) {
          // Session expired - redirect to login immediately
          window.location.href = "/login";
          return null; // Return null to prevent further processing
        } else {
          throw new Error("Failed to load user data");
        }
      })
      .then((d) => {
        // Don't process if we're redirecting (d is null)
        if (d === null) return;
        
        if (d && d.error) {
          toast.error("Failed to load user data", {
            duration: 5000,
            style: {
              background: "var(--error-toast-bg)",
              color: "var(--error-toast-color)",
            },
          });
        } else if (d) {
          setData(d);
        }
      })
      .catch((error) => {
        // Ignore aborted requests
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        // Check if session refresh failed (token expired) or 401 error
        if (
          (error instanceof Error && error.message.includes("session refresh")) ||
          (error instanceof Error && error.message.includes("Session expired")) ||
          (error instanceof Error && error.message.includes("401"))
        ) {
          // Session expired - redirect to login
          window.location.href = "/login";
          return;
        }

        toast.error("Failed to load user data. Please try refreshing the page.", {
          duration: 5000,
          style: {
            background: "var(--error-toast-bg)",
            color: "var(--error-toast-color)",
          },
        });
      })
      .finally(() => {
        // Clear the loading timeout if it hasn't fired yet
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        
        // Only set loading to false if we're not redirecting
        if (!abortController.signal.aborted) {
          setLoading(false);
          hasCompletedFetchRef.current = true;
        }
        // Clear the ref when done
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      });

    return () => {
      abortController.abort();
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    };
  }, [pathname]);

  // Show loading spinner only if loading state is true (which only happens after 200ms delay)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Only show error state if fetch has completed and there's no data
  // If fetch hasn't completed yet, we'll wait (no spinner for fast loads, but also no error screen)
  if (!data && hasCompletedFetchRef.current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <p>Unable to load user data.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // If we don't have data yet but fetch hasn't completed, return null (blank screen)
  // This prevents showing error screen during fast navigation
  if (!data) {
    return null;
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

        <Link href="/debug" className="mt-8">
          <Button variant="outline">Back to Debug</Button>
        </Link>
      </main>
    </div>
  );
}
