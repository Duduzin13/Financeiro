import { LoginForm } from "@/components/auth/login-form"

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
} 