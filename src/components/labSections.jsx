import React, { useEffect, useState } from "react";
import { Card, Table, Button, Spin } from "antd";
import { PlusOutlined, DeleteOutlined, ImportOutlined, FileExcelOutlined } from "@ant-design/icons";
import ImportExcelModal from './modals/ExcelUploadModal';
import AddLabModal from "./modals/AddLabModal";
import supabase from '../utils/supabaseClient';
import { downloadLabSectionTemplateExcel, readLabSectionExcel } from '../utils/excelUtils';

const ClassSections = () => {
  const [data, setData] = useState();
  const [classes, setClasses] = useState([]);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    const { data, error } = await supabase.from('class').select('*');
    if (data?.length > 0) {
      setClasses(data.map((item) => ({ text: item.name, value: item.id })));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('lab_section')
      .select(`
        id,
        section,
        trimester,
        start_schedule,
        end_schedule,
        day,
        class (
          id,
          name
        )
      `);

    if (error) {
      setData([]);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  function excelTimeToHHMMSS(excelTime) {
  if (typeof excelTime === 'string') return excelTime;
  if (typeof excelTime === 'number') {
    const totalSeconds = Math.round(excelTime * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map(n => String(n).padStart(2, '0')).join(':');
  }
  return null; // formato inválido
}

  const formatSchedule = (start, end) => {
    const startFormatted = start.slice(0, 5);
    const endFormatted = end.slice(0, 5);
    return `${startFormatted} - ${endFormatted}`;
  };

  const handleDelete = async (sectionId) => {
    const { error } = await supabase
      .from('lab_section') // ← CORREGIDO: antes decía 'class_section'
      .delete()
      .eq('id', sectionId);

    if (!error) {
      fetchData();
    } else {
      throw new error ('Error eliminando sección:');
    }
  };

  const handleImport = () => {
    setIsImportModalVisible(true);
  };

  const handleExport = () => {
    downloadLabSectionTemplateExcel(classes.map((item) => ({
      Id_Clase: item.value,
      Nombre: item.text
    })));
  };

  const onImport = async (file) => {
    setLoading(true);
    const labs = await readLabSectionExcel(file);
    const expectedKeys = ["Dia", "Empieza", "Termina", "Seccion", "Trimestre", "Id_Clase"];

    const isValid = labs.every(item => {
      const keys = Object.keys(item);
      return (
        keys.length === expectedKeys.length &&
        keys.every(key => expectedKeys.includes(key))
      );
    });

    if (!isValid) {
      setLoading(false);
      throw new error("Archivo con formato inválido. Asegúrate que las columnas sean exactamente:", expectedKeys);
      return;
    }

    const mappedData = labs.map(item => ({
      class_id: item.Id_Clase,
      section: item.Seccion,
      trimester: item.Trimestre,
      day: item.Dia,
      start_schedule: excelTimeToHHMMSS(item.Empieza),
      end_schedule: excelTimeToHHMMSS(item.Termina)
    }));

    const { error } = await supabase.from('lab_section').insert(mappedData);

    if (error) {
      throw new error("Error al insertar los datos:")
    } else {
      console.log("Datos importados correctamente");
    }
    await fetchData();
  };

  const handleAdd = async (newSection) => {
    setLoading(true);
    const startTime = newSection.start_schedule.format('HH:mm:ss');
    const endTime = newSection.end_schedule.format('HH:mm:ss');
    const { data, error } = await supabase
      .from('lab_section')
      .insert([{
        class_id: newSection.class,
        section: newSection.section,
        trimester: newSection.trimester,
        start_schedule: startTime,
        end_schedule: endTime,
        day: newSection.day,
      }]);
    fetchData();
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchClasses();
      await fetchData();
    };
    loadAll();
  }, []);

  const columns = [
    {
      title: "Clase",
      dataIndex: ['class', 'name'],
      key: ['class', 'id'],
      filters: classes,
      onFilter: (value, record) => record.class?.id === value
    },
    {
      title: 'Trimestre',
      dataIndex: 'trimester',
      key: 'trimester',
      filters: Array.from(new Set((data || []).map(d => d?.trimester)))
        .filter(Boolean) 
        .map(value => ({ text: value, value })), 
      onFilter: (value, record) => record?.trimester === value,
      render: (_, record) => record?.trimester ?? "—",
    },
    {
      title: "Sección de Laboratorio",
      dataIndex: "section",
      key: 'id',
    },
    {
      title: 'Día',
      dataIndex: 'day',
      key: 'day',
      filters: Array.from(new Set((data || []).map(d => d?.day)))
        .filter(Boolean) 
        .map(value => ({ text: value, value })), 
      onFilter: (value, record) => record?.day === value,
      render: (_, record) => record?.day ?? "—",
    },
    {
      title: "Horario",
      key: "schedule",
      render: (_, record) => formatSchedule(record.start_schedule, record.end_schedule)
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record?.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 h-full">
      <Card
        title={<h1 className="font-bold">Secciones de Laboratorios</h1>}
        extra={
          <div className="flex space-x-5">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Agregar sección
            </Button>
            <Button
              type="primary"
              icon={<ImportOutlined />}
              onClick={handleImport}
            >
              Importar Excel
            </Button>
          </div>
        }
        className="rounded-2xl shadow-md"
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{ position: ['bottomCenter'], pageSize: 5 }}
          />
          <Button
            className="border-none mt-5 !bg-blue-500 hover:!bg-blue-300 !text-white text-md"
            icon={<FileExcelOutlined />}
            onClick={handleExport}
          >
            Plantilla de Excel
          </Button>
        </Spin>
      </Card>

      <AddLabModal
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onAdd={handleAdd}
      />

      <ImportExcelModal
        visible={isImportModalVisible}
        onClose={() => setIsImportModalVisible(false)}
        onImport={onImport}
      />
    </div>
  );
};

export default ClassSections;
