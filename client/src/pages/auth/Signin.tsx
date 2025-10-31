import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const Signin = () => {
  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = (values: typeof initialValues, { resetForm }: any) => {
    console.log("Signin form submitted:", values);
    // Example: await axios.post('/api/auth/signin', values);
    resetForm();
  };

  const handleSSOLogin = (provider: string) => {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    window.location.href = `${backendURL}/auth/${provider}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition duration-300">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Sign In to Your Account
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
              Sign in with Google
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSSOLogin("github")}
            className="w-full flex items-center cursor-pointer justify-center gap-2 border border-gray-300 dark:border-gray-600 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <FaGithub size={22} className="text-gray-800 dark:text-gray-100" />
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              Sign in with GitHub
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
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>

              <div className="text-center mt-4">
                <a
                  href="/forgot-password"
                  className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Forgot your password?
                </a>
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Don’t have an account?{" "}
                <a
                  href="/signup"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Sign up
                </a>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signin;
