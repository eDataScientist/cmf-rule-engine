import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeactivateCompanyRequest {
  company_id: string;
}

function getServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service credentials");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function getUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase anon credentials");
  }

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });
}

function parseRequest(body: unknown): DeactivateCompanyRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const maybeBody = body as Partial<DeactivateCompanyRequest>;
  const companyId = maybeBody.company_id?.trim();

  if (!companyId) {
    throw new Error("Missing required field: company_id");
  }

  return { company_id: companyId };
}

async function assertAdminCaller(authHeader: string): Promise<{ userId: string }> {
  const userClient = getUserClient(authHeader);
  const serviceClient = getServiceClient();

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { data: profile, error: profileError } = await serviceClient
    .from("user_profiles")
    .select("role, is_active")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    throw new Error(`Failed to load caller profile: ${profileError.message}`);
  }

  if (!profile?.is_active || profile.role !== "admin") {
    throw new Error("Only admins can deactivate companies");
  }

  return { userId: user.id };
}

async function deactivateCompanyAndUsers(
  companyId: string
): Promise<{ affectedUserIds: string[] }> {
  const serviceClient = getServiceClient();

  const { data: company, error: companyError } = await serviceClient
    .from("companies")
    .select("id, is_active")
    .eq("id", companyId)
    .single();

  if (companyError || !company) {
    throw new Error("Company not found");
  }

  const { data: users, error: usersError } = await serviceClient
    .from("user_profiles")
    .select("user_id")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (usersError) {
    throw new Error(`Failed to load company users: ${usersError.message}`);
  }

  const affectedUserIds = (users ?? [])
    .map((row) => row.user_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  const { error: companyUpdateError } = await serviceClient
    .from("companies")
    .update({ is_active: false })
    .eq("id", companyId);

  if (companyUpdateError) {
    throw new Error(`Failed to deactivate company: ${companyUpdateError.message}`);
  }

  const { error: profileUpdateError } = await serviceClient
    .from("user_profiles")
    .update({ is_active: false })
    .eq("company_id", companyId);

  if (profileUpdateError) {
    throw new Error(`Failed to deactivate company users: ${profileUpdateError.message}`);
  }

  return { affectedUserIds };
}

async function revokeSessions(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;

  const serviceClient = getServiceClient();
  const adminApi = serviceClient.auth.admin as unknown as {
    signOut?: (userId: string) => Promise<{ error?: { message?: string } }>;
  };

  if (typeof adminApi.signOut !== "function") {
    console.warn("auth.admin.signOut is unavailable in this runtime; skipped session revocation.");
    return;
  }

  for (const userId of userIds) {
    const result = await adminApi.signOut(userId);
    if (result?.error) {
      console.warn(`Failed to revoke sessions for ${userId}: ${result.error.message ?? "unknown error"}`);
    }
  }
}

async function writeAuditLog(
  actorUserId: string,
  companyId: string,
  affectedUserIds: string[]
): Promise<void> {
  const serviceClient = getServiceClient();

  const { error } = await serviceClient
    .from("admin_activity_log")
    .insert({
      user_id: actorUserId,
      action: "deactivate_company",
      target_type: "company",
      target_id: companyId,
      details: {
        deactivated_user_count: affectedUserIds.length,
        deactivated_user_ids: affectedUserIds,
      },
    });

  if (error) {
    throw new Error(`Failed to write audit log: ${error.message}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const body = await req.json();
    const payload = parseRequest(body);
    const { userId: actorUserId } = await assertAdminCaller(authHeader);
    const { affectedUserIds } = await deactivateCompanyAndUsers(payload.company_id);

    await revokeSessions(affectedUserIds);
    await writeAuditLog(actorUserId, payload.company_id, affectedUserIds);

    return new Response(
      JSON.stringify({
        success: true,
        company_id: payload.company_id,
        deactivated_user_count: affectedUserIds.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
