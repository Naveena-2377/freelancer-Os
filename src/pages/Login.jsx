import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password);
    if (error) setError(error.message);
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-gradient-accent" />
          <div className="font-semibold text-text-primary">FreelancerOS</div>
        </div>

        <h1 className="text-xl font-semibold text-text-primary mb-1">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted mb-6">
          {mode === "signin" ? "Sign in to keep building." : "Start building in silence."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surfaceLight border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-muted outline-none focus:border-accent.purple"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surfaceLight border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-muted outline-none focus:border-accent.purple"
            required
          />
          {error && <p className="text-xs text-accent.pink">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-accent text-text-primary text-sm font-medium py-2.5 rounded-lg"
          >
            {mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-xs text-muted hover:text-text-primary mt-5"
        >
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}