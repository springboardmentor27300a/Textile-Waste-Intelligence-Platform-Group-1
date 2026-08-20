import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Mail,
} from "lucide-react";

import { Button, Input } from "../../components/ui";

function ForgotPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-card">

        {/* Logo & Branding */}

        <div className="mb-8 flex flex-col items-center">

        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
          TW
        </div>

        <h2 className="mt-4 text-2xl font-bold text-heading">
            TWIP
        </h2>

        <p className="mt-1 text-sm text-muted">
            Textile Waste Intelligence Platform
        </p>

        </div>

        {/* Header */}

        <div className="text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">

            <KeyRound className="text-accent" size={26} />

          </div>

          <h1 className="text-3xl font-bold text-heading">
            Recover Your Account
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Forgot your password? No problem.
            Enter your registered work email and we'll send
            you a secure password reset link.
          </p>

        </div>

        {/* Form */}

        <div className="mt-8">

          <Input
            required
            label="Work Email"
            placeholder="Enter your work email"
            icon={Mail}
          />

          <div className="mt-8">

            <Button fullWidth>

              <div className="flex items-center justify-center gap-2">

                Send Reset Link

                <ArrowRight size={18} />

              </div>

            </Button>

          </div>

        </div>

        {/* Back */}

        <div className="mt-8 text-center">

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >

            <ArrowLeft size={16} />

            Back to Sign In

          </Link>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;