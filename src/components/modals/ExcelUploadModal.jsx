import React, { useState } from 'react';
import { Modal, Upload, Button, message, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Text } = Typography;

const ExcelUploadModal = ({ visible, onClose, onImport }) => {
  const [fileList, setFileList] = useState([]);

  const beforeUpload = (file) => {
    const isExcel =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';

    if (!isExcel) {
      message.error('¡Solo puedes subir archivos Excel (.xls, .xlsx)!');
    }

    return isExcel || Upload.LIST_IGNORE;
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning('Por favor, selecciona un archivo Excel primero.');
      return;
    }

    const file = fileList[0].originFileObj;
    if (onImport) {
      onImport(file);
    }

    message.success('Archivo subido correctamente.');
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title="Importar archivo Excel"
      open={visible}
      onCancel={() => {
        setFileList([]);
        onClose();
      }}
      onOk={handleUpload}
      okText="Importar"
      cancelText="Cancelar"
    >
      <Dragger
        className='!text-black'
        name="file"
        accept=".xlsx"
        multiple={false}
        beforeUpload={beforeUpload}
        fileList={fileList}
        onChange={({ fileList: newList }) => setFileList(newList.slice(-1))}
        onRemove={() => setFileList([])}
        maxCount={1}
        style={{ padding: 16 }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Haz clic o arrastra un archivo Excel para subirlo</p>
        <Text type="secondary">Solo se permiten archivos con extensión .xls o .xlsx</Text>
      </Dragger>
    </Modal>
  );
};

export default ExcelUploadModal;
