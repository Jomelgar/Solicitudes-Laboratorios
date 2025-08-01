import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import supabase from '../utils/supabaseClient';
import { comparePasswords } from '../utils/authUtils.js';
import * as EmailValidator from 'email-validator';
import Cookies from 'js-cookie';
import Application from './Application.jsx';

  function Verification({ enableHome, enableForm}) {
      const [process, setProcess] = useState(false);
      const [login, setLogin] = useState(false);
      const [email, setEmail] = useState('');
      const [showModal, setShowModal] = useState(false);
      const [showPassword, setShowPassword] = useState(false);
      const [password, setPassword] = useState('');
      const navigate = useNavigate();

      useEffect(() => {enableHome(false); enableForm(false); Cookies.remove('user_id');},[])

      useEffect(() => {
          const fetchUser = async () => {
            const {data, error} = await supabase.from('user').select('*').eq('email', email).single();
            if(data)
            {
              setLogin(true);
            }else
            {
              setLogin(false);
            }
        }
          fetchUser();
      }, [email]);

      const handleVerification = () => {
          if (email.includes('@unitec.edu')) {
              if(EmailValidator.validate(email)) {
                  setProcess(true);
              }else 
              {
                  setShowModal(true);
              }
          } else {
              setShowModal(true);
          }
      };

      const handleLogin = async() => {
        const {data,error} = await supabase.from('user').select('*').eq('email', email).single();
        const comparePassword = await comparePasswords(password,data.password);
        if(data && comparePassword)
        {
          Cookies.set('user_id',data.id,{expires: 1, path: '/'});
          enableHome(true);
          setEmail('');
          setPassword('');
          navigate('/home');
        }
      }

      return (
        <div className="flex items-center justify-center min-h-screen px-2">
          {/* Modal de alerta con Ant Design */}
          <Modal
              open={showModal}
              onCancel={() => setShowModal(false)}
              footer={[
                  <Button
                  key="close"
                  type="primary"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-1 text-base bg-blue-500 hover:bg-blue-300"
                  >
                  Cerrar
                  </Button>
              ]}
              title={
                  <div className="flex items-center gap-2 text-2xl text-red-600 font-bold">
                  <ExclamationCircleOutlined />
                  Correo inválido
                  </div>
              }
              centered
              bodyStyle={{
                  textAlign: 'center',
                  padding: '24px',
              }}
              >
              <p className="text-lg text-gray-700 mb-0">
                  Por favor, ingrese un correo institucional válido.
              </p>
          </Modal>

          <div className="bg-white w-full max-w-xl flex flex-col items-center justify-center relative rounded-xl py-10 px-6 shadow-xl">
            <h1 className="text-center text-blue-500 text-4xl font-extrabold leading-tight md:text-5xl mb-10">
              Solicitud de Laboratorios <span className="inline-block">👋</span>
            </h1>
            <p className="text-base md:text-md max-w-2sm text-gray-700 mb-10 font-semibold text-center mb-4">
              {login ? 'Ingrese su correo institucional y contraseña para ingresar.'
              : 'Ingrese su correo institucional y luego verifique su cuenta.'}
            </p>
            <input
              type="email"
              placeholder="Ejemplo@unitec.edu"
              value={email}
              disabled={process}
              onChange={(e) => setEmail(e.target.value)}
              className="px-5 border border-gray-300 rounded-md mt-4 p-2 w-[90%]"
            />
            {login ? (
              <>
                <div className="relative w-[90%] mb-8 mt-8 flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-5 border border-gray-300 rounded-md p-2 mb-4 w-[100%]"
                  />
                  <button
                    type="button"
                    className="absolute right-2 -translate-y-2 text-gray-500 "
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeInvisibleOutlined  /> : <EyeOutlined />}
                  </button>
                </div>
                <button 
                  className="bg-blue-800 hover:bg-blue-500 text-white rounded-md p-2 w-full max-w-xs mx-auto"
                  onClick={handleLogin}  
                >
                  Ingresar
                </button>
              </>
            ) : (
              <Application handleVerification={handleVerification} process={process} enableForm ={enableForm} email={email}/>
            )}
          </div>
        </div>
      );
  }

  export default Verification;