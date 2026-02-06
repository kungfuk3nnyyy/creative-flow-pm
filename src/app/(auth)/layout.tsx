export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-display-lg text-paper">CreativeFlow</h1>
          <p className="text-body-lg text-paper/60 mt-4">
            Project management built for creative studios. Track projects,
            budgets, and invoices with elegance.
          </p>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
