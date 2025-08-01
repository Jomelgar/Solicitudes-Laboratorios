import React, { useEffect, useState } from "react";
import { Card, Table, Button, Space, Modal, message, Spin } from "antd";
import { PlusOutlined, DeleteOutlined, ImportOutlined, FileExcelOutlined } from "@ant-design/icons";
import ImportExcelModal from "./modals/ExcelUploadModal";
import AddSectionModal from "./modals/AddSectionModal";
import supabase from '../utils/supabaseClient';
import { downloadClassSectionTemplateExcel,readClassSectionExcel } from '../utils/excelUtils.js';

const ClassSections = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [classes, setClasses] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const fetchClasses = async () => {
    const { data, error } = await supabase.from('class').select('*');
    if (data?.length > 0) {
      setClasses(data.map((item) => ({ text: item.name, value: item.id })));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('class_section')
      .select(`
        id,
        section,
        trimester,
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

  const handleDelete = async (sectionId) => {
    const { error } = await supabase
      .from('class_section')
      .delete()
      .eq('id', sectionId);

    if (!error) {
      fetchData();
    } else {
      console.error('Error eliminando sección:', error);
    }
  };

  const handleImport = () => {
    setIsImportModalVisible(true);
  };

  const handleExport = () => {
    downloadClassSectionTemplateExcel(classes.map((item) => ({ Id_Clase: item.value, Nombre: item.text })));
  };

  const handleAdd = async (newSection) => {
    setLoading(true);
    const { data, error } = await supabase.from('class_section').insert([{
      class_id: newSection.class,
      section: newSection.section,
      trimester: newSection.trimester
    }]);
    console.log('Error: ', error);
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

  const onImport = async (file) => {
    setLoading(true);

    const labs = await readClassSectionExcel(file);
    const expectedKeys = ["Seccion", "Trimestre", "Id_Clase"];

    const isValid = labs.every(item => {
      const keys = Object.keys(item);
      return (
        keys.length === expectedKeys.length &&
        keys.every(key => expectedKeys.includes(key))
      );
    });

    if (!isValid) {
      setLoading(false);
      console.error("Archivo con formato inválido. Asegúrate que las columnas sean exactamente:", expectedKeys);
      return;
    }

    const mappedData = labs.map(item => ({
      class_id: item.Id_Clase,
      section: item.Seccion,
      trimester: item.Trimestre,
    }));

    const { error } = await supabase.from('class_section').insert(mappedData);

    if (error) {
      console.error("Error al insertar los datos:", error);
    } else {
      console.log("Datos importados correctamente en class_section");
    }

    await fetchData();
    setLoading(false);
  };


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
      title: "Sección de Clase",
      dataIndex: "section",
      key: 'id',
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
    <div className="p-4 h-full w-full">
      <Card
        title={<h1 className="font-bold">Secciones de Clases</h1>}
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

      <AddSectionModal
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
