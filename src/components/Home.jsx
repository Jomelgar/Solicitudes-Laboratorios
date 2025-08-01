import React, { useEffect, useState } from "react";
import { Layout, Menu, Card } from "antd";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import {
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ProfileOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from "@ant-design/icons";
import Profile from "./Profile";
import Sections from './classSections';
import Labs from './labSections'
import Cases from './Cases';
import Users from './Users';
import logo from "/UT.png";

const { Header, Sider, Content } = Layout;

function Home({ enableHome }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("cases");
  const [id,setId] = useState(Cookies.get('user_id'));
  const [collapsed, setCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Card
        className="w-[90vw] h-[90vh] rounded-2xl shadow-lg overflow-hidden"
        bodyStyle={{ padding: 0, height: "100%" }}
      >
        <Layout className="h-full">
          <Sider
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          collapsedWidth={80}
          className="bg-white rounded-l-2xl flex flex-col justify-between relative"
        >
            <div className="h-16 flex items-center justify-center p-3">
              <img src={logo} alt="Logo" className="max-w-full max-h-10" />
            </div>
            <Menu
              mode="inline"
              selectedKeys={[activeView]}
              className="flex-1"
              onClick={({ key }) => setActiveView(key)}
            >
              <Menu.Item key="cases" icon={<FileTextOutlined />}>
                Casos
              </Menu.Item>
              <Menu.Item key="clases" icon={<DesktopOutlined />}>
                Secciones de clase
              </Menu.Item>
              <Menu.Item key="labs" icon={<TeamOutlined />}>
                Secciones de laboratorio
              </Menu.Item>
              <Menu.Item key="usuarios" icon={<UserOutlined />}>
                Usuarios
              </Menu.Item>
              <Menu.Item key="profile" icon={<ProfileOutlined />}>
                Mi Perfil
              </Menu.Item>
            </Menu>
            <div className="absolute bottom-0 w-full">
              <Menu mode="inline">
                <Menu.Item
                  key="logout"
                  icon={<LogoutOutlined />}
                  onClick={() => navigate("/")}
                  danger
                >
                  Cerrar sesión
                </Menu.Item>
              </Menu>
            </div>
          </Sider>

          <Layout className="rounded-r-2xl overflow-hidden">
            <Header className="bg-gray-100 border-b border-gray-300 text-center flex items-center">
              <button
                className="text-xl mr-10"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
              <h2 className="m-0 text-sm md:text-xl lg:text-2xlw-full font-semibold">Panel de Administración</h2>
            </Header>

            <Content className="m-6 bg-white min-h-[360px] w-full rounded-xl p-6">
              {activeView === "cases" && <Cases/>}
              {activeView === "clases" && <Sections/>}
              {activeView === "labs" && <Labs/>}
              {activeView === "usuarios" && <Users view={(id) => {setId(id); setActiveView('profile');}}/>}
              {activeView === "profile" && <Profile id={id} setId={setId}/>}
            </Content>
          </Layout>
        </Layout>
      </Card>
    </div>
  );
}

export default Home;
