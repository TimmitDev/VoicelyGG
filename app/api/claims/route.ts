import { NextRequest, NextResponse } from "next/server";
import { createClaim } from "@/lib/claims";

function redirectWithMessage(
  request: NextRequest,
  status: "success" | "error",
  message: string,
) {
  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("status", status);
  redirectUrl.searchParams.set("message", message);
  return NextResponse.redirect(redirectUrl, 303);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const email = String(formData.get("email") ?? "");

  const result = await createClaim({ username, email });

  if (!result.ok) {
    return redirectWithMessage(request, "error", result.error);
  }

  return redirectWithMessage(
    request,
    "success",
    `Username @${result.username} is succesvol geclaimd.`,
  );
}
