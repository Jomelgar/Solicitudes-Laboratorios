import React, { useEffect, useState } from "react";
import { Card, Table, Button, Spin } from "antd";
import { PlusOutlined, DeleteOutlined, ImportOutlined, FileExcelOutlined } from "@ant-design/icons";
import ImportExcelModal from './modals/ExcelUploadModal';
import AddClassModal from "./modals/AddClassModal";
import supabase from '../utils/supabaseClient';
import { downloadClassTemplateExcel, readClassExcel } from '../utils/excelUtils';

const ClassList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("class").select("*").eq('active',true);

    if (error) {
      console.error("Error fetching classes:", error.message);
      setData([]);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("class").update({active: false}).eq("id", id);
    if (!error) {
      fetchData();
    } else {
      console.error("Error deleting class:", error.message);
    }
  };

  const handleAdd = async (newClass) => {
    setLoading(true);
    const { error } = await supabase.from("class").insert([{ name: newClass.name }]);
    if (!error) {
      fetchData();
    } else {
      console.error("Error adding class:", error.message);
    }
    setIsAddModalVisible(false);
  };

  const handleImport = () => {
    setIsImportModalVisible(true);
  };

  const handleExport = () => {
    downloadClassTemplateExcel();
  };

  const onImport = async (file) => {
    setLoading(true);
    const classes = await readClassExcel(file);
    const expectedKeys = ["Nombre"];

    const isValid = classes.every(item => {
      const keys = Object.keys(item);
      return (
        keys.length === expectedKeys.length &&
        keys.every(key => expectedKeys.includes(key))
      );
    });

    if (!isValid) {
      setLoading(false);
      throw new Error("Formato de Excel inválido. Se espera una columna llamada: 'Nombre'");
    }

    const mappedData = classes.map(item => ({
      name: item.Nombre
    }));

    const { error } = await supabase.from("class").insert(mappedData);
    if (error) {
      console.error("Error importing classes:", error.message);
    } else {
      console.log("Clases importadas correctamente");
    }

    await fetchData();
    setIsImportModalVisible(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "Nombre de la Clase",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="overflow-y-auto p-4 h-full">
      <Card
        title={<h1 className="font-bold">Clases</h1>}
        extra={
          <div className="flex space-x-5">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Agregar Clase
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
          <div className="overflow-x-auto">
            <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{ position: ["bottomCenter"], pageSize: 3 }}
            size="small"
            className="min-w-full rounded-xl"
            />
        </div>
          <Button
            className="border-none mt-5 !bg-blue-500 hover:!bg-blue-300 !text-white text-md"
            icon={<FileExcelOutlined />}
            onClick={handleExport}
          >
            Plantilla de Excel
          </Button>
        </Spin>
      </Card>

      <AddClassModal
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

export default ClassList;
