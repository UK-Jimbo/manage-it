import { getUserFromSession } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Account() {
    const { userId, metadata } = await getUserFromSession();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-4xl font-bold">Account Details</h1>

                <div className="mt-8 p-6 border rounded-lg shadow-md text-left bg-white dark:bg-gray-800">
                    <p><strong>User ID:</strong> {userId}</p>
                    <p><strong>Email:</strong> {metadata.email}</p>
                    <p><strong>Metadata:</strong></p>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded mt-2 overflow-auto max-w-md">
                        {JSON.stringify(metadata, null, 2)}
                    </pre>
                </div>

                <Link href="/protected/dashboard" className="mt-8">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </main>
        </div>
    );
}
