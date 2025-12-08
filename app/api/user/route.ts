import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    const data = await getUserFromSession();
    return Response.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    
    // Determine appropriate status code based on error type
    let status = 401;
    const errorMessage = message.toLowerCase();
    
    // If it's a database/backend connection issue, return 500
    if (
      errorMessage.includes("unavailable") ||
      errorMessage.includes("database connection") ||
      errorMessage.includes("connection failed") ||
      errorMessage.includes("no supertokens core available")
    ) {
      status = 500;
    }
    
    return Response.json({ error: message }, { status });
  }
}
