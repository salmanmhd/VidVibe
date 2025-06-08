function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <form className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
        <h2 className="text-center text-3xl font-semibold text-white">Login</h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter email"
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white transition duration-300 hover:bg-purple-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
