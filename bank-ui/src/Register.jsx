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
import { useSelector } from "react-redux";
import { selectBank } from "./store/bankSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function Register() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const navigate = useNavigate();
  const selectedBank = useSelector(selectBank);
  const [role, setRole] = useState("CUSTOMER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } else if (actionData?.errors) {
      toast.error(actionData.errors.message || "Registration failed.");
      setFormErrors(actionData.errors);
    }
  }, [actionData, navigate]);

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
              Creating account for this bank
            </p>
          </div>
        </div>

        {/* Register Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl px-8 py-10 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <PageTitle title="Register" />
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
              Create Account
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Join thousands of customers managing grievances efficiently
            </p>
          </div>

          <Form method="POST" className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
                aria-label="Full name"
                aria-invalid={!!formErrors.name}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  formErrors.name
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200 dark:focus:ring-red-900"
                    : "border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900"
                } focus:outline-none focus:ring-2`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91-XXXXXXXXXX"
                required
                aria-label="Phone number"
                aria-invalid={!!formErrors.phone}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                  formErrors.phone
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200 dark:focus:ring-red-900"
                    : "border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900"
                } focus:outline-none focus:ring-2`}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.phone}
                </p>
              )}
            </div>

            {/* Password */}
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
                autoComplete="new-password"
                  required
                  minLength={8}
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
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                At least 8 characters, with mix of uppercase, lowercase, and
                numbers
              </p>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                id="confirmPassword"
                name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                autoComplete="new-password"
                  required
                  aria-label="Confirm password"
                  aria-invalid={!!formErrors.confirmPassword}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    formErrors.confirmPassword
                      ? "border-red-500 focus:border-red-600 focus:ring-red-200 dark:focus:ring-red-900"
                      : "border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900"
                  } focus:outline-none focus:ring-2`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                  aria-label="Toggle password visibility"
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${
                  formErrors.role
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200 dark:focus:ring-red-900"
                    : "border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900"
                } focus:outline-none focus:ring-2`}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
              {formErrors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {formErrors.role}
                </p>
              )}
            </div>

            {/* Bank Code (only for STAFF / MANAGER) */}
            {(role === "STAFF" || role === "MANAGER") && (
              <div>
                <label
                  htmlFor="bankCode"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Bank Code
                </label>
                <input
                  id="bankCode"
                  name="bankCode"
                  type="text"
                  placeholder="Enter bank code (e.g. SBI001)"
                  aria-label="Bank code"
                  aria-invalid={!!formErrors.bankCode}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    formErrors.bankCode
                      ? "border-red-500 focus:border-red-600 focus:ring-red-200 dark:focus:ring-red-900"
                      : "border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900"
                  } focus:outline-none focus:ring-2`}
                />
                {formErrors.bankCode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {formErrors.bankCode}
                  </p>
                )}
              </div>
            )}

            {/* Hidden bank code from selected bank (for CUSTOMER / ADMIN defaults) */}
            {selectedBank?.code && (
              <input
                type="hidden"
                name="bankCodeFromContext"
                value={selectedBank.code}
              />
            )}

            {/* Terms Agreement */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                  className="h-5 w-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:bg-gray-900 dark:border-gray-600"
                  aria-label="Agree to terms and conditions"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !agreeToTerms}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                isSubmitting || !agreeToTerms
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
              <span>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </span>
            </button>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Already registered?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            <Link
              to="/login"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
            >
              Sign in to your account
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-center">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-600 dark:text-green-400 mb-1 block mx-auto"
            />
            <p className="text-gray-600 dark:text-gray-300">Fast Setup</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-600 dark:text-green-400 mb-1 block mx-auto"
            />
            <p className="text-gray-600 dark:text-gray-300">Secure</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-600 dark:text-green-400 mb-1 block mx-auto"
            />
            <p className="text-gray-600 dark:text-gray-300">24/7 Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function registerAction({ request }) {
  const data = await request.formData();
  const regData = {
    name: data.get("name"),
    email: data.get("email"),
    phone: data.get("phone"),
    password: data.get("password"),
    confirmPassword: data.get("confirmPassword"),
    role: data.get("role") || "CUSTOMER",
    bankCode: data.get("bankCode"),
    bankCodeFromContext: data.get("bankCodeFromContext"),
  };

  const errors = {};
  if (!regData.name) errors.name = "Full name is required";
  if (!regData.email) errors.email = "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email)) {
    errors.email = "Please enter a valid email";
  }
  if (!regData.phone) errors.phone = "Phone number is required";
  if (!regData.password) errors.password = "Password is required";
  if (regData.password?.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  if (regData.password !== regData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!regData.role) {
    errors.role = "Role is required";
  }
  const normalizedRole = (regData.role || "CUSTOMER").toUpperCase();
  let effectiveBankCode = regData.bankCode;
  if (!effectiveBankCode && regData.bankCodeFromContext) {
    effectiveBankCode = regData.bankCodeFromContext;
  }
  if (
    (normalizedRole === "STAFF" || normalizedRole === "MANAGER") &&
    (!effectiveBankCode || effectiveBankCode.trim() === "")
  ) {
    errors.bankCode = "Bank code is required for staff and manager.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const response = await authService.register({
      name: regData.name,
      email: regData.email,
      mobileNumber: regData.phone,
      password: regData.password,
      role: normalizedRole,
      bankCode: effectiveBankCode,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { message: error.response?.data?.message || error.message },
    };
  }
}
