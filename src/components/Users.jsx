import React, { useEffect, useState } from "react";
import { Col,Card, Button, Spin, message, Typography, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined, ImportOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import AddUserModal from './modals/AddUserModal';
import supabase from "../utils/supabaseClient";
import { hashPassword} from "../utils/authUtils";
const { Text } = Typography;

const Users = ({view}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addVisible, setAddVisible] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user")
      .select("*");

    if (error) {
      message.error("Error al cargar usuarios");
      setData([]);
    } else {
      setData(data);
    }
    setLoading(false);
  };
  const handleAdd=async(user)=>
  {
    setLoading(true);
    const newPassword = await hashPassword(user.password);
    const{error} = await supabase.from('user').insert({
      email:user.email,
      password: newPassword
    }) 
    fetchUsers();
  }

  const handleDelete = async (userId) => {
    const { error } = await supabase.from("user").delete().eq("id", userId);
    if (error) {
      message.error("No se pudo eliminar el usuario");
    } else {
      message.success("Usuario eliminado");
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <Card
        title={<h1 className="font-bold text-xl">Usuarios del Sistema</h1>}
        extra={
          <div className="flex gap-3">
            <Button onClick={()=>setAddVisible(true)}type="primary" icon={<UserAddOutlined />}>
              Nuevo Usuario
            </Button>
          </div>
        }
        className="rounded-2xl shadow-md"
      >
        <Spin spinning={loading}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((user) => (
              <Card
                key={user.id}
                className="rounded-xl shadow-sm border border-gray-200"
                title={<Text  strong><UserOutlined className="mr-4"/>{user.email}</Text>}
              >
                <Col>
                  <Button icon={<EditOutlined/>} 
                   className="mr-2 !border-blue-500 !text-blue-500 hover:!border-blue-300 hover:!text-blue-300"
                   size="small"
                   onClick={()=> {view(user.id)}} 
                  >
                    Editar Usuario
                  </Button> 
                  <Popconfirm
                      title="¿Eliminar este usuario?"
                      onConfirm={() => handleDelete(user.id)}
                      okText="Sí"
                      cancelText="No"
                    >
                      <Button danger icon={<DeleteOutlined />}size="small">Eliminar Usuario</Button>
                    </Popconfirm>
                </Col>
              </Card>
            ))}
          </div>
        </Spin>
      </Card>

      
      <AddUserModal
        open={addVisible}
        onCancel={() => setAddVisible(false)}
        onAdd={handleAdd}
      />
    </div>
  );
};

export default Users;
