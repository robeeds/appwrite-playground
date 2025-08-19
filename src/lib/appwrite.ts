// lib/appwrite.ts
// Centralized Appwrite auth helpers + form validation for register & login
// NOTE: Import this module only from client-side code (e.g., Next.js Client Components or use dynamic import with ssr:false)

import { Client, Account, ID, Avatars, Models, OAuthProvider, AppwriteException } from "appwrite";
import { z } from "zod";

/**
 * Environment
 */
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

/**
 * Singleton Account instance
 */
let _account: Account | null = null;

function getAccount(): Account {
  if (_account) return _account;
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    throw new Error(
      "Missing Appwrite env vars: NEXT_PUBLIC_APPWRITE_ENDPOINT / NEXT_PUBLIC_APPWRITE_PROJECT_ID"
    );
  }
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  _account = new Account(client);
  return _account;
}

/**
 * Validation Schemas (Zod)
 */
export const RegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterValues = z.infer<typeof RegisterSchema>;
export type LoginValues = z.infer<typeof LoginSchema>;

/** Result helpers */
export type ValidationErrorMap = Record<string, string[]>;
export type Result<T> = { ok: true; data: T } | { ok: false; message?: string; errors?: ValidationErrorMap };

function zodErrorsToMap(issues: z.ZodIssue[]): ValidationErrorMap {
  const map: ValidationErrorMap = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    map[key] = map[key] || [];
    map[key].push(issue.message);
  }
  return map;
}

/**
 * PUBLIC: Validate without contacting Appwrite (useful for forms)
 */
export function validateRegister(values: Partial<RegisterValues>): Result<RegisterValues> {
  const parse = RegisterSchema.safeParse(values);
  if (!parse.success) {
    return { ok: false, errors: zodErrorsToMap(parse.error.issues) };
  }
  return { ok: true, data: parse.data };
}

export function validateLogin(values: Partial<LoginValues>): Result<LoginValues> {
  const parse = LoginSchema.safeParse(values);
  if (!parse.success) {
    return { ok: false, errors: zodErrorsToMap(parse.error.issues) };
  }
  return { ok: true, data: parse.data };
}

/**
 * AUTH ACTIONS (call from client-side event handlers)
 */
export async function registerAndLogin(values: Partial<RegisterValues>): Promise<Result<Models.Session>> {
  const valid = validateRegister(values);
  if (!valid.ok) return valid as unknown as Result<Models.Session>;
  const { name, email, password } = valid.data;
  try {
    const account = getAccount();
    await account.create(ID.unique(), email, password, name); // create user
    const session = await account.createEmailPasswordSession(email, password); // sign in
    return { ok: true, data: session };
  } catch (err: unknown) {
    let message = "Registration failed";
    if (err instanceof AppwriteException) {
      message = err.message || message;
    }
    return { ok: false, message };
  }
}

export async function loginWithEmail(values: Partial<LoginValues>): Promise<Result<Models.Session>> {
  const valid = validateLogin(values);
  if (!valid.ok) return valid as unknown as Result<Models.Session>;
  const { email, password } = valid.data;
  try {
    const account = getAccount();
    const session = await account.createEmailPasswordSession(email, password);
    return { ok: true, data: session };
  } catch (err: unknown) {
    let message = "Login failed";
    if (err instanceof AppwriteException) {
      message = err.message || message;
    }
    return { ok: false, message };
  }
}

export async function logoutCurrent(): Promise<Result<true>> {
  try {
    const account = getAccount();
    await account.deleteSession("current");
    return { ok: true, data: true };
  } catch (err: unknown) {
    let message = "Logout failed";
    if (err instanceof AppwriteException) {
      message = err.message || message;
    }
    return { ok: false, message };
  }
}

export async function logoutAll(): Promise<Result<true>> {
  try {
    const account = getAccount();
    await account.deleteSessions();
    return { ok: true, data: true };
  } catch (err: unknown) {
    let message = "Failed to logout all sessions";
    if (err instanceof AppwriteException) {
      message = err.message || message;
    }
    return { ok: false, message };
  }
}

/** Get the current user **/
export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    const account = getAccount();
    return await account.get();
  } catch {
    return null;
  }
}

/** Retrieve the User avatar (Currently only supports intiitals)**/
export async function getUserAvatar(name: string): Promise<string | null> {
  try {
    const avatars = new Avatars(getAccount().client);
    return await avatars.getInitials(name, 32, 32);
  } catch (err: unknown) {
    console.error("Failed to fetch user avatar", err);
    return null;
  }
}

/** Email verification */
export async function sendVerification(redirectUrl: string): Promise<Result<true>> {
  try {
    const account = getAccount();
    await account.createVerification(redirectUrl);
    return { ok: true, data: true };
  } catch (err: unknown) {
    let message = "Failed to send verification email";
    if (err instanceof AppwriteException) {
      message = err.message || message;
    }
    return { ok: false, message };
  }
}

export async function confirmVerification(userId: string, secret: string): Promise<Result<true>> {
  try {
    const account = getAccount();
    await account.updateVerification(userId, secret);
    return { ok: true, data: true };
  } catch (err: unknown) {
    let message = "Verification failed";
    if (err instanceof AppwriteException) {
      message = err.message || message;
    }
    return { ok: false, message };
  }
}

/** Password recovery */
export async function requestPasswordReset(email: string, redirectUrl: string): Promise<Result<true>> {
  try {
    const account = getAccount();
    await account.createRecovery(email, redirectUrl);
    return { ok: true, data: true };
  } catch (err: unknown) {
    let message = "Failed to send password reset email";
    if (err instanceof AppwriteException) {
      message = err.message || message;
    }
    return { ok: false, message };
  }
}

export async function confirmPasswordReset(
  userId: string,
  secret: string,
  newPassword: string,
  confirmPassword: string
): Promise<Result<true>> {
  // quick local validation for password/confirm
  const passCheck = RegisterSchema.pick({ password: true, confirm: true }).safeParse({
    password: newPassword,
    confirm: confirmPassword,
  });
  if (!passCheck.success) {
    return { ok: false, errors: zodErrorsToMap(passCheck.error.issues) };
  }
  try {
    const account = getAccount();
    await account.updateRecovery(userId, secret, newPassword);
    return { ok: true, data: true };
  } catch (err: unknown) {
    let message = "Failed to reset password";
    if (err instanceof AppwriteException) {
      message = err.message || message;
    }
    return { ok: false, message };
  }
}

/** OAuth */
export function oauthLogin(provider: "google" | "github" | string, successUrl?: string, failureUrl?: string): void {
  const account = getAccount();
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const success = successUrl || `${base}/auth/callback`;
  account.createOAuth2Session(provider as OAuthProvider, success, failureUrl || success);
}

/**
 * Example usage in a Client Component
 *
 * const res = await registerAndLogin({ name, email, password, confirm })
 * if (!res.ok) setErrors(res.errors || { form: [res.message ?? 'Something went wrong'] })
 */
