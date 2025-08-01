import React from 'react';
import logo from '/UT.png';

const PdfTemplate = ({ values, context, course_name, lab_section, fileUrl, want_section }) => {
  const full_name = `${values.first_name} ${values.second_name || ''} ${values.last_name} ${values.second_last_name || ''}`.trim();

  return (
    <div
      id="pdf-content"
      style={{
        width: '595px', // A4 width at 72dpi
        minHeight: '842px', // A4 height at 72dpi
        padding: '40px',
        fontFamily: 'Times New Roman, serif',
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#000',
        backgroundColor: '#fff',
        boxSizing: 'border-box',
        margin: '0 auto'
      }}
    >
      {/* Logo alineado a la derecha */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <img src={logo} alt="logo" style={{ width: '50px' }} />
      </div>

      {/* Encabezado */}
      <h1 style={{ color: '#1e40af', marginBottom: '10px', fontSize: '24px' }}>
        Formulario de Solicitud - {context?.title}
      </h1>

      <hr style={{ border: '1px solid #1e40af', marginBottom: '30px' }} />

      {/* Contenido principal */}
      <p>
        El presente documento tiene como finalidad registrar la solicitud realizada por el estudiante
        <strong> {full_name}</strong>, con número de cuenta
        <strong> {values.account_number}</strong>, y correo electrónico
        <strong> {values.email}</strong>.
      </p>

      <p>
        Dicha solicitud corresponde a un <strong>{context?.text || 'tipo de solicitud no especificado'}</strong>,
        en la asignatura <strong>{course_name}</strong>
        {values.request_type === 'change_lab' && (
          <> sección de laboratorio actual: <strong>{lab_section}</strong></>
        )}.
      </p>

      <p>
        <strong>Sección de laboratorio solicitado:</strong> {want_section}
      </p>

      {values.request_type === 'change_lab' ? (
        <p>
          El estudiante manifiesta pertenecer a la sección de laboratorio <strong>{lab_section}</strong>,
          y solicita el cambio mediante la siguiente justificación.
        </p>
      ) : (
        <p>
          El estudiante solicita ser asignado al siguiente laboratorio en esta asignatura mediante la siguiente justificación.
        </p>
      )}

      {/* Sección de Justificación enmarcada */}
      <div
        style={{
          border: '2px dashed #1e40af',
          padding: '16px',
          marginTop: '30px',
          backgroundColor: '#f9fafb',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#1e40af', fontSize: '16px' }}>Justificación:</h3>
        <p style={{ marginBottom: 0 }}>{values.justification}</p>
      </div>

      {/* Imagen Adjunto */}
      {fileUrl && (
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3 style={{ color: '#1e40af', marginBottom: '20px' }}>Archivo Adjunto</h3>
          <img
            src={fileUrl}
            alt="Adjunto"
            style={{
              width: '400px',
              maxWidth: '100%',
              display: 'block',
              margin: '20px auto 0 auto',
              border: '2px solid #ccc',
              padding: '5px',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PdfTemplate;
