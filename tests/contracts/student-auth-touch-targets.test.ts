import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const passwordField = read("src/fsd/shared/ui/PasswordField.tsx");
const signupForm = read("src/fsd/features/signup/ui/SignupForm.tsx");
const resetForm = read("src/fsd/features/reset-password/ui/ResetPasswordForm.tsx");

assert.match(passwordField, /h-11 w-11/);
assert.match(signupForm, /min-h-11/);
assert.match(resetForm, /min-h-11/);
