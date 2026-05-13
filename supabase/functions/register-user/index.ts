import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type RegisterUserRole = "client_admin" | "client_user";

interface RegisterUserRequest {
  email: string;
  full_name: string;
  company_id: string;
  role: RegisterUserRole;
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

function parseAndValidateBody(body: unknown): RegisterUserRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const maybeBody = body as Partial<RegisterUserRequest>;
  const email = maybeBody.email?.trim().toLowerCase();
  const fullName = maybeBody.full_name?.trim();
  const companyId = maybeBody.company_id?.trim();
  const role = maybeBody.role;

  if (!email || !fullName || !companyId || !role) {
    throw new Error("Missing required fields: email, full_name, company_id, role");
  }

  if (role !== "client_admin" && role !== "client_user") {
    throw new Error("Invalid role. Allowed values: client_admin, client_user");
  }

  return {
    email,
    full_name: fullName,
    company_id: companyId,
    role,
  };
}

async function assertAdminCaller(authHeader: string): Promise<{ userId: string }> {
  const userClient = getUserClient(authHeader);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const serviceClient = getServiceClient();
  const { data: profile, error: profileError } = await serviceClient
    .from("user_profiles")
    .select("role, is_active")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    throw new Error(`Failed to load caller profile: ${profileError.message}`);
  }

  if (!profile?.is_active || profile.role !== "admin") {
    throw new Error("Only admins can register users");
  }

  return { userId: user.id };
}

async function assertCompanyHasSlots(companyId: string): Promise<void> {
  const serviceClient = getServiceClient();

  const { data: company, error: companyError } = await serviceClient
    .from("companies")
    .select("id, is_active, max_user_slots")
    .eq("id", companyId)
    .single();

  if (companyError || !company) {
    throw new Error("Company not found");
  }

  if (!company.is_active) {
    throw new Error("Cannot register users for an inactive company");
  }

  const { count, error: countError } = await serviceClient
    .from("user_profiles")
    .select("user_id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (countError) {
    throw new Error(`Failed to check company slots: ${countError.message}`);
  }

  if ((count ?? 0) >= company.max_user_slots) {
    throw new Error("Company has reached max user slots");
  }
}

async function createUserAndProfile(
  payload: RegisterUserRequest,
  invitedBy: string
): Promise<{ userId: string }> {
  const serviceClient = getServiceClient();

  const { data: createdUser, error: createUserError } =
    await serviceClient.auth.admin.createUser({
      email: payload.email,
      email_confirm: true,
      user_metadata: {
        full_name: payload.full_name,
      },
      app_metadata: {
        role: payload.role,
        company_id: payload.company_id,
      },
    });

  if (createUserError || !createdUser.user) {
    throw new Error(`Failed to create auth user: ${createUserError?.message ?? "Unknown error"}`);
  }

  const newUserId = createdUser.user.id;

  const { error: profileInsertError } = await serviceClient
    .from("user_profiles")
    .insert({
      user_id: newUserId,
      email: payload.email,
      company_id: payload.company_id,
      role: payload.role,
      full_name: payload.full_name,
      is_active: true,
      invited_by: invitedBy,
    });

  if (profileInsertError) {
    await serviceClient.auth.admin.deleteUser(newUserId);
    throw new Error(`Failed to create user profile: ${profileInsertError.message}`);
  }

  return { userId: newUserId };
}

async function writeAuditLog(
  actorUserId: string,
  targetUserId: string,
  payload: RegisterUserRequest
): Promise<void> {
  const serviceClient = getServiceClient();

  const { error } = await serviceClient.from("admin_activity_log").insert({
    user_id: actorUserId,
    action: "register_user",
    target_type: "user",
    target_id: targetUserId,
    details: {
      email: payload.email,
      company_id: payload.company_id,
      role: payload.role,
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
    const payload = parseAndValidateBody(body);
    const { userId: actorUserId } = await assertAdminCaller(authHeader);

    await assertCompanyHasSlots(payload.company_id);
    const { userId: targetUserId } = await createUserAndProfile(payload, actorUserId);
    await writeAuditLog(actorUserId, targetUserId, payload);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: targetUserId,
        email: payload.email,
        company_id: payload.company_id,
        role: payload.role,
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
