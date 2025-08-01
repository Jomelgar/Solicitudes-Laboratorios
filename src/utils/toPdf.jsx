import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactDOMServer from 'react-dom/server';
import PdfTemplate from './caseTemplate.jsx';
import supabase from './supabaseClient.js';

const types = [
  { req: 'change_lab', title: 'Cambio de Laboratorio',text: 'cambio de laboratorio' },
  { req: 'request_lab', title:'Cupo para Laboratorio',text: 'cupo para laboratorio' }
];

const passToPDF = async (values, file, classes = [], { in_section, want_section }) => {
  const context = types.find((item) => item.req === values.request_type);
  const course_name = classes.find((c) => c.id === values.have_class)?.name || "No especificado";

  let fileUrl = null;
  if (file && file.type.startsWith("image/")) {
    fileUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
 const html = ReactDOMServer.renderToStaticMarkup(
    <PdfTemplate
      values={values}
      context={context}
      course_name={course_name}
      lab_section={in_section}
      want_section={want_section}
      fileUrl={fileUrl}
    />
  );

  const element = document.createElement("div");
  element.style.width = '595px'; // ancho A4
  element.innerHTML = html;
  document.body.appendChild(element);

  await new Promise((r) => setTimeout(r, 300));

  const canvas = await html2canvas(element, {
    scale: 2,
    width: element.offsetWidth,
    height: element.offsetHeight,
    scrollY: -window.scrollY,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.98);

  const pdf = new jsPDF("portrait", "in", "a4");
  const margin = 0.5;
  const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const pdfHeight = pdf.internal.pageSize.getHeight() - margin * 2;

  const ratio = canvas.width / canvas.height;

  let imgWidth = pdfWidth;
  let imgHeight = pdfWidth / ratio;

  if (imgHeight > pdfHeight) {
    imgHeight = pdfHeight;
    imgWidth = pdfHeight * ratio;
  }

  pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);

  element.remove();

  const pdfBlob = pdf.output("blob");

  return pdfBlob;
};

export default passToPDF;