import { getUserFromSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Dashboard() {
  const { userId, metadata, user } = await getUserFromSession();

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
