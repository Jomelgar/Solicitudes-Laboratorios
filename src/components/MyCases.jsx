import { Card, Typography, Row, Col, Tag, Spin, Empty } from 'antd';
import { FilePdfOutlined, CalendarOutlined, TagsOutlined } from '@ant-design/icons';
import supabase from '../utils/supabaseClient';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const { Title, Text, Paragraph } = Typography;

function MyCasesCardView() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const originUrl = `${window.location.origin}`;

  const fetchData =async() => {
    const {data: student, error: studentError} = await supabase.from('student').select('*').eq('email',Cookies.get('email_student')).single();
    if(!student || studentError) 
    {
      setData([]);
      return;
    }

    const {data,error} = await supabase.from('case').select(`
          hash_id,
          type,
          url,
          phase,
          date,
          reason,
          justification,
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
        `).eq('student_id',student.id).order('date',{ascending: false});

    if(error) setData([]);
    else setData(data);
  };

  useEffect(() => {fetchData()},[]);

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 max-w-full bg-gray-200 min-h-screen rounded-xl">
      <div className="w-full text-center mb-8">
        <img alt="unitec" src="/UT.png" className="w-10 md:w-14 mx-auto mb-3" />
        <Title
          level={2}
          className="!text-blue-500 !font-extrabold !text-3xl md:!text-4xl"
          style={{ marginBottom: 0 }}
        >
          Mis Casos
        </Title>
      </div>

      {loading ? (
        <Spin size="large" className="block mx-auto mt-20" />
      ) : data.length === 0 ? (
        <Empty description="No hay casos aún" />
      ) : (
        <Row gutter={[24, 24]}>
          {data.map((item) => (
            <Col key={item.id} xs={24} sm={24} md={12} lg={8} xl={6}>
              <Card
                title={
                  <>
                    <Tag color="geekblue" icon={<TagsOutlined />} style={{ marginLeft: 8}}>
                      {item.type}
                    </Tag>
                  </>
                }
                bordered
                hoverable
                className="h-full shadow-md rounded-lg"
                bodyStyle={{ padding: '16px' }}
              >
                <Paragraph strong ellipsis={{ rows: 3, expandable: true, symbol: 'más' }}>
                  Justificación: 
                  {'\n'+ item.justification}
                </Paragraph>

                <Tag color={item.phase === 'Aceptado' ? 'green': item.phase === 'Denegado' ? 'red' : 'yellow'} style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                    {item.phase}
                </Tag>

                <p>
                  <Text strong>Sección Solicitada: </Text>
                  {item.to_lab_section.class.name} - {item.to_lab_section.section}
                </p>

                <p>
                  <CalendarOutlined /><strong> Creado: </strong>
                  <Text className='text-blue-800' style={{ marginLeft: 6 }}>
                    {new Date(item.date).toLocaleString()}
                  </Text>
                </p>

                <p>
                  <FilePdfOutlined />{' '}
                  {item.hash_id ? (
                    <a
                      className='underline text-blue-400'
                      href={originUrl +'/solicitud/' +item.hash_id}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginLeft: 6 }}
                    >
                      Ver Caso Completo
                    </a>
                  ) : (
                    <Text type="secondary" style={{ marginLeft: 6 }}>
                      No disponible
                    </Text>
                  )}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default MyCasesCardView;
