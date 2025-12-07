import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-600">Project Manager</span>
        </h1>

        <p className="mt-3 text-2xl">
          A self-hosted, future-portable Next.js app with SuperTokens auth.
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link href="/login">
            <Button className="m-4" size="lg">Login</Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" className="m-4" size="lg">About</Button>
          </Link>
          <Link href="/protected/dashboard">
            <Button variant="secondary" className="m-4" size="lg">Dashboard (Protected)</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
