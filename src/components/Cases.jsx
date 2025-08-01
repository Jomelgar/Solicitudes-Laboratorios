import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  message,
  Space,
  Spin,
  Modal,
  Input,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import supabase from "../utils/supabaseClient";

const { TextArea } = Input;

const Cases = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [actionType, setActionType] = useState(null); // "Aprobado" o "Denegado"
  const [justification, setJustification] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("case")
      .select(`
        id,
        type,
        url,
        phase,
        date,
        justification,
        student (
          id,
          account_number,
          first_name,
          last_name,
          email
        ),
        class_section (
          id,
          section,
          class (
            id,
            name
          )
        )
      `)
      .eq("phase", "Procesando");

    if (error) {
      message.error("Error al cargar los casos");
      setData([]);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  const openModal = (record, phase) => {
    setSelectedCase(record);
    setActionType(phase); // "Aprobado" o "Denegado"
    setJustification(""); // limpiar justificación al abrir
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!justification.trim()) {
      message.warning("Por favor, ingresa una justificación.");
      return;
    }
    setUpdating(true);
    const { error } = await supabase
      .from("case")
      .update({ phase: actionType, reason: justification })
      .eq("id", selectedCase.id);

    setUpdating(false);

    if (error) {
      message.error("Error al actualizar el caso");
    } else {
      message.success(`Caso ${actionType.toLowerCase()} exitosamente`);
      setModalVisible(false);
      fetchData();
    }
  };

  const columns = [
    {
      title: "Tipo de Caso",
      dataIndex: "type",
      key: "type",
      filters: Array.from(new Set(data.map((d) => d.type)))
        .filter(Boolean)
        .map((type) => ({ text: type, value: type })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Clase",
      key: "class_name",
      filters: Array.from(
        new Set(data.map((d) => d.class_section?.class?.name))
      )
        .filter(Boolean)
        .map((name) => ({ text: name, value: name })),
      onFilter: (value, record) => record.class_section?.class?.name === value,
      render: (_, record) => record.class_section?.class?.name ?? "—",
    },
    {
      title: "Sección",
      key: "section",
      filters: Array.from(new Set(data.map((d) => d.class_section?.section)))
        .filter(Boolean)
        .map((section) => ({ text: section, value: section })),
      onFilter: (value, record) => record.class_section?.section === value,
      render: (_, record) => record.class_section?.section ?? "—",
    },
    {
      title: "N° de Cuenta",
      dataIndex: ["student", "account_number"],
      key: "account_number",
    },
    {
      title: "Nombre",
      key: "student_name",
      render: (_, record) =>
        `${record.student?.first_name ?? ""} ${record.student?.last_name ?? ""}`,
    },
    {
      title: "Correo",
      dataIndex: ["student", "email"],
      key: "email",
    },
    {
      title: "URL del Caso",
      dataIndex: "url",
      key: "url",
      render: (url) => (
        <a
          className="text-blue-400 hover:text-blue-800 underline"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver caso
        </a>
      ),
    },
    {
      title: "Fase",
      dataIndex: "phase",
      key: "phase",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => openModal(record, "Aceptado")}
          >
            Aprobar
          </Button>
          <Button
            type="default"
            danger
            icon={<CloseOutlined />}
            onClick={() => openModal(record, "Denegado")}
          >
            Denegar
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 h-full">
      <Card
        title={<h1 className="font-bold">Solicitudes de Casos</h1>}
        className="rounded-2xl shadow-md w-full h-full"
        style={{ maxWidth: "100%", overflowX: "auto" }}
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{ position: ["bottomCenter"], pageSize: 5 }}
            scroll={{ x: "max-content" }}
          />
        </Spin>

        <Modal
          title={`Justificación para ${actionType === "Aprobado" ? "aprobar" : "denegar"}`}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleUpdate}
          confirmLoading={updating}
          okText="Enviar"
          cancelText="Cancelar"
        >
          <TextArea
            rows={4}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Escribe la justificación aquí..."
          />
        </Modal>
      </Card>
    </div>
  );
};

export default Cases;
