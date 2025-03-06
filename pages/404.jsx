import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full px-6 py-8 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">Página não encontrada</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Parece que você seguiu um link quebrado ou inseriu uma URL que não existe neste site.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => router.back()}
              className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Voltar para a página anterior
            </button>
            <Link href="/dashboard" legacyBehavior>
              <a className="block w-full px-4 py-2 text-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md border border-blue-600 dark:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
                Ir para o Dashboard
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 