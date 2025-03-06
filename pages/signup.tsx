import { SignUpForm } from "@/components/auth/sign-up-form"

export default function SignUp() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  )
} 