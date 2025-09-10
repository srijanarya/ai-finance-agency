import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            TREUM
            <span className="block text-4xl font-medium text-primary-600 mt-2">
              AI Finance Platform
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Harness the power of artificial intelligence for real-time market data, 
            portfolio management, and intelligent financial insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/auth/signin" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary-600 text-white hover:bg-primary-700 h-11 px-8">
              Sign In
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 h-11 px-8">
              View Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-primary-600 text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
              <p className="text-gray-600">
                Live market data with WebSocket connections for instant updates
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-primary-600 text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Advanced algorithms for market analysis and portfolio optimization
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-primary-600 text-3xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">Portfolio Management</h3>
              <p className="text-gray-600">
                Comprehensive tools for tracking and managing your investments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}