import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Spin,
  Descriptions,
  Divider,
  Tag,
} from "antd";
import { useParams } from "react-router-dom";
import {
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import supabase from "../utils/supabaseClient";

const { Title, Text } = Typography;

const CaseDetail = () => {
  const { id } = useParams(); // hash_id
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("case")
        .select(`
          id,
          hash_id,
          type,
          url,
          phase,
          date,
          reason,
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
          ),
          from_lab_section:lab_section!case_from_lab_section_fkey (
            id,
            section,
            trimester,
            day,
            start_schedule,
            end_schedule,
            class (
              id,
              name
            )
          ),
          to_lab_section:lab_section!case_to_lab_section_fkey (
            id,
            section,
            trimester,
            day,
            start_schedule,
            end_schedule,
            class (
              id,
              name
            )
          )
        `)
        .eq("hash_id", id)
        .single();

      if (error) setError(error.message);
      else setCaseData(data);

      setLoading(false);
    };

    fetchCase();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  if (error) return <div className="text-center text-red-600 mt-4">{error}</div>;
  if (!caseData) return null;

  const { student, from_lab_section, to_lab_section } = caseData;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Card
        bordered={false}
        className="shadow-xl rounded-3xl bg-white p-6 sm:p-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <Title level={3} className="!mb-1">
            Detalles del Caso
          </Title>
          <Text type="secondary" className="text-sm sm:text-base">
            Recargar la página para actualizar el estado del caso
          </Text>
        </div>

        {/* Estado y Razón */}
        <Descriptions
          bordered
          column={1}
          labelStyle={{ fontWeight: "600", fontSize: "1rem" }}
          size="middle"
          className="mb-10"
        >
          <Descriptions.Item label="Estado">
            <Tag
              className="break-words max-w-full"
              color={
                caseData.phase === "Aceptado"
                  ? "green"
                  : caseData.phase === "Denegado"
                  ? "red"
                  : "gold"
              }
            >
              {caseData.phase}
            </Tag>
          </Descriptions.Item>
          {caseData.phase !== "Procesando" && (
            <Descriptions.Item label="Razón">
              <Text
                className="whitespace-pre-wrap break-words"
                style={{ fontSize: "0.95rem" }}
              >
                {caseData.reason || "No disponible"}
              </Text>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Detalles principales */}
        <Descriptions
          bordered
          column={1}
          labelStyle={{ fontWeight: "600", fontSize: "1rem" }}
          size="middle"
          className="mb-10"
        >
          <Descriptions.Item label="Tipo de caso">
            <Tag
              icon={<ExperimentOutlined />}
              color="blue"
              className="break-words max-w-full"
              style={{ maxWidth: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}
            >
              {caseData.type}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha">
            <CalendarOutlined className="mr-1" />
            {new Date(caseData.date).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Documento">
            <a
              href={caseData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-words max-w-full block"
            >
              <FileTextOutlined className="mr-1" />
              Ver archivo
            </a>
          </Descriptions.Item>
        </Descriptions>

        {/* Estudiante */}
        <Divider orientation="left" plain>
          <UserOutlined /> <span className="font-semibold text-lg">Estudiante</span>
        </Divider>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-base">
          <p>
            <strong>Nombre:</strong> {student.first_name} {student.last_name}
          </p>
          <p>
            <strong>Número de cuenta:</strong> {student.account_number}
          </p>
          <p className="sm:col-span-2">
            <strong>Email:</strong>{" "}
            <a
              href={`mailto:${student.email}`}
              className="text-blue-600 hover:underline break-words"
            >
              {student.email}
            </a>
          </p>
        </div>

        {/* Laboratorio actual */}
        <Divider orientation="left" plain>
          <SwapOutlined /> <span className="font-semibold text-lg">Laboratorio actual</span>
        </Divider>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 text-base">
          <p>
            <strong>Sección:</strong> {from_lab_section?.section || "No asignado"}
          </p>
          <p>
            <strong>Día:</strong> {from_lab_section?.day || "-"}
          </p>
          <p>
            <strong>Horario:</strong>{" "}
            <ClockCircleOutlined className="ml-1 mr-1" />
            {from_lab_section
              ? `${from_lab_section.start_schedule.slice(0, 5)} - ${from_lab_section.end_schedule.slice(0, 5)}`
              : "-"}
          </p>
          <p>
            <strong>Clase:</strong> {from_lab_section?.class?.name || "-"}
          </p>
        </div>

        {/* Laboratorio solicitado */}
        <Divider orientation="left" plain>
          <SwapOutlined rotate={180} />{" "}
          <span className="font-semibold text-lg">Laboratorio solicitado</span>
        </Divider>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
          <p>
            <strong>Sección:</strong> {to_lab_section?.section || "No asignado"}
          </p>
          <p>
            <strong>Día:</strong> {to_lab_section?.day || "-"}
          </p>
          <p>
            <strong>Horario:</strong>{" "}
            <ClockCircleOutlined className="ml-1 mr-1" />
            {to_lab_section
              ? `${to_lab_section.start_schedule.slice(0, 5)} - ${to_lab_section.end_schedule.slice(0, 5)}`
              : "-"}
          </p>
          <p>
            <strong>Clase:</strong> {to_lab_section?.class?.name || "-"}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CaseDetail;
