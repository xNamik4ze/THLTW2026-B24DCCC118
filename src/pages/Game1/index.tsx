import React, { useState, useEffect } from 'react';
import { 
  Card, Tabs, Table, Button, Modal, Form, Input, 
  InputNumber, Select, message, Space, Tag, Typography, 
  Row, Col, Statistic, DatePicker 
} from 'antd';
import { 
  PlusOutlined, BookOutlined, SearchOutlined, 
  SettingOutlined, ScheduleOutlined, EyeOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface SoVanBang { id: string; nam: number; soHieuHienTai: number; }
interface QuyetDinh { id: string; soQD: string; ngayBanHanh: string; trichYeu: string; }
interface CauHinhField { id: string; label: string; type: 'String' | 'Number' | 'Date'; }
interface VanBang {
  id: string;
  soVaoSo: number;
  soHieu: string;
  maSV: string;
  hoTen: string;
  ngaySinh: string;
  idQuyetDinh: string;
  extraData: Record<string, any>;
}

const Game1 = () => {
  const [fConfig] = Form.useForm();
  const [fVB] = Form.useForm();
  const [fQD] = Form.useForm();
  const [fSearch] = Form.useForm();

  const [dsSoVanBang, setDsSoVanBang] = useState<SoVanBang[]>([]);
  const [dsCauHinh, setDsCauHinh] = useState<CauHinhField[]>([]);
  const [dsQuyetDinh, setDsQuyetDinh] = useState<QuyetDinh[]>([]);
  const [dsVanBang, setDsVanBang] = useState<VanBang[]>([]);
  const [searchResult, setSearchResult] = useState<VanBang[] | null>(null);
  
  const [viewLogs, setViewLogs] = useState<Record<string, number>>({});

  const [showConfig, setShowConfig] = useState(false);
  const [showVB, setShowVB] = useState(false);
  const [showQD, setShowQD] = useState(false);

  useEffect(() => {
    const config = localStorage.getItem('db_config');
    const vb = localStorage.getItem('db_vb');
    const qd = localStorage.getItem('db_qd');
    const so = localStorage.getItem('db_so');
    const logs = localStorage.getItem('db_logs');
    
    if (config) setDsCauHinh(JSON.parse(config));
    if (vb) setDsVanBang(JSON.parse(vb));
    if (qd) setDsQuyetDinh(JSON.parse(qd));
    if (so) setDsSoVanBang(JSON.parse(so));
    if (logs) setViewLogs(JSON.parse(logs));
  }, []);

  const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const handleSaveQD = (v: any) => {
    const year = dayjs(v.ngayBanHanh).year();
    const newQD = { id: Date.now().toString(), ...v, ngayBanHanh: v.ngayBanHanh.format('YYYY-MM-DD') };
    const updateQD = [newQD, ...dsQuyetDinh];
    setDsQuyetDinh(updateQD); save('db_qd', updateQD);
    
    if (!dsSoVanBang.find(s => s.nam === year)) {
        const newSo = [...dsSoVanBang, { id: Date.now().toString(), nam: year, soHieuHienTai: 0 }];
        setDsSoVanBang(newSo); save('db_so', newSo);
    }
    setShowQD(false); fQD.resetFields();
    message.success('Đã mở sổ và thêm quyết định mới!');
  }

  const handleSaveVB = (v: any) => {
    const qd = dsQuyetDinh.find(q => q.id === v.idQuyetDinh);
    if (!qd) return;
    const year = dayjs(qd.ngayBanHanh).year();
    
    const soIndex = dsSoVanBang.findIndex(s => s.nam === year);
    const moiSoVaoSo = dsSoVanBang[soIndex].soHieuHienTai + 1;
    
    const newVB: VanBang = {
        id: Date.now().toString(),
        ...v,
        soVaoSo: moiSoVaoSo,
        ngaySinh: v.ngaySinh.format('YYYY-MM-DD'),
    };

    const updateVB = [newVB, ...dsVanBang];
    setDsVanBang(updateVB); save('db_vb', updateVB);

    const updateSo = [...dsSoVanBang];
    updateSo[soIndex].soHieuHienTai = moiSoVaoSo;
    setDsSoVanBang(updateSo); save('db_so', updateSo);

    setShowVB(false); fVB.resetFields();
    message.success(`Đã cấp bằng. Số vào sổ mới: ${moiSoVaoSo}`);
  }

  const handleSearch = (v: any) => {
    const params = { 
        soHieu: v.soHieu, 
        soVaoSo: v.soVaoSo, 
        maSV: v.maSV, 
        hoTen: v.hoTen, 
        ngaySinh: v.ngaySinh ? v.ngaySinh.format('YYYY-MM-DD') : undefined 
    };

    const filledCount = Object.values(params).filter(val => val !== undefined && val !== "").length;
    if (filledCount < 2) return message.error('Bảo mật: Yêu cầu nhập ít nhất 2 tham số để tra cứu!');

    const result = dsVanBang.filter(vb => {
        return (params.maSV && vb.maSV.includes(params.maSV)) || 
               (params.hoTen && vb.hoTen.toLowerCase().includes(params.hoTen.toLowerCase())) ||
               (params.soHieu && vb.soHieu === params.soHieu) ||
               (params.soVaoSo && vb.soVaoSo === Number(params.soVaoSo)) ||
               (params.ngaySinh && vb.ngaySinh === params.ngaySinh);
    });

    if (result.length > 0) {
        const newLogs = { ...viewLogs };
        result.forEach(item => {
            newLogs[item.idQuyetDinh] = (newLogs[item.idQuyetDinh] || 0) + 1;
        });
        setViewLogs(newLogs);
        save('db_logs', newLogs);
        message.success(`Tìm thấy ${result.length} kết quả.`);
    } else {
        message.info(' không tìm thấy thông tin văn bằng phù hợp.');
    }
    setSearchResult(result);
  }

  const tabItems = [
    {
      key: '1',
      label: <span><BookOutlined /> Sổ văn bằng</span>,
      children: (
        <Table dataSource={dsVanBang} rowKey="id" columns={[
          { title: 'Số vào sổ', dataIndex: 'soVaoSo', render: (v) => <Tag color="blue">{v}</Tag> },
          { title: 'Họ tên', dataIndex: 'hoTen' },
          { title: 'Mã SV', dataIndex: 'maSV' },
          { title: 'Quyết định', render: (r) => dsQuyetDinh.find(q => q.id === r.idQuyetDinh)?.soQD },
          { title: 'Thông tin thêm', render: (r) => (
             <Space wrap>
                {Object.entries(r.extraData || {}).map(([key, val]: any) => {
                    const label = dsCauHinh.find(c => c.id === key)?.label;
                    return label ? <Tag key={key}>{label}: {val}</Tag> : null;
                })}
             </Space>
          )}
        ]} />
      )
    },
    {
      key: '2',
      label: <span><SearchOutlined /> Tra cứu hệ thống</span>,
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card type="inner" title="Nhập thông tin tìm kiếm">
            <Form form={fSearch} onFinish={handleSearch} layout="vertical">
              <Row gutter={16}>
                <Col span={8}><Form.Item name="maSV" label="Mã Sinh Viên"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="hoTen" label="Họ và Tên"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="soHieu" label="Số hiệu văn bằng"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="soVaoSo" label="Số vào sổ"><InputNumber style={{width:'100%'}}/></Form.Item></Col>
                <Col span={8}><Form.Item name="ngaySinh" label="Ngày sinh"><DatePicker style={{width:'100%'}}/></Form.Item></Col>
              </Row>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit" block>Tra cứu thông tin</Button>
            </Form>
          </Card>
          {searchResult && <Table dataSource={searchResult} rowKey="id" columns={[
              { title: 'Họ tên', dataIndex: 'hoTen' },
              { title: 'Số vào sổ', dataIndex: 'soVaoSo' },
              { title: 'Trạng thái', render: () => <Tag color="green">Hợp lệ</Tag>}
          ]} />}
        </Space>
      )
    },
    {
      key: '3',
      label: <span><ScheduleOutlined /> Thống kê lượt xem</span>,
      children: (
        <Row gutter={16}>
          {dsQuyetDinh.map(qd => (
            <Col span={8} key={qd.id}>
              <Card bordered={false} style={{background: '#f9f9f9', marginBottom: 16}}>
                <Statistic title={`QĐ: ${qd.soQD}`} value={viewLogs[qd.id] || 0} prefix={<EyeOutlined />} suffix="lượt tra cứu" />
                <Text type="secondary">{qd.trichYeu}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 12 }}>
        <Row justify="space-between" align="middle" style={{marginBottom: 24}}>
            <Title level={2} style={{margin: 0}}>QUẢN LÝ VĂN BẰNG & TRA CỨU</Title>
            <Space>
                <Button icon={<SettingOutlined />} onClick={() => setShowConfig(true)}>Cấu hình biểu mẫu</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowVB(true)}>Cấp bằng mới</Button>
            </Space>
        </Row>
        
        <Tabs defaultActiveKey="1" type="card">
          {tabItems.map(item => (
            <Tabs.TabPane tab={item.label} key={item.key}>{item.children}</Tabs.TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal title="Cấp mới văn bằng" visible={showVB} onOk={() => fVB.submit()} onCancel={() => setShowVB(false)} width={800}>
        <Form form={fVB} layout="vertical" onFinish={handleSaveVB}>
            <Row gutter={16}>
                <Col span={12}><Form.Item name="maSV" label="Mã Sinh Viên" rules={[{required: true}]}><Input placeholder="B22..."/></Form.Item></Col>
                <Col span={12}><Form.Item name="hoTen" label="Họ và Tên" rules={[{required: true}]}><Input/></Form.Item></Col>
                <Col span={12}><Form.Item name="soHieu" label="Số hiệu văn bằng" rules={[{required: true}]}><Input/></Form.Item></Col>
                <Col span={12}><Form.Item name="ngaySinh" label="Ngày sinh" rules={[{required: true}]}><DatePicker style={{width: '100%'}}/></Form.Item></Col>
                <Col span={24}>
                    <Form.Item name="idQuyetDinh" label="Thuộc Quyết định tốt nghiệp" rules={[{required: true}]}>
                        <Select placeholder="Chọn quyết định">
                            {dsQuyetDinh.map(q => <Select.Option key={q.id} value={q.id}>{q.soQD} - {q.trichYeu}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Title level={5}>Thông tin bổ sung theo cấu hình</Title>
            <Row gutter={16}>
                {dsCauHinh.map(cfg => (
                    <Col span={12} key={cfg.id}>
                        <Form.Item name={['extraData', cfg.id]} label={cfg.label}>
                            {cfg.type === 'Number' ? <InputNumber style={{width: '100%'}} /> : 
                            cfg.type === 'Date' ? <DatePicker style={{width: '100%'}} /> : <Input />}
                        </Form.Item>
                    </Col>
                ))}
            </Row>
        </Form>
      </Modal>

      <Modal title="Cấu hình trường dữ liệu động" visible={showConfig} onOk={() => fConfig.submit()} onCancel={() => setShowConfig(false)}>
        <Form form={fConfig} layout="vertical" onFinish={(v) => {
            const arr = [...dsCauHinh, { id: Date.now().toString(), ...v }];
            setDsCauHinh(arr); save('db_config', arr);
            setShowConfig(false); fConfig.resetFields();
        }}>
            <Form.Item name="label" label="Tên thông tin (VD: Nơi sinh, Dân tộc)" rules={[{required: true}]}><Input/></Form.Item>
            <Form.Item name="type" label="Kiểu dữ liệu" rules={[{required: true}]}>
                <Select>
                    <Select.Option value="String">Chữ (String)</Select.Option>
                    <Select.Option value="Number">Số (Number)</Select.Option>
                    <Select.Option value="Date">Ngày tháng (Date)</Select.Option>
                </Select>
            </Form.Item>
        </Form>
      </Modal>

      <div style={{position: 'fixed', bottom: 30, right: 30}}>
        <Button type="primary" shape="round" icon={<ScheduleOutlined />} size="large" onClick={() => setShowQD(true)}>Tạo Quyết Định Mới</Button>
      </div>

      <Modal title="Thêm quyết định tốt nghiệp" visible={showQD} onOk={() => fQD.submit()} onCancel={() => setShowQD(false)}>
            <Form form={fQD} layout="vertical" onFinish={handleSaveQD}>
                <Form.Item name="soQD" label="Số hiệu Quyết định" rules={[{required: true}]}><Input/></Form.Item>
                <Form.Item name="ngayBanHanh" label="Ngày ban hành" rules={[{required: true}]}><DatePicker style={{width: '100%'}}/></Form.Item>
                <Form.Item name="trichYeu" label="Trích yếu nội dung"><Input.TextArea rows={3}/></Form.Item>
            </Form>
      </Modal>
    </div>
  );
};

export default Game1;