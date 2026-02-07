import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-center bg-cover relative"
      style={{ backgroundImage: "url('/landing-i2.png')" }}
    >
      {/* black overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* content */}
      <div className="relative z-20">
        <SignUpForm />
      </div>
    </div>
  )
}
