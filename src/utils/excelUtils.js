import * as XLSX from 'xlsx';

/**
 * Lee un archivo Excel que contiene las hojas:
 * - 'lab_section'
 * - 'class_reference'
 * 
 * @param {string|Buffer} input - Ruta al archivo o buffer con el archivo Excel
 * @param {boolean} isBuffer - Si true, input es buffer, sino ruta
 * @returns {{ labSections: Array, classReferences: Array }}
 */
export async function readLabSectionExcel(file) {
  const data = await file.arrayBuffer(); 
  const workbook = XLSX.read(data, { type: 'array' });

  const labSections = workbook.Sheets['Laboratorios']
    ? XLSX.utils.sheet_to_json(workbook.Sheets['Laboratorios'])
    : [];

  return labSections;
}

export function downloadLabSectionTemplateExcel(classReferenceData) {
  // Plantilla vacía para lab_section
  const labSectionTemplate = [
    { Id_Clase: '0', Seccion: '0000', Trimestre: 'Q1',Dia: 'Lunes',Empieza: '8:10:00', Termina: '9:55:00'}
  ];

  const workbook = XLSX.utils.book_new();

  const labSheet = XLSX.utils.json_to_sheet(labSectionTemplate);
  XLSX.utils.book_append_sheet(workbook, labSheet, 'Laboratorios');

  const classSheet = XLSX.utils.json_to_sheet(classReferenceData);
  XLSX.utils.book_append_sheet(workbook, classSheet, 'Clases para Sacar Id');

  // Generar archivo Excel en formato binary string
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Crear blob con el contenido del archivo
  const blob = new Blob([wbout], { type: 'application/octet-stream' });

  // Crear URL temporal para descarga
  const url = window.URL.createObjectURL(blob);

  // Crear enlace invisible y hacer click para descargar
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Plantilla_Seccion_Lab.xlsx';
  document.body.appendChild(a);
  a.click();

  // Limpiar
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

export async function readClassSectionExcel(file) {
  const data = await file.arrayBuffer(); 
  const workbook = XLSX.read(data, { type: 'array' });

  const labSections = workbook.Sheets['Secciones de Clase']
    ? XLSX.utils.sheet_to_json(workbook.Sheets['Secciones de Clase'])
    : [];

  return labSections;
}

export function downloadClassSectionTemplateExcel(classReferenceData) {
  // Plantilla vacía para lab_section
  const ClassSectionTemplate = [
    { Id_Clase: '0', Seccion: '0000',Trimestre:'Q1'}
  ];

  const workbook = XLSX.utils.book_new();

  const labSheet = XLSX.utils.json_to_sheet(ClassSectionTemplate);
  XLSX.utils.book_append_sheet(workbook, labSheet, 'Secciones de Clase');

  const classSheet = XLSX.utils.json_to_sheet(classReferenceData);
  XLSX.utils.book_append_sheet(workbook, classSheet, 'Clases para Sacar Id');

  // Generar archivo Excel en formato binary string
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Crear blob con el contenido del archivo
  const blob = new Blob([wbout], { type: 'application/octet-stream' });

  // Crear URL temporal para descarga
  const url = window.URL.createObjectURL(blob);

  // Crear enlace invisible y hacer click para descargar
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Plantilla_Seccion_Clase.xlsx';
  document.body.appendChild(a);
  a.click();

  // Limpiar
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}
