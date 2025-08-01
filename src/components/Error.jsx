
import { Link } from 'react-router-dom';

function Error() {
  return (
    <div className="flex items-center justify-center min-h-screen px-2">
      <div className="bg-blue-50 rounded-2xl shadow-2xl flex flex-col items-center justify-center w-full max-w-xl py-12 px-6 relative overflow-hidden">
        {/* Imagen de fondo transparente */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <img
            src="/UT.png"
            alt="Error 404"
            className="w-3/4 max-w-xs opacity-10 object-contain"
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          <h1 className="text-8xl md:text-9xl font-extrabold text-blue-800 mb-6 text-center">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4 text-center">Página no encontrada</h2>
          <p className="text-lg md:text-xl text-gray-500 mb-8 text-center max-w-lg">
            Lo sentimos, la página que buscas no existe o no tienes acceso a ella.
          </p>
          <Link to="/" className="bg-blue-700 hover:bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold text-lg transition">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Error;
