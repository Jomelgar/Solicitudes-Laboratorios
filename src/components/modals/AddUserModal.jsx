import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";

const AddUserModal = ({ open, onCancel, onAdd }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onAdd(values);
    onCancel(); 
  };

  const handleCancel = () => {
    onCancel();
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title="Agregar Nuevo Usuario"
      onCancel={handleCancel}
      footer={null}
      destroyOnClose={true}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Correo electrónico"
          name="email"
          rules={[
            { required: true, message: "Ingrese un correo" },
            { type: "email", message: "Correo inválido" },
          ]}
        >
          <Input placeholder="usuario@ejemplo.com" />
        </Form.Item>

        <Form.Item
          label="Contraseña"
          name="password"
          rules={[
            { required: true, message: "Ingrese una contraseña" },
            { min: 6, message: "Debe tener al menos 6 caracteres" },
          ]}
        >
          <Input.Password placeholder="Contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Agregar Usuario
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
