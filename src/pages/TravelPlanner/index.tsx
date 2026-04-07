import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, Menu, Card, Row, Col, Button, Modal, Form, Input, 
  InputNumber, Select, Rate, Tag, Space, Typography, Table, 
  Statistic, Alert, Progress, Divider, message, Badge, Drawer, Empty
} from 'antd';
import { 
  HomeOutlined, CalendarOutlined, SettingOutlined, PlusOutlined,
  DeleteOutlined, MenuOutlined, BarChartOutlined, 
  DollarOutlined, HistoryOutlined, EnvironmentOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

interface DiemDen {
  id: string;
  ten: string;
  loaiHinh: 'biển' | 'núi' | 'thành phố';
  hinhAnh: string;
  diaDiem: string;
  rating: number;
  giaThamQuan: number;
  anUong: number;
  luuTru: number;
  diChuyen: number;
  moTa: string;
  timeuse: number;
}

interface KeHoachItem {
  id: string;
  idDiemDen: string;
  ngay: number;
  thang: number; 
}

const TravelApp = () => {
  const [dsDiemDen, setDsDiemDen] = useState<DiemDen[]>([]);
  const [keHoach, setKeHoach] = useState<KeHoachItem[]>([]);
  const [nganSachToiDa] = useState<number>(10000000);
  const [currentTab, setCurrentTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiemDen, setEditingDiemDen] = useState<DiemDen | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ type: 'all', sort: 'rating' });

  useEffect(() => {
    const savedDest = localStorage.getItem('travel_destinations_final');
    const savedPlan = localStorage.getItem('travel_plans_final');
    if (savedDest) setDsDiemDen(JSON.parse(savedDest));
    if (savedPlan) setKeHoach(JSON.parse(savedPlan));
  }, []);

  const saveToStorage = (d: DiemDen[], p: KeHoachItem[]) => {
    localStorage.setItem('travel_destinations_final', JSON.stringify(d));
    localStorage.setItem('travel_plans_final', JSON.stringify(p));
  };

  const handleSaveDiemDen = (values: any) => {
    const newItem = { ...values, id: editingDiemDen?.id || Date.now().toString() };
    const updated = editingDiemDen 
      ? dsDiemDen.map(d => d.id === editingDiemDen.id ? newItem : d) 
      : [newItem, ...dsDiemDen];
    
    setDsDiemDen(updated);
    saveToStorage(updated, keHoach);
    setIsModalOpen(false);
    message.success(editingDiemDen ? 'Cập nhật thành công!' : 'Thêm điểm mới thành công!');
  };

  const stats = useMemo(() => {
    const res = { 
      totalCost: 0, anUong: 0, luuTru: 0, diChuyen: 0, ve: 0, thoiGian: 0,
      popular: {} as any, countByMonth: Array(12).fill(0) 
    };

    keHoach.forEach(item => {
      const d = dsDiemDen.find(x => x.id === item.idDiemDen);
      if (d) {
        res.anUong += d.anUong; res.luuTru += d.luuTru;
        res.diChuyen += d.diChuyen; res.ve += d.giaThamQuan;
        res.thoiGian += d.timeuse;
        res.totalCost += (d.anUong + d.luuTru + d.diChuyen + d.giaThamQuan);
        res.countByMonth[item.thang || 0]++;
        res.popular[d.ten] = (res.popular[d.ten] || 0) + 1;
      }
    });
    return res;
  }, [keHoach, dsDiemDen]);

  const renderHome = () => {
    const filtered = dsDiemDen
      .filter(d => filters.type === 'all' || d.loaiHinh === filters.type)
      .sort((a, b) => filters.sort === 'rating' ? b.rating - a.rating : a.giaThamQuan - b.giaThamQuan);

    return (
      <div style={{ padding: '24px' }}>
        <Space wrap style={{ marginBottom: 24 }}>
          <Select defaultValue="all" style={{ width: 160 }} onChange={v => setFilters({...filters, type: v})}>
            <Select.Option value="all">Tất cả loại hình</Select.Option>
            <Select.Option value="biển">Sóng biển</Select.Option>
            <Select.Option value="núi">Vùng núi</Select.Option>
            <Select.Option value="thành phố">Thành phố</Select.Option>
          </Select>
          <Select defaultValue="rating" style={{ width: 160 }} onChange={v => setFilters({...filters, sort: v})}>
            <Select.Option value="rating">Đánh giá cao nhất</Select.Option>
            <Select.Option value="price">Giá vé tăng dần</Select.Option>
          </Select>
        </Space>

        <Row gutter={[20, 20]}>
          {filtered.map(item => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                cover={<img src={item.hinhAnh} style={{ height: 180, objectFit: 'cover' }} alt="travel" />}
                actions={[
                  <Button type="primary" ghost onClick={() => {
                    const p = [...keHoach, { id: Date.now().toString(), idDiemDen: item.id, ngay: 1, thang: new Date().getMonth() }];
                    setKeHoach(p); saveToStorage(dsDiemDen, p);
                    message.success(`Đã thêm ${item.ten} vào lịch trình`);
                  }}>Chọn điểm này</Button>
                ]}
              >
                <Meta 
                  title={item.ten} 
                  description={<><Tag color="cyan">{item.loaiHinh}</Tag> <Rate disabled defaultValue={item.rating} style={{fontSize: 12}} /></>} 
                />
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 12, height: 44, color: '#666' }}>
                  {item.moTa || 'Trải nghiệm hành trình tuyệt vời tại địa điểm này...'}
                </Paragraph>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary"><EnvironmentOutlined /> {item.diaDiem}</Text>
                    <Text strong type="danger">{item.giaThamQuan.toLocaleString()}đ</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderPlanner = () => (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={15}>
          <Card title={<Space><CalendarOutlined /> Lịch trình chi tiết</Space>} bodyStyle={{ padding: 0 }}>
            <Table 
              dataSource={keHoach} 
              rowKey="id" 
              pagination={{ pageSize: 5 }}
              scroll={{ x: 600 }}
              columns={[
                { title: 'Điểm đến', render: (r) => dsDiemDen.find(x => x.id === r.idDiemDen)?.ten },
                { title: 'Tháng', dataIndex: 'thang', render: (t) => `Tháng ${t + 1}` },
                { title: 'Ngày đi', dataIndex: 'ngay', render: (n, r) => <InputNumber min={1} value={n} onChange={v => {
                  const p = keHoach.map(item => item.id === r.id ? {...item, ngay: v || 1} : item);
                  setKeHoach(p); saveToStorage(dsDiemDen, p);
                }} /> },
                { title: 'Tác vụ', render: (_, r) => <Button danger icon={<DeleteOutlined />} onClick={() => {
                  const p = keHoach.filter(i => i.id !== r.id);
                  setKeHoach(p); saveToStorage(dsDiemDen, p);
                }} /> }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card title="Phân tích ngân sách">
            <Statistic 
              title="Tổng chi phí dự kiến" 
              value={stats.totalCost} 
              suffix="VNĐ" 
              valueStyle={{ color: stats.totalCost > nganSachToiDa ? '#cf1322' : '#3f8600' }} 
            />
            <Progress 
                percent={Math.min(100, Math.round((stats.totalCost / nganSachToiDa) * 100))} 
                status={stats.totalCost > nganSachToiDa ? "exception" : "active"} 
                strokeColor={stats.totalCost > nganSachToiDa ? '#ff4d4f' : '#52c41a'}
            />
            {stats.totalCost > nganSachToiDa && <Alert message="Cảnh báo: Vượt ngân sách 10tr!" type="error" showIcon style={{ marginTop: 12 }} />}
            
            <Divider orientation="left">Chi tiết hạng mục</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Badge color="orange" text={`Ăn uống: ${stats.anUong.toLocaleString()}đ`} />
              <Badge color="blue" text={`Lưu trú: ${stats.luuTru.toLocaleString()}đ`} />
              <Badge color="green" text={`Di chuyển: ${stats.diChuyen.toLocaleString()}đ`} />
              <Badge color="purple" text={`Vé tham quan: ${stats.ve.toLocaleString()}đ`} />
            </Space>
            <Divider />
            <Statistic title="Tổng thời gian trải nghiệm" value={stats.thoiGian} suffix="giờ" />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderStats = () => (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card shadow-sm><Statistic title="Doanh thu hệ thống" value={stats.totalCost} prefix={<DollarOutlined />} suffix="đ" /></Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card><Statistic title="Tổng lượt Booking" value={keHoach.length} prefix={<HistoryOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
            <Card title="Top địa điểm">
                {Object.entries(stats.popular).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([name, count]: any) => (
                    <div key={name} style={{marginBottom: 8}}>
                        <Text strong>{name}</Text> <Tag color="gold">{count} lượt</Tag>
                    </div>
                ))}
                {keHoach.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" />}
            </Card>
        </Col>
      </Row>
      
      <Card title="Biểu đồ phân bổ chi phí (%)" style={{ marginTop: 24 }}>
         <Row gutter={40}>
             <Col span={12}>
                <Text>Ăn uống</Text><Progress percent={stats.totalCost ? Math.round((stats.anUong/stats.totalCost)*100) : 0} strokeColor="orange" />
                <Text>Lưu trú</Text><Progress percent={stats.totalCost ? Math.round((stats.luuTru/stats.totalCost)*100) : 0} strokeColor="blue" />
             </Col>
             <Col span={12}>
                <Text>Di chuyển</Text><Progress percent={stats.totalCost ? Math.round((stats.diChuyen/stats.totalCost)*100) : 0} strokeColor="green" />
                <Text>Vé tham quan</Text><Progress percent={stats.totalCost ? Math.round((stats.ve/stats.totalCost)*100) : 0} strokeColor="purple" />
             </Col>
         </Row>
      </Card>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: 'black', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'red', fontWeight: 'bold', fontSize: '18px' }}>TRAVEL PLANNER</div>
        
        <Menu theme="light" mode="horizontal" className="desktop-menu" selectedKeys={[currentTab]} onClick={e => setCurrentTab(e.key)} style={{ flex: 1, marginLeft: 30 }} items={[
          { key: 'home', icon: <HomeOutlined />, label: 'Khám phá' },
          { key: 'planner', icon: <CalendarOutlined />, label: 'Lịch trình'},
          { key: 'stats', icon: <BarChartOutlined />, label: 'Thống kê'},
          { key: 'admin', icon: <SettingOutlined />, label: 'Quản trị'},
        ]} />

        <Button className="mobile-menu-btn" icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)} style={{ display: 'none' }} />
      </Header>

      <Content style={{ background: '#f0f2f5' }}>
        {currentTab === 'home' && renderHome()}
        {currentTab === 'planner' && renderPlanner()}
        {currentTab === 'stats' && renderStats()}
        {currentTab === 'admin' && (
          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Title level={4}>Quản lý cơ sở dữ liệu</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingDiemDen(null); setIsModalOpen(true); form.resetFields(); }}>Thêm điểm mới</Button>
            </div>
            <Table dataSource={dsDiemDen} rowKey="id" scroll={{ x: 900 }} columns={[
              { title: 'Tên địa điểm', dataIndex: 'ten', render: (t) => <Text strong>{t}</Text> },
              { title: 'Loại', dataIndex: 'loaiHinh', render: (l) => <Tag color="geekblue">{l.toUpperCase()}</Tag> },
              { title: 'Giá vé', dataIndex: 'giaThamQuan', render: (v) => `${v.toLocaleString()}đ` },
              { title: 'Đánh giá', dataIndex: 'rating', render: (r) => <Rate disabled defaultValue={r} style={{ fontSize: 10 }} /> },
              { title: 'Thao tác', render: (r) => <Space>
                <Button size="small" onClick={() => { setEditingDiemDen(r); setIsModalOpen(true); form.setFieldsValue(r); }}>Sửa</Button>
                <Button danger size="small" onClick={() => {
                  const updated = dsDiemDen.filter(d => d.id !== r.id);
                  setDsDiemDen(updated); saveToStorage(updated, keHoach);
                }}>Xóa</Button>
              </Space> }
            ]} />
          </div>
        )}
      </Content>

      <Modal 
        title={editingDiemDen ? "Chỉnh sửa địa điểm" : "Thêm địa điểm du lịch mới"} 
        visible={isModalOpen} 
        onOk={() => form.submit()} 
        onCancel={() => setIsModalOpen(false)} 
        width={750}
        okText="Lưu thông tin"
        cancelText="Hủy bỏ"
      >
        <Form form={form} layout="vertical" onFinish={handleSaveDiemDen}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="ten" label="Tên điểm đến" rules={[{required: true}]}><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="diaDiem" label="Địa điểm" rules={[{required: true}]}><Input/></Form.Item></Col>
            <Col span={8}><Form.Item name="loaiHinh" label="Loại hình" rules={[{required: true}]}><Select options={[{value:'biển', label:'Vùng Biển'},{value:'núi', label:'Vùng Núi'},{value:'thành phố', label:'Thành phố'}]}/></Form.Item></Col>
            <Col span={8}><Form.Item name="rating" label="Đánh giá sao"><Rate/></Form.Item></Col>
            <Col span={8}><Form.Item name="timeuse" label="Thời gian (Giờ)" rules={[{required: true}]}><InputNumber style={{width:'100%'} } min={1}/></Form.Item></Col>
            <Col span={24}><Form.Item name="hinhAnh" label="Link hình ảnh (URL)" rules={[{required: true}]}><Input/></Form.Item></Col>
            <Col span={24}><Form.Item name="moTa" label="Mô tả chi tiết" rules={[{required: true}]}><Input.TextArea rows={3} placeholder="Mô tả về nơi này..."/></Form.Item></Col>
            
            <Divider orientation="left" plain>Dự toán chi phí (đ/người)</Divider>
            <Col span={6}><Form.Item name="giaThamQuan" label="Giá vé" rules={[{required: true}]}><InputNumber style={{width:'100%'} } step={10000}/></Form.Item></Col>
            <Col span={6}><Form.Item name="anUong" label="Ăn uống" rules={[{required: true}]}><InputNumber style={{width:'100%'} } step={10000}/></Form.Item></Col>
            <Col span={6}><Form.Item name="luuTru" label="Lưu trú" rules={[{required: true}]}><InputNumber style={{width:'100%'} } step={10000}/></Form.Item></Col>
            <Col span={6}><Form.Item name="diChuyen" label="Đi lại" rules={[{required: true}]}><InputNumber style={{width:'100%'} } step={10000}/></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Drawer title="Menu điều hướng" placement="right" onClose={() => setMobileMenuOpen(false)} visible={mobileMenuOpen}>
        <Menu mode="vertical" selectedKeys={[currentTab]} onClick={e => { setCurrentTab(e.key); setMobileMenuOpen(false); }} items={[
          { key: 'home', icon: <HomeOutlined />, label: 'Khám phá' },
          { key: 'planner', icon: <CalendarOutlined />, label: 'Lịch trình' },
          { key: 'stats', icon: <BarChartOutlined />, label: 'Thống kê' },
          { key: 'admin', icon: <SettingOutlined />, label: 'Quản trị' },
        ]} />
      </Drawer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
        .ant-layout-header { line-height: 64px; }
      `}</style>
    </Layout>
  );
};

export default TravelApp;