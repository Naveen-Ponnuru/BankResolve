import React, { useEffect, useState } from "react";
import PageTitle from "./ui/PageTitle";
import {
  Link,
  Form,
  useActionData,
  useNavigation,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, selectIsAuthenticated } from "./store/auth-slice";
import { selectBank } from "./store/bankSlice";
import { normalizeRole } from "./utils/roleUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedBank = useSelector(selectBank);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showPassword, setShowPassword] = useState(false);

  // Phase 6: Block login page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 1. Handle auth action result (success/fail)
  useEffect(() => {
    if (actionData?.success) {
      // ✅ HARD RESET: wipe any previous user's state before writing new one.
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // DEBUG: verify incoming action data
      console.log("ACTION USER:", actionData.user);

      // Store token and user consistently
      localStorage.setItem("token", actionData.jwtToken);
      localStorage.setItem("user", JSON.stringify(actionData.user));

      dispatch(
        loginSuccess({
          jwtToken: actionData.jwtToken,
          user: actionData.user,
          bankCode: actionData.bankCode,
          bankName: actionData.bankName,
        }),
      );
      // ✅ Phase 6: toast fires ONCE here
      toast.success("Login successful!");
      sessionStorage.removeItem("redirectPath");

      const role = normalizeRole(actionData.user.role);
      console.log("LOGIN REDIRECT:", actionData.user);

      switch (role) {
        case "MANAGER":
          navigate("/manager/dashboard", { replace: true });
          break;
        case "STAFF":
          navigate("/staff/dashboard", { replace: true });
          break;
        case "ADMIN":
          navigate("/admin/dashboard", { replace: true });
          break;
        default:
          navigate("/customer/dashboard", { replace: true });
      }
    } else if (actionData?.errors) {
      toast.error(actionData.errors.message || "Login failed.");
    }
  }, [actionData, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Bank Context Card */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-l-4 border-blue-600 flex items-center space-x-3">
          <div className="text-2xl">🏦</div>
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {selectedBank.name}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Change bank from home page
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl px-8 py-10 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <PageTitle title="Login" />
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Sign in to manage your grievances
            </p>
          </div>

          <Form method="POST" className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                aria-label="Email address"
                className="w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none focus:ring-2"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  aria-label="Password"
                  className="w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                  aria-label="Toggle password visibility"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:bg-gray-900 dark:border-gray-600"
                  aria-label="Remember me"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <input type="hidden" name="bankCode" value={selectedBank?.code || ""} />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed opacity-70"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              }`}
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
            </button>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                New user?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            <Link
              to="/register"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
            >
              Create an account
            </Link>
          </p>

          {/* Help Text */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs text-gray-600 dark:text-gray-400 text-center">
            Demo credentials: email@bank.com / password123
          </div>
        </div>
      </div>
    </div>
  );
}
