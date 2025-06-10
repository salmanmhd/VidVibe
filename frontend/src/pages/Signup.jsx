import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  function handlerClick() {
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <form className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
        <h2 className="text-center text-3xl font-semibold text-white">
          Create Account
        </h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

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

        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Profile Picture
          </label>
          <input
            type="file"
            className="w-full text-white file:cursor-pointer file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white"
          />
        </div>

        <p className="text-center text-sm text-white">
          Already registered?
          <span onClick={handlerClick} className="cursor-pointer underline">
            Login
          </span>
        </p>

        <button
          type="submit"
          className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white transition duration-300 hover:bg-purple-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
