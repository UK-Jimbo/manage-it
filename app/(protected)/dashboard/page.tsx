"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
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

export default function Dashboard() {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousPathnameRef = useRef<string | null>(null);
  const hasCompletedFetchRef = useRef(false);

  // Reset state synchronously before render when pathname changes
  useLayoutEffect(() => {
    // Only reset if pathname actually changed
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      hasCompletedFetchRef.current = false;
      setData(null);
      setLoading(true);
    }
  }, [pathname]);

  useEffect(() => {
    // Ensure loading state is set immediately
    setLoading(true);
    
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    fetch("/api/user", { cache: "no-store", signal: abortController.signal })
      .then(async (res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 401) {
          router.push("/login");
          return;
        } else {
          // For non-401 errors, try to get error message from response
          try {
            const data = await res.json();
            throw new Error(data.error || `Server error (${res.status})`);
          } catch (parseError) {
            // If response isn't valid JSON, create error based on status
            if (res.status === 500) {
              throw new Error("Server error: Unable to connect to the database. Please ensure Docker containers are running.");
            }
            throw new Error(`Server error (${res.status})`);
          }
        }
      })
      .then((d) => {
        if (d && d.error) {
          toast.error(d.error, {
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

        let errorMessage = "Failed to load user data. Please try refreshing the page.";
        
        // Check if it's a network error (backend unavailable)
        if (error instanceof TypeError && (error.message.includes("fetch") || error.message.includes("Failed to fetch"))) {
          errorMessage = "Unable to connect to the server. Please ensure the backend services are running (e.g., Docker containers).";
        } 
        // Check if error message indicates database/backend issues
        else if (error instanceof Error) {
          const message = error.message.toLowerCase();
          if (
            message.includes("unavailable") ||
            message.includes("database connection") ||
            message.includes("connection failed") ||
            message.includes("server error") ||
            message.includes("docker containers")
          ) {
            errorMessage = error.message;
          }
        }
        
        toast.error(errorMessage, {
          duration: 5000,
          style: {
            background: "var(--error-toast-bg)",
            color: "var(--error-toast-color)",
          },
        });
      })
      .finally(() => {
        setLoading(false);
        hasCompletedFetchRef.current = true;
        // Clear the ref when done
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      });

    return () => {
      abortController.abort();
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    };
  }, [pathname]);

  // Show loading if we're loading OR if we haven't completed a fetch yet
  if (loading || !hasCompletedFetchRef.current) {
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
            {user?.emails?.[0] || (metadata.email as string) || userId}
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
