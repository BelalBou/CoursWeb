export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <span className="text-xl font-bold text-gray-900">Mon Portfolio</span>
      <div className="flex gap-6">
        <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">
          Accueil
        </a>
        <a href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
          Contact
        </a>
      </div>
    </nav>
  );
}
