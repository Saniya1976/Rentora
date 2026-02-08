import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-center bg-cover relative p-4"
      style={{ backgroundImage: "url('/auth_bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative z-20 w-full flex justify-center">
        <SignUpForm />
      </div>
    </div>
  )
}

