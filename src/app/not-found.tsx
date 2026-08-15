import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <h2 className="text-3xl font-black text-slate-900 dark:text-slate-50 mb-4">Not Found</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Could not find requested resource</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
        Return Home
      </Link>
    </div>
  )
}
