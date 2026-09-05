import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Login page opened");
  }, []);

  // useEffect(() => {

  //   fetch("http://localhost:5000/api/auth/login", {

  //       method: "POST",

  //       headers: {
  //           "Content-Type": "application/json"
  //       },

  //       body: JSON.stringify({
  //           email: "test@gmail.com",
  //           password: "123456"
  //       })

  //   })
  //   .then((response) => response.json())
  //   .then((data) => {
  //       console.log(data);
  //   });

  // }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (email === "") {
      setEmailError("Email is required");
      hasError = true;
    }

    if (password === "") {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    console.log("Email:", email);
    console.log("Password:", password);

    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.success) {

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      toast.success("Login Successful!");

      navigate("/dashboard");

    } else {

      toast.error(data.message);

    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">

      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">

        <h1 className="text-3xl font-bold text-blue-600">
          Offline Code Editor
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Code anytime. Sync when you're online.
        </p>

        <form onSubmit={handleLogin}>

          <div className="mb-5">
            <label className="block mb-2 font-medium">
              Email
            </label>

            {emailError && (
              <p className="text-red-500 text-sm mb-2">
                {emailError}
              </p>
            )}

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-8">
            <label className="block mb-2 font-medium">
              Password
            </label>

            {passwordError && (
              <p className="text-red-500 text-sm mb-2">
                {passwordError}
              </p>
            )}

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300"
          >
            Login
          </button>

        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?
          <Link
            to="/register"
            className="text-blue-600 font-semibold ml-1 hover:underline"
          >
            Register
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 Offline Code Editor v1.0
        </p>

      </div>

    </div>
  );
}

export default Login;