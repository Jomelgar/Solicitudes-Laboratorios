import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import supabase from "../utils/supabaseClient";
import { hashPassword } from "../utils/authUtils";
import Cookies from "js-cookie";

const { Title } = Typography;

function Profile({ isFromProfile = false, id, setId }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const userId = id ?? Cookies.get("user_id");

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const hash = await hashPassword(values.password);

      const { error } = await supabase
        .from("user")
        .update({ password: hash })
        .eq("id", parseInt(userId));

      if (error) {
        throw new error("Error al actualizar la contraseña");
      } else {
        message.success("¡Contraseña actualizada correctamente!");
        setSubmitted(true);
        form.resetFields(["password"]);
      }
    } catch (err) {
      message.error("Error inesperado al actualizar");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", parseInt(userId))
        .single();

      if (!error && data) {
        form.setFieldsValue({ email: data.email });
      } else {
        console.error("Error al obtener usuario:", error);
      }
    };
    fetch();
    if (setId) setId(null);
  }, [form, userId, setId]);

  return (
    <div className="w-full h-full justify-center items-center px-4 py-8">
      <Card
        title={<Title level={3}>Mi Perfil</Title>}
        bordered={false}
        className="w-full h-full"
      >
        <div className="max-w-2xl">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ email: "" }}
          >
            <Form.Item name="email" label="Correo electrónico">
              <Input placeholder="usuario@ejemplo" className="!text-black" disabled />
            </Form.Item>

            <Form.Item
              label="Nueva contraseña"
              name="password"
              rules={[
                { required: true, message: "Por favor ingrese la nueva contraseña" },
                { min: 6, message: "Debe tener al menos 6 caracteres" },
              ]}
            >
              <Input.Password placeholder="********" />
            </Form.Item>

            <Form.Item>
              <Button
                className="mt-10"
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                disabled={submitted}
              >
                {submitted ? "Contraseña actualizada" : "Actualizar contraseña"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
}

export default Profile;
