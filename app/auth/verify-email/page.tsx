import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="glass-strong glow-purple">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold text-accent">Check Your Email</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              We've sent you a verification link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-base leading-relaxed">
              Click the link in your email to verify your account and start generating affiliate pages.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline">
                try again
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
