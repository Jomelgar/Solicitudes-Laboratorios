  import { Form, Input, Row, Col, Typography, Card,Button,Select,Radio,Upload,Spin, message} from 'antd';
  import supabase from '../utils/supabaseClient';
  import { UploadOutlined, CheckCircleFilled } from '@ant-design/icons';
  import { useState,useEffect, use } from 'react';
  import { useNavigate } from "react-router-dom";
  import passToPDF from '../utils/toPdf.jsx';
  import {sendNotificationStudent, sendNotificationUser} from '../utils/email';
  import dayjs from 'dayjs';

  const { Title } = Typography;

  const types = 
  [
    {req:'change_lab',text:'Cambio de Laboratorio'},
    {req:'request_lab',text:'Cupo de Laboratorio'}
  ];

  async function generateHashId(id) {
    const encoder = new TextEncoder();
    const data = encoder.encode(id.toString());
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }


  function Formulario({enableForm}) {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [loading, setLoading] = useState(false); 
    const [approved,setApproved] = useState(false); 
    const [files,setFiles] = useState();
    const request_type = Form.useWatch('request_type', form);
    const [classes, setClasses] = useState([]);
    const [classSections,setClassSections] = useState([]);
    const [labSections,setLabSections] = useState([]);
    
    //Fetches
    const fetchClasses = async () => {
        const { data, error } = await supabase.from('class').select('*');
        if(data.length > 0) {
          setClasses(data);
        }
    };

    const fetchClassSections = async (id) => {
      const {data,error} = await supabase.from('class_section').select('*').eq('class_id',id);
      setClassSections(data);
      form.setFieldsValue({ section: undefined });
    };

    const fetchLabSections = async(id) =>{
      const {data, error} = await supabase.from('lab_section').select('*').eq('class_id',id);
      setLabSections(data || []);
      form.setFieldsValue({want_class: undefined, lab_section: undefined})
    };

    //Functions

    const searchStudent = async (numeroCuenta) => {
    if (!numeroCuenta) return;
    const { data, error } = await supabase
      .from('student')
      .select('*')
      .eq('account_number', numeroCuenta)
      .single();

    if (data) {
      form.setFieldsValue({
        first_name: data.first_name,
        second_name: data.second_name,
        last_name: data.last_name,
        second_last_name: data.second_last_name,
        email: data.email,
      });
    } else if (error) {
      throw new error('Estudiante no encontrado');
    }
  };

    const beforeUpload = (file) => {
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!validTypes.includes(file.type)) {
        message.error('Solo se permiten imágenes.');
        return Upload.LIST_IGNORE;
      }
      setFiles(file);
      return false; 
    };

    useEffect(() => {
      fetchClasses();
    }, []);

    const getLabSection= async(id)=>
    {
        const {data,error} = await supabase.from('lab_section').select('section,start_schedule,end_schedule,day').eq('id',id);
        if(data.length > 0)
        {
          return data[0].section + ", " + data[0].day+' de ' + data[0].start_schedule.slice(0,5)+ '-' + data[0].end_schedule.slice(0,5);
        }
        return '';
    }

  const handleSubmit = async (values) => {
      setLoading(true);
      try {
        // 1. Obtener contexto del tipo de solicitud
        const context = types.find((item) => item.req === values.request_type);
        const now = new Date();
        const today = now.toISOString().slice(0, 19).replace('T', '_');

        // 2. Obtener secciones
        const in_section = await getLabSection(values?.lab_section || '1');
        const want_section = await getLabSection(values.want_class);

        // 3. Generar PDF
        const pdfBlob = await passToPDF(values, files, classes, { in_section, want_section });
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(pdfBlob);
        });

        // 4. Enviar PDF al flujo de Power Automate
        const response = await fetch(import.meta.env.VITE_URL_POWER_AUTOMATE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: `solicitud-${values.account_number}-${today}.pdf`,
            base64File: base64,
          }),
        });

        const { pdfUrl } = await response.json();
        if (!response.ok || !pdfUrl) {
          const errorText = await response.text();
          throw new Error(`Error al subir archivo: ${errorText}`);
        }

        // 5. Buscar si el estudiante ya existe
        const { data: existingStudent } = await supabase
          .from('student')
          .select('*')
          .eq('account_number', values.account_number)
          .single();

        // 6. Insertar estudiante si no existe
        let student = existingStudent;
        if (!student) {
          const { data: newStudent, error: studentError } = await supabase
            .from('student')
            .insert({
              account_number: values.account_number,
              first_name: values.first_name,
              second_name: values.second_name,
              last_name: values.last_name,
              second_last_name: values.second_last_name,
              email: values.email,
            })
            .select()
            .single();

          if (studentError) {
            throw new Error('Error al guardar el estudiante');
          }
          student = newStudent;
        }
        else
        {
          const { data: newStudent, error: studentError } = await supabase
            .from('student').update({
              account_number: values.account_number,
              first_name: values.first_name,
              second_name: values.second_name,
              last_name: values.last_name,
              second_last_name: values.second_last_name,
              email: values.email,
            }).eq('id', student.id).select().single();
            student = newStudent;
        }

        // 7. Guardar el caso
        const { data: caseData, error: caseError } = await supabase
          .from('case')
          .insert({
            type: context?.text,
            justification: values.justification,
            url: pdfUrl,
            from_lab_section: values?.lab_section,
            to_lab_section: values.want_class,
            student_id: student.id,
            class_section_id: values.section,
          })
          .select()
          .single();

        if (caseError || !caseData) {
          throw new Error('Error al guardar el caso');
        }

        const hashId = await generateHashId(caseData.id);
        const {error: errorUpdateCase} = await supabase.from('case')
          .update({hash_id : hashId})
          .eq('id',caseData.id); 

        if(errorUpdateCase)
        {
          throw new Error('Error al guardar el caso');
        }
        // 8. Enviar notificación
        const baseURL = `${window.location.origin}`;
        const caseUrl = `${baseURL}/solicitud/${hashId}`;
        const msg = 'Revise con la URL su caso.';

        await sendNotificationStudent(
          caseData.type,
          caseData.id,
          want_section,
          caseUrl,
          student.first_name,
          student.last_name,
          student.email,
          msg
        );

        const {data: dataUser,error: errorUser} = await supabase.from('user').select('*');

        if(!errorUser)
        {
          const msgUser = 'La siguiente URL es un resumen del caso, se le solicita dar una respuesta lo antes posible.';
          for (const item of dataUser) {
            await sendNotificationUser(
              caseData.type,
              caseData.id,
              want_section,
              caseUrl,
              item.email,
              msgUser
            );
          }
        }

        message.success('Solicitud enviada correctamente');
        setFormSubmitted(false);
      } catch (err) {
        message.error('Ocurrió un error al enviar el formulario');
      } finally {
        setLoading(false);
      }
    };
    
    return (
      <Spin spinning={loading} tip="Enviando solicitud..."> 
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={24} sm={22} md={20} lg={16} xl={12}>
          {formSubmitted ? (
            <Card className='text-center p-6'>
              {/* Imagen de fondo transparente */}
              <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                <img
                  src="/UT.png"
                  alt="Error 404"
                  className="w-3/4 max-w-xs opacity-10 object-contain"
                />
              </div>
              <Title level={3} className='!text-5xl !text-black !font-extrabold'>¡Solicitud enviada con éxito!</Title>
              <CheckCircleFilled className='text-green-800 bg-yellow-200 rounded-full text-9xl mt-3 mb-3'/>
              <p className='mb-4 text-gray-700 text-md'>Tu solicitud ha sido enviada correctamente. Ahora solo queda esperar la respuesta del equipo encargado.</p>
              <Button className='mt-5 text-xl w-[40%] h-10 font-bold ' type="primary" onClick={() => navigate('/')}>Ir a Inicio</Button>
            </Card>
          ):(
            <Card
            title={
              <h1
                level={2} 
                className="text-center m-0 mt-3 text-blue-500 font-extrabold text-2xl sm:text-2xl md:text-3xl lg:text-2xl xl:text-4xl break-words"
                style={{ whiteSpace: 'normal', lineHeight: 1.2 }}
              >
                <img alt='unitec' src='/UT.png' className='w-5 mb-5 xl:w-10 md:w-8'/>
                Formulario de Solicitud
              </h1>
            }
            bordered={true}
            className="rounded-none md:rounded-lg xl:rounded-xl"
            style={{ backgroundColor: '#f0f2f5', padding: '24px' }}
          >
            <Form layout="vertical" form={form} onFinish={(allValues) => handleSubmit(allValues)}>
              <Card className='mb-4'
                title={<h2 className='text-black  '>Información  Personal</h2>}
                bordered={false}
              >
                {/* Número de Cuenta */}
                <Form.Item
                  label="Número de Cuenta"
                  name="account_number"
                  rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                >
                  <Input type='number' placeholder="Número de Cuenta" onChange={(e)=>searchStudent(e.target.value)} />
                </Form.Item>

                {/* Primer y Segundo Nombre */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Primer Nombre"
                      name="first_name"
                      rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                    >
                      <Input placeholder="Primer Nombre" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Segundo Nombre" name="second_name"
                    rules={[{ required: true, message: 'Este campo es obligatorio' }]}>
                      <Input placeholder="Segundo Nombre" />
                    </Form.Item>
                  </Col>
                </Row>  
                {/* Primer y Segundo Apellido */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Primer Apellido"
                      name="last_name"
                      rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                    >
                      <Input placeholder="Primer Apellido" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Segundo Apellido" name="second_last_name" 
                    rules={[{ required: true, message: 'Este campo es obligatorio' }]}>
                      <Input placeholder="Segundo Apellido" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Correo Electrónico */}
                <Form.Item
                  label="Correo Electrónico"
                  name="email"
                  rules={[
                    { required: true, message: 'Este campo es obligatorio' },
                    { type: 'email', message: 'Correo no válido' },
                  ]}
                >
                  <Input placeholder="Correo Electrónico" />
                </Form.Item>
              </Card>

              <Card className='mb-4' title={<h2 className='text-black mb-3 mt-3'>Información de Solicitud</h2>} bordered={true}>
                  
                  {/*Tipo de Solicitud*/}
                  <Form.Item label="Motivo de Solicitud" name="request_type" rules={[
                    { required: true, message: 'Este campo es obligatorio' }]}>
                    <Radio.Group className='mt-2 mb-2' name='request_type'>
                      <Radio className='text-black mr-5 mb-2' value='request_lab'>Cupo de Laboratorio</Radio>
                      <Radio className='text-black' value='change_lab'>Cambio de Sección</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Row gutter={16}>
                    {/*Clase que cursa*/}
                    <Col xs={24} md={12}>
                        <Form.Item 
                            label="Clase que cursa"
                            name="have_class"
                            rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                        >
                            <Select name='have_class' placeholder='Clase' onChange={(value)=> {fetchClassSections(value); fetchLabSections(value)}}>
                              {classes.map((item) => (
                                <Select.Option key={item.id} value={item.id}>
                                  {item.name}
                                </Select.Option>
                              ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    {/* Sección de Clase */}
                    <Col xs={24} md={12}>
                        <Form.Item label='Sección de Clase' name='section' 
                            rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                        >
                            <Select
                              name='section' 
                              placeholder='Sección de Clase' 
                              disabled={classSections.length === 0}
                            >
                              {classSections.map((item)=>(
                                  <Select.Option key={item.id} value={item.id}>
                                    {item.section} {item.trimester}
                                  </Select.Option>
                                ))
                              }
                            </Select>
                        </Form.Item>
                        
                    </Col>
                </Row>
                <Row gutter={16}>
                  {/*Seccion de Laboratorio en la que esta*/}
                  {request_type === 'change_lab' && 
                  (
                    <Col xs={24} md={24}>
                      <Form.Item label='Sección de Laboratorio' name='lab_section' 
                        rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                    >
                        <Select placeholder='Sección de Laboratorio' disabled={labSections.length === 0}>
                          {labSections.map((item)=>(
                                <Select.Option key={item.id} value={item.id}>
                                  {item.section} {item.day} {item.start_schedule.slice(0,5)}-{item.end_schedule.slice(0,5)}
                                </Select.Option>
                            ))
                          }
                        </Select>
                    </Form.Item>
                    </Col>
                  )}
                </Row>
                {/* Laboratorio que desea cursar */}
                <Form.Item label='Laboratorio solicitado' name='want_class' 
                  rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                >
                  <Select placeholder='Laboratorio solicitado' disabled={labSections.length === 0}>
                    {labSections.map((item)=>(
                      <Select.Option key={item.id} value={item.id}>
                      {item.section} {item.day} {item.start_schedule.slice(0,5)}-{item.end_schedule.slice(0,5)}
                      </Select.Option>
                    ))
                    }
                  </Select>
                </Form.Item>
                {/* Justificación */}
                <Form.Item label='Justificación' name='justification'
                  rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                >
                  <Input.TextArea placeholder='Justificación' rows={6}/>
                </Form.Item>
                {/* Adjuntar Archivo */}
                <Form.Item
                  label="Adjuntar Archivo (Constancias, Hojas de Confirmación, Capturas de Pantalla,etc.)"
                  name="attach_file"
                  rules={[{ required: true, message: 'Este campo es obligatorio' }]}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) return e;
                    return e?.fileList;
                  }}
                >
                  <Upload
                    name="archivo"
                    beforeUpload={(file) => beforeUpload(file)}
                    showUploadList={{ showRemoveIcon: true }}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                  </Upload>
                </Form.Item>
              </Card>
              {/* Botón de Enviar */}
              <Form.Item className='text-center'>
                  <button type='primary' htmlType='submit' className='rounded-md h-8 mt-3 bg-blue-500 hover:bg-blue-300 text-white text-lg w-[80%]'>Enviar</button>
              </Form.Item>
            </Form>
          </Card>
          )}
        </Col>
      </Row>
      </Spin>
    );
  }

  export default Formulario;
