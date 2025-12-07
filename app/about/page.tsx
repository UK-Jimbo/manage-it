import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function About() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-4xl font-bold">About</h1>
                <p className="mt-4 text-xl max-w-2xl">
                    This project demonstrates a robust, self-hosted authentication foundation using SuperTokens and Next.js App Router.
                    It is designed to be easily portable by isolating auth logic in a library abstraction.
                </p>
                <Link href="/" className="mt-8">
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </main>
        </div>
    );
}
