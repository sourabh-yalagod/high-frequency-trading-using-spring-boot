import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { registerUser } from "../../store/apis";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { userToastMessages } from "../../utils/userToastMessages";

const Signup = () => {
  const params = useSearchParams()[0];
  const initialValues = {
    username: "",
    email: "",
    password: "",
  };
  const navigate = useNavigate()
  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .required("Username is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values: typeof initialValues, { resetForm }: any) => {
    try {
      const response = await registerUser(values);
      if (response.data)
        navigate("/signin")
    } catch (error: any) {
      userToastMessages("error", error?.response?.data?.message || "SignUp failed...!");
    }
    resetForm();
  };

  const handleSSOLogin = (provider: string) => {
    console.log(`Signing up with ${provider}`);
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    window.location.href = `${backendURL}/oauth2/authorization/${provider}`;
  };
  useEffect(() => {
    if (params.get("status") == "success") {
      if (params.get("status") == "success") {
        localStorage.setItem("token", params.get("token") || "")
        navigate("/")
      }
    }
  }, [params])
  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition duration-300">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Create Your Account
        </h2>

        {/* SSO Options */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => handleSSOLogin("google")}
            className="w-full flex items-center cursor-pointer justify-center gap-2 border border-gray-300 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <FcGoogle size={22} />
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              Sign up with Google
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSSOLogin("github")}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <FaGithub size={22} className="text-gray-800 dark:text-gray-100" />
            <span className="text-gray-700 cursor-pointer dark:text-gray-200 font-medium">
              Sign up with GitHub
            </span>
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
              or continue with email
            </span>
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Username
                </label>
                <Field
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <Field
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Sign in
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signup;
