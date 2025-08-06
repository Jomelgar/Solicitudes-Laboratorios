import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";

const AddClassModal = ({ open, onCancel, onAdd }) => {
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
      title="Agregar Nueva Clase"
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Nombre de la Clase"
          name="name"
          rules={[{ required: true, message: "Ingrese el nombre de la clase" }]}
        >
          <Input placeholder="Ejemplo: Programación I" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Agregar Clase
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddClassModal;
