import { useNavigate } from "react-router-dom";

import { useState } from "react";
import axios from "axios";
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  console.log(`BASE_URL: ${BASE_URL}`);

  async function loginHandler(e) {
    e.preventDefault();
    if (!username || !password) {
      return;
    }
    const data = { username, password };

    const response = await axios.post(`${BASE_URL}/user/login`, data, {
      withCredentials: true,
    });
    console.log(`🟡response: ${response}`);

    if (!response) {
      return;
    }

    if (response.status === 200) {
      navigate("/");
    }
  }

  function handlerClick() {
    navigate("/signup");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <form
        onSubmit={(e) => loginHandler(e)}
        className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md"
      >
        <h2 className="text-center text-3xl font-semibold text-white">Login</h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Username"
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <p className="text-center text-sm text-white">
          Not registered yet?{" "}
          <span onClick={handlerClick} className="cursor-pointer underline">
            Sign up
          </span>
        </p>

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
