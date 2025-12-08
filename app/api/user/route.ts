import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    const data = await getUserFromSession();
    return Response.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: message }, { status: 401 });
  }
}
