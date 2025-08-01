import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import {sendVerificationCode} from '../utils/email';


function Application({handleVerification,process, enableForm, email})
{
    const navigate = useNavigate();
    const createCode = () => 
    {
        const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setCode(generatedCode);
        return generatedCode;
    }
    
    const compare = () => 
    {
        if(code === verification)
        {
            enableForm(true);
            setVerification('');
            navigate('/form');
            console.log("Code verified successfully!");
        }else
        {
            setTried(false);
            sendVerificationCode(email,verification);
        }
    }

    const [code, setCode] = useState();
    const [verification, setVerification] = useState('');
    const [tried,setTried] = useState(false);

    useEffect(() => 
        {
            createCode();
        },[]);

    useEffect(() =>
    {
        if(process && email.trim() !== '')
        {
            setTried(false);
            sendVerificationCode(email, code);
        }
    },[code,process]);

    return (
       <div className='w-full flex items-center justify-center flex-col mt-3'>
        {!process && 
        (
            <button
              className='mt-5 bg-blue-800 hover:bg-blue-500 text-white rounded-md p-2 w-[60%]'
              onClick={handleVerification}
            >
              Enviar verificación
            </button>
        )}
        {process && (
          <div className='flex flex-col items-center mt-4 w-full max-w-md mt-1'>
            <p className='text-gray-700 mt-2  text-sm text-center'>
            Verificación enviada. Por favor, revise su correo e ingrese el siguiente código.
            </p>
            <div className="flex flex-col items-center mt-4 w-[70%]">
            <input
                type="text"
                maxLength={6}
                value={verification}
                onChange={(e) => setVerification(e.target.value.toUpperCase())}
                placeholder="Código de verificación"
                className="border border-gray-300 rounded-md p-2 mb-2  w-full text-center tracking-widest text-sm"
            />
            <button 
                className=" bg-blue-700 hover:bg-blue-300 text-white text-xs w-[70%] rounded-md p-2 mt-2 transition"
                onClick={compare}
            >
                Verificar código
            </button>
            {tried && (<p className='text-red-500 text-center w-full text-xs mt-3'>Has intentado verificar el código incorrectamente. Por favor, inténtalo de nuevo.</p>)}
            </div>
        </div>
        )}
       </div>
    );
}

export default Application;