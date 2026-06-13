import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="max-w-md text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600 mb-3">404</p>
      <h1 className="text-4xl font-black text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-600 mb-8">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="inline-flex px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition">
        Go home
      </Link>
    </div>
  </main>
);

export default NotFound;
