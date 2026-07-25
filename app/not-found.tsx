import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
