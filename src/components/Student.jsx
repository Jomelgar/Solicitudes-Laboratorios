import { useState } from 'react';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileAddOutlined, FileSearchOutlined, LogoutOutlined } from '@ant-design/icons';
import Formulario from './Form';
import MyCases from './MyCases';

function StudentMenu() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('1');

  const renderComponent = () => {
    switch (selected) {
      case '1':
        return <Formulario enableForm={true} />;
      case '2':
        return <MyCases/>;
      case '3':
        navigate('/')
      default:
        return null;
    }
  };

  return (
    <div>
      <Menu
        mode="horizontal"
        theme="dark"
        selectedKeys={[selected]}
        onClick={({ key }) => setSelected(key)}
      >
        <Menu.Item key="1" icon={<FileAddOutlined />}>
          Nueva Solicitud
        </Menu.Item>
        <Menu.Item key="2" icon={<FileSearchOutlined />}>
          Mis Casos
        </Menu.Item>
        <Menu.Item key="3" icon={<LogoutOutlined/>}>
            Cerrar Sesión
        </Menu.Item>
      </Menu>

      <div className="p-4">
        {renderComponent()}
      </div>
    </div>
  );
}

export default StudentMenu;
