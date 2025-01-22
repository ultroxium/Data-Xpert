import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="h-full bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-gray-500">
            We're sorry, the page you requested could not be found. Please check the URL or try navigating back to the homepage.
          </p>
        </div>
        <div className="flex justify-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
