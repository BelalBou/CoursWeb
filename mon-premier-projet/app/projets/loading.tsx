export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 px-8 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mb-10" />

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
