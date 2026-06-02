import Head from 'next/head';
import Link from 'next/link';

export default function Unauthorized() {
  return (
    <>
      <Head>
        <title>Access Denied | FPCT Mahali Pamoja</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-center text-gray-800 dark:bg-gray-900 dark:text-white/90">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-white/[0.03]">
          <h1 className="text-3xl font-bold text-red-600 mb-4">⛔ Huna Ruhusa</h1>
          <p className="text-gray-700 mb-4 dark:text-gray-300">Samahani, huna ruhusa ya kufikia ukurasa huu.</p>
          <Link href="/" className="text-orange-600 font-medium hover:underline">
            Rudi kwenye ukurasa wa mwanzo
          </Link>
        </div>
      </div>
    </>
  );
}
