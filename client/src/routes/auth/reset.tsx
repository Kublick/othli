import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Label } from "@radix-ui/react-label";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const TokenSchema = z.object({
  token: z.string(),
});

interface RouteData {
  success: boolean;
  token?: string;
}

export const Route = createFileRoute("/auth/reset")({
  validateSearch: TokenSchema,
  beforeLoad: async ({ search }): Promise<RouteData> => {
    if (!search.token) {
      return {
        success: false,
      };
    }
    return {
      success: true,
      token: search.token,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetStatus, setResetStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const { token } = Route.useRouteContext();

  const requirements = [
    { text: "Al menos 8 caracteres", met: password.length >= 8 },
    { text: "Al menos una letra mayuscula", met: /[A-Z]/.test(password) },
    { text: "Al menos uma letra minuscula", met: /[a-z]/.test(password) },
    { text: "Al menos un numero", met: /[0-9]/.test(password) },
    {
      text: "Al menos un caracter especial",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const { data, error } = await authClient.resetPassword({
        token,
        newPassword: password,
      });

      console.log(data);
      if (error) {
        setErrorMessage(
          error.message ?? "Ocurrio un error al restablecer la constraseña"
        );
        setResetStatus("error");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Constraseña actualizada con exito");
    } catch (error) {
      setResetStatus("error");
      setErrorMessage(
        "An error occurred while resetting your password. Please try again."
      );

      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordsMatch = password === confirmPassword && password !== "";
  const allRequirementsMet = requirements.every((req) => req.met);
  const canSubmit = passwordsMatch && allRequirementsMet && !isSubmitting;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <Link
        to="/"
        className="mb-4 flex items-center gap-2 text-xl font-semibold"
      >
        <span>OthiliFin</span>
      </Link>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Create a new password for your account
          </CardDescription>
        </CardHeader>

        {resetStatus === "success" ? (
          <CardContent>
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Your password has been reset successfully.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button asChild className="mt-2">
                <Link to="/auth/login">Return to Login</Link>
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {resetStatus === "error" && (
                <Alert className="bg-red-50 border-red-200 text-red-800">
                  <X className="h-4 w-4 text-red-600" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {!token && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                  <AlertDescription>
                    Invalid or missing reset token. Please ensure you clicked
                    the correct link from your email.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting || !token}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting || !token}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Password Requirements:</p>
                <ul className="space-y-1 text-sm">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {requirement.met ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={
                          requirement.met
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {requirement.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={!canSubmit || !token}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Recuerdas tu contraseña?{" "}
        <Link
          to="/auth/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}
