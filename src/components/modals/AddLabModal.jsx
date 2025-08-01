import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Select,Col,Row, TimePicker} from "antd";
import supabase from '../../utils/supabaseClient';

const trimester=['Q1','Q2','Q3','Q4'];
const days=['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];

const AddLabModal = ({ open, onCancel, onAdd }) => {
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);

  const fetchClasses = async () => {
    const { data, error } = await supabase.from('class').select('*');
    if (data?.length > 0) {
      setClasses(data);
    }
  };

  const handleFinish = (values) => {
    onAdd(values);
    onCancel();
  };

  const handleCancel = () => {
    onCancel();
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title="Agregar Nueva Sección"
      onCancel={handleCancel}
      footer={null}
      destroyOnClose={true} // opcional, destruye el modal y reinicia todo
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Clase"
          name="class"
          rules={[{ required: true, message: "Seleccione una clase" }]}
        >
          <Select placeholder="Clase">
            {classes.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        
        <Row gutter={16}>
          <Col xs={12}>
            <Form.Item
              label="Horario empieza"
              name="start_schedule"
              rules={[{ required: true, message: "Seleccione un horario" }]}
            >
              <TimePicker placeholder='Hora' format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12}>
            <Form.Item
              label="Horario termina"
              name="end_schedule"
              rules={[{ required: true, message: "Seleccione un horario" }]}
            >
              <TimePicker placeholder='Hora' format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
            <Col xs={12}>
                <Form.Item
                label="Trimestre"
                name="trimester"
                rules={[{ required: true, message: "Seleccione un trimestre" }]}
                >
                <Select placeholder="Trimestre">
                    {trimester.map((item) => (
                    <Select.Option key={item} value={item}>
                        {item}
                    </Select.Option>
                    ))}
                </Select>
                </Form.Item>
            </Col>

            <Col xs={12}>
                <Form.Item
                label="Día"
                name="day"
                rules={[{ required: true, message: "Seleccione un día" }]}
                >
                  <Select placeholder="Día">
                      {days.map((item) => (
                      <Select.Option key={item} value={item}>
                          {item}
                      </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
            </Col>
        </Row>
        <Form.Item
        label="Sección"
        name="section"
        rules={[{ required: true, message: "Ingrese la sección" }]}
        >
        <Input
            type="number"
            placeholder="Sección"
            min="0"
            step="1"
            onKeyDown={(e) => {
            if (e.key === '.' || e.key === ',' || e.key === 'e') {
                e.preventDefault();
            }
            }}
        />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Agregar
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddLabModal;
