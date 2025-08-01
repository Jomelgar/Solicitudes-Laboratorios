import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Verification from './components/Verification'
import Home from './components/Home'
import Form from './components/Form'
import Error from './components/Error'
import './index.css'
import InformationCase from './components/InformationCase'
import Cookies from 'js-cookie'

function App() {
  const [home, setHome] = useState(Cookies.get('user_id') !== null && Cookies.get('user_id') !== undefined); 
  const [form, setForm] = useState(false);
  const [error, setError] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState('/fondoDARK.webp');

  return (
    <div className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundUrl})` }}>
      {/* Overlay azul oscuro semi-transparente */}
      <div className="absolute inset-0 bg-[#0a1428] bg-opacity-70 z-10 overflow-hidden">
        {/* Línea de barrido azul claro animada */}
        <div className="absolute top-0 left-[0%]  w-1/5 h-[100vh] bg-gradient-to-r from-blue-900 via-blue-200 to-transparent opacity-5 animate-sweep z-20 pointer-events-none" />
        <div className="absolute top-0 left-[0%]  w-1/5 h-[100vh] bg-gradient-to-l from-blue-900 via-blue-200 to-transparent opacity-5 animate-sweep z-20 pointer-events-none" />
      </div>
      <div className="relative z-20 h-full w-full">
        <Routes>
          {home && 
          (
            <Route path="/home" element={<Home enableHome={setHome}/>}/>
          )}
          
          {form && 
          (
            <Route path="/form" element={<Form enableForm={setForm}/>} />
          )}

          <Route 
            path="/"
            element={<Verification home={home} enableHome={setHome} setBackgroundUrl={setBackgroundUrl} enableForm={setForm}/>}
          /> 
          <Route
            path='/solicitud/:id'
            element={<InformationCase/>}
          />
          <Route 
            path='*' 
            element={<Error/>} 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;