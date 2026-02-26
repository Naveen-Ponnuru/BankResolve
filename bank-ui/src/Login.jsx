import React, { useEffect, useState } from "react";
import PageTitle from "./ui/PageTitle";
import {
  Link,
  Form,
  useActionData,
  useNavigation,
  useNavigate,
} from "react-router-dom";
import authService from "./services/authService.js";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "./store/auth-slice";
import { selectBank } from "./store/bankSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedBank = useSelector(selectBank);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const from = sessionStorage.getItem("redirectPath") || "/customer/dashboard";

  useEffect(() => {
    if (actionData?.success) {
      dispatch(
        loginSuccess({ jwtToken: actionData.jwtToken, user: actionData.user }),
      );
      sessionStorage.removeItem("redirectPath");
      let targetPath = from;

      if (targetPath === "/" || targetPath === "/login" || targetPath === "") {
        let roleStr = "CUSTOMER";
        if (
          Array.isArray(actionData.user?.roles) &&
          actionData.user.roles.length > 0
        ) {
          roleStr = actionData.user.roles[0].replace("ROLE_", "");
        } else if (actionData.user?.role) {
          roleStr = actionData.user.role.replace("ROLE_", "");
        }
        switch (roleStr.toUpperCase()) {
          case "STAFF":
            targetPath = "/staff/dashboard";
            break;
          case "MANAGER":
            targetPath = "/manager/dashboard";
            break;
          case "ADMIN":
            targetPath = "/admin/dashboard";
            break;
          default:
            targetPath = "/customer/dashboard";
            break;
        }
      }

      toast.success("Login successful!");
      setTimeout(() => {
        navigate(targetPath);
      }, 100);
    } else if (actionData?.errors) {
      toast.error(actionData.errors.message || "Login failed.");
    }
  }, [actionData, dispatch, navigate, from]);

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
                aria-invalid={!!formErrors.email}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  formErrors.email
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200 dark:focus:ring-red-900"
                    : "border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900"
                } focus:outline-none focus:ring-2`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.email}
                </p>
              )}
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
                  aria-invalid={!!formErrors.password}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    formErrors.password
                      ? "border-red-500 focus:border-red-600 focus:ring-red-200 dark:focus:ring-red-900"
                      : "border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900"
                  } focus:outline-none focus:ring-2`}
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
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.password}
                </p>
              )}
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

export async function loginAction({ request }) {
  const data = await request.formData();
  const loginData = {
    email: data.get("email"),
    password: data.get("password"),
  };

  const errors = {};
  if (!loginData.email) errors.email = "Email is required";
  if (!loginData.password) errors.password = "Password is required";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const response = await authService.login(
      loginData.email,
      loginData.password,
    );
    const { user, jwtToken } = response;
    return { success: true, user, jwtToken };
  } catch (error) {
    if (error.response?.status === 401) {
      return {
        success: false,
        errors: { message: "Invalid email or password" },
      };
    }
    throw new Response(
      error.response?.data?.message || error.message || "Failed to login.",
      { status: error.response?.status || 500 },
    );
  }
}
