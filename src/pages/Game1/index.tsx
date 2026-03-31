import React, { useState, useEffect } from 'react';
import { 
  Card, Tabs, Table, Button, Modal, Form, Input, Select, 
  Tag, Space, Typography, Row, Col, Statistic, DatePicker, 
  Switch, message, Tooltip, Empty, Badge, Radio, Descriptions, Avatar
} from 'antd';
import { 
  PlusOutlined, TeamOutlined, SolutionOutlined, 
  BarChartOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EditOutlined, DeleteOutlined, EyeOutlined,
  InfoCircleOutlined, UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface CLB {
  id: string;
  tenCLB: string;
  ngayThanhLap: string;
  moTa: string;
  chuNhiem: string;
  dangHoatDong: boolean;
  logo?: string;
}

interface DonDangKy {
  id: string;
  hoTen: string;
  email: string;
  sdt: string;
  gioiTinh: 'Nam' | 'Nữ' | 'Khác';
  diaChi: string;
  soTruong: string;
  idCLB: string;
  lyDoDangKy: string;
  trangThai: 'Pending' | 'Approved' | 'Rejected';
  ghiChu?: string;
  lichSu: string[];
}

const Game1 = () => {
  const [formCLB] = Form.useForm();
  const [formDon] = Form.useForm();
  const [formReject] = Form.useForm();

  const [dsCLB, setDsCLB] = useState<CLB[]>([]);
  const [dsDon, setDsDon] = useState<DonDangKy[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  const [showCLB, setShowCLB] = useState(false);
  const [showDon, setShowDon] = useState(false);
  const [editingCLB, setEditingCLB] = useState<CLB | null>(null);
  const [editingDon, setEditingDon] = useState<DonDangKy | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<{ids: string[]} | null>(null);
  const [viewingDon, setViewingDon] = useState<DonDangKy | null>(null);

  useEffect(() => {
    const clb = localStorage.getItem('db_clbs');
    const dons = localStorage.getItem('db_dons');   
    if (clb) setDsCLB(JSON.parse(clb));
    if (dons) setDsDon(JSON.parse(dons));
  }, []);

  const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const handleSaveCLB = (v: any) => {
    const newCLB = { 
      ...v, 
      id: editingCLB ? editingCLB.id : Date.now().toString(), 
      ngayThanhLap: v.ngayThanhLap ? v.ngayThanhLap.format('YYYY-MM-DD') : '' 
    };
    const updated = editingCLB ? dsCLB.map(c => c.id === editingCLB.id ? newCLB : c) : [newCLB, ...dsCLB];
    setDsCLB(updated); save('db_clbs', updated);
    setShowCLB(false); setEditingCLB(null); formCLB.resetFields();
    message.success('Cập nhật danh sách CLB thành công!');
  };

  const handleSaveDon = (v: any) => {
    const time = dayjs().format('HH:mm DD/MM/YYYY');
    if (editingDon) {
      const log = `Đã chỉnh sửa thông tin vào lúc ${time}`;
      const updated = dsDon.map(d => d.id === editingDon.id ? { ...d, ...v, lichSu: [log, ...(d.lichSu || [])] } : d);
      setDsDon(updated); save('db_dons', updated);
      message.success('Cập nhật đơn thành công!');
    } else {
      const n: DonDangKy = { 
        ...v, 
        id: Date.now().toString(), 
        trangThai: 'Pending', 
        lichSu: [`Khởi tạo đơn vào lúc ${time}`] 
      };
      const u = [n, ...dsDon]; setDsDon(u); save('db_dons', u);
      message.success('Đã gửi đơn đăng ký!');
    }
    setShowDon(false); setEditingDon(null); formDon.resetFields();
  };

  const processDons = (ids: string[], status: 'Approved' | 'Rejected', reason?: string) => {
    const time = dayjs().format('HH:mm DD/MM/YYYY');
    const action = status === 'Approved' ? 'Approved (Duyệt)' : 'Rejected (Từ chối)';
    const log = `Admin đã ${action} vào lúc ${time}${reason ? ' với lý do: ' + reason : ''}`;

    const updated = dsDon.map(d => {
        if (ids.includes(d.id)) {
        return { 
            ...d, 
            trangThai: status, 
            ghiChu: reason, 
            lichSu: [log, ...(d.lichSu || [])] // Thêm dòng log mới lên đầu
        };
        }
        return d;
    });

    setDsDon(updated);
    save('db_dons', updated);
    setSelectedRowKeys([]);
    setShowRejectModal(null);
    message.success(`Đã ${status === 'Approved' ? 'duyệt' : 'từ chối'} đơn thành công!`);
    };

  const tabItems = [
    {
      key: '1',
      label: <span><TeamOutlined /> Danh sách CLB</span>,
      children: (
        <>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCLB(null); setShowCLB(true); formCLB.resetFields(); }}>Thêm CLB Mới</Button>
          </div>
          <Table dataSource={dsCLB} rowKey="id" columns={[
{ 
          title: 'Tên CLB', 
          dataIndex: 'tenCLB',
          render: (text, record: CLB) => (
            <Space>
              <Avatar 
                src={record.logo} 
                icon={!record.logo && <TeamOutlined />} 
                style={{ backgroundColor: '#1890ff' }}
              />
              <Text strong>{text}</Text>
            </Space>
          ),
          sorter: (a, b) => a.tenCLB.localeCompare(b.tenCLB) 
        },            { title: 'Chủ nhiệm', dataIndex: 'chuNhiem' },
            { title: 'Ngày lập', dataIndex: 'ngayThanhLap' },
            { title: 'Trạng thái', dataIndex: 'dangHoatDong', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Hoạt động' : 'Tạm dừng'}</Tag> },
            { title: 'Thao tác', render: (r) => (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => { setEditingCLB(r); setShowCLB(true); formCLB.setFieldsValue({...r, ngayThanhLap: dayjs(r.ngayThanhLap)}); }} />
                <Button danger icon={<DeleteOutlined />} onClick={() => { const u = dsCLB.filter(c => c.id !== r.id); setDsCLB(u); save('db_clbs', u); }} />
              </Space>
            )}
          ]} />
        </>
      )
    },
    {
      key: '2',
      label: <span><SolutionOutlined /> Quản lý Đơn đăng ký</span>,
      children: (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingDon(null); setShowDon(true); formDon.resetFields(); }}>Thêm đơn mới</Button>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Button icon={<CheckCircleOutlined />} style={{color: '#52c41a'}} onClick={() => processDons(selectedRowKeys as string[], 'Approved')}>Duyệt {selectedRowKeys.length} đơn</Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={() => setShowRejectModal({ids: selectedRowKeys as string[]})}>Từ chối {selectedRowKeys.length} đơn</Button>
              </Space>
            )}
          </Space>
          <Table 
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} 
            dataSource={dsDon} 
            rowKey="id" 
            scroll={{ x: 1100 }}
            columns={[
              { title: 'Họ tên', dataIndex: 'hoTen', fixed: 'left', width: 150 },
              { title: 'CLB', render: (r) => dsCLB.find(c => c.id === r.idCLB)?.tenCLB || 'N/A' },
              { title: 'Email', dataIndex: 'email' },
              { title: 'SĐT', dataIndex: 'sdt' },
              { title: 'Trạng thái', dataIndex: 'trangThai', render: (s) => (
                <Tag color={s === 'Approved' ? 'green' : s === 'Rejected' ? 'red' : 'gold'}>{s}</Tag>
              )},
              { title: 'Thao tác', fixed: 'right', width: 220, render: (r) => (
                <Space>
                  <Tooltip title="Chi tiết"><Button icon={<EyeOutlined />} onClick={() => setViewingDon(r)} /></Tooltip>
                  <Tooltip title="Sửa"><Button icon={<EditOutlined />} onClick={() => { setEditingDon(r); setShowDon(true); formDon.setFieldsValue(r); }} /></Tooltip>
                  {r.trangThai === 'Pending' && <Button type="link" onClick={() => processDons([r.id], 'Approved')}>Duyệt</Button>}
                  <Button type="link" danger onClick={() => setShowRejectModal({ids: [r.id]})}>Từ chối</Button>
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => { const u = dsDon.filter(d => d.id !== r.id); setDsDon(u); save('db_dons', u); }} />
                </Space>
              )}
            ]} 
          />
        </>
      )
    },
    {
      key: '3',
      label: <span><UserOutlined /> Thành viên chính thức</span>,
      children: (
        <Table dataSource={dsDon.filter(d => d.trangThai === 'Approved')} rowKey="id" columns={[
          { title: 'Họ tên', dataIndex: 'hoTen' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Câu lạc bộ', render: (r) => <Tag color="blue">{dsCLB.find(c => c.id === r.idCLB)?.tenCLB}</Tag> },
          { title: 'Số điện thoại', dataIndex: 'sdt' }
        ]} />
      )
    },
    {
      key: '4',
      label: <span><BarChartOutlined /> Thống kê & Báo cáo</span>,
      children: (
        <Row gutter={[16, 16]}>
          <Col span={6}><Card><Statistic title="Tổng số CLB" value={dsCLB.length} prefix={<TeamOutlined />} /></Card></Col>
          <Col span={6}><Card><Statistic title="Đang chờ duyệt" value={dsDon.filter(d => d.trangThai === 'Pending').length} valueStyle={{color:'#faad14'}} /></Card></Col>
          <Col span={6}><Card><Statistic title="Đã trúng tuyển" value={dsDon.filter(d => d.trangThai === 'Approved').length} valueStyle={{color:'#52c41a'}} /></Card></Col>
          <Col span={6}><Card><Statistic title="Đã từ chối" value={dsDon.filter(d => d.trangThai === 'Rejected').length} valueStyle={{color:'#f5222d'}} /></Card></Col>
          <Col span={24}>
            <Card title="Phân bổ đơn đăng ký theo từng Câu lạc bộ">
              {dsCLB.length > 0 ? dsCLB.map(clb => {
                const dons = dsDon.filter(d => d.idCLB === clb.id);
                const app = dons.filter(d => d.trangThai === 'Approved').length;
                const rej = dons.filter(d => d.trangThai === 'Rejected').length;
                const pen = dons.filter(d => d.trangThai === 'Pending').length;
                const total = dons.length || 1;
                
                return (
                  <div key={clb.id} style={{ marginBottom: 25 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text strong>{clb.tenCLB}</Text>
                      <Text type="secondary">Tổng cộng: {dons.length} đơn</Text>
                    </div>
                    <Tooltip title={`Duyệt: ${app} | Chờ: ${pen} | Từ chối: ${rej}`}>
                      <div style={{ display: 'flex', height: 24, borderRadius: 12, overflow: 'hidden', background: '#f0f0f0', cursor: 'pointer' }}>
                        <div style={{ width: `${(app/total)*100}%`, background: '#52c41a', transition: 'width 0.5s' }} />
                        <div style={{ width: `${(pen/total)*100}%`, background: '#faad14', transition: 'width 0.5s' }} />
                        <div style={{ width: `${(rej/total)*100}%`, background: '#f5222d', transition: 'width 0.5s' }} />
                      </div>
                    </Tooltip>
                    <div style={{ marginTop: 5, fontSize: '12px', display: 'flex', gap: '15px' }}>
                      <Badge color="#52c41a" text={`Duyệt (${app})`} />
                      <Badge color="#faad14" text={`Chờ (${pen})`} />
                      <Badge color="#f5222d" text={`Từ chối (${rej})`} />
                    </div>
                  </div>
                );
              }) : <Empty description="Chưa có dữ liệu CLB" />}
            </Card>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 30, color: '#1890ff' }}>HỆ THỐNG QUẢN LÝ CÂU LẠC BỘ SINH VIÊN</Title>
            <Tabs defaultActiveKey="1" type="card">
            {tabItems.map((item) => (
                <Tabs.TabPane 
                tab={item.label} 
                key={item.key}
                >
                {item.children}
                </Tabs.TabPane>
            ))}
            </Tabs>
      </Card>
      <Modal 
        title="CHI TIẾT & LỊCH SỬ THAO TÁC" 
        visible={!!viewingDon} 
        onCancel={() => setViewingDon(null)} 
        width={800} 
        footer={null}
        >
        {viewingDon && (
            <Tabs defaultActiveKey="info">
            <Tabs.TabPane tab="Thông tin cá nhân" key="info">
                <Descriptions bordered column={2}>
                <Descriptions.Item label="Họ tên" span={2}>{viewingDon.hoTen}</Descriptions.Item>
                <Descriptions.Item label="Email">{viewingDon.email}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{viewingDon.sdt}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">{viewingDon.gioiTinh}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{viewingDon.diaChi}</Descriptions.Item>
                <Descriptions.Item label="Sở trường" span={2}>{viewingDon.soTruong}</Descriptions.Item>
                <Descriptions.Item label="Lý do tham gia" span={2}>{viewingDon.lyDoDangKy}</Descriptions.Item>
                <Descriptions.Item label="Ghi chú Admin" span={2} labelStyle={{color:'red'}}>
                    {viewingDon.ghiChu || 'Không có'}
                </Descriptions.Item>
                </Descriptions>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Lịch sử thao tác" key="history">
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {viewingDon.lichSu?.map((l, i) => (
                    <div key={i} style={{padding:'8px 0', borderBottom:'1px solid #eee'}}>
                    • {l}
                    </div>
                ))}
                {(!viewingDon.lichSu || viewingDon.lichSu.length === 0) && (
                    <Empty description="Chưa có lịch sử" />
                )}
                </div>
            </Tabs.TabPane>
            </Tabs>
        )}
        </Modal>

      <Modal title={editingCLB ? "Cập nhật CLB" : "Thêm CLB Mới"} visible={showCLB} onOk={() => formCLB.submit()} onCancel={() => setShowCLB(false)} destroyOnClose>
        <Form form={formCLB} layout="vertical" onFinish={handleSaveCLB}>
          <Form.Item name="logo" label="Link Ảnh đại diện (URL)">
            <Input placeholder="https://www.bing.com/images/search?view=detailV2&ccid=nZ8ODRC7&id=36C26BE3B04FE06681FF7C1BF58DD7B113165731&thid=OIP.nZ8ODRC75WzPn0aHSHMUBAHaD4&mediaurl=https%3a%2f%2fnavigates.vn%2fwp-content%2fuploads%2f2023%2f04%2fptit.jpg&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.9d9f0e0d10bbe56ccf9f468748731404%3frik%3dMVcWE7HXjfUbfA%26pid%3dImgRaw%26r%3d0&exph=445&expw=850&q=petit+logo&FORM=IRPRST&ck=325E214684F846BAA90BD75471EEF412&selectedIndex=0&itb=0&idpp=overlayview&ajaxhist=0&ajaxserp=0" />
          </Form.Item>
          <Form.Item name="tenCLB" label="Tên CLB" rules={[{required: true, message: 'Vui lòng nhập tên CLB'}]}><Input/></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="ngayThanhLap" label="Ngày thành lập"><DatePicker style={{width:'100%'}}/></Form.Item></Col>
            <Col span={12}><Form.Item name="chuNhiem" label="Chủ nhiệm CLB"><Input/></Form.Item></Col>
          </Row>
          <Form.Item name="moTa" label="Mô tả ngắn"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="dangHoatDong" label="Đang hoạt động" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Xác nhận từ chối đơn" visible={!!showRejectModal} onOk={() => formReject.submit()} onCancel={() => setShowRejectModal(null)} okText="Xác nhận từ chối" okButtonProps={{danger: true}}>
        <Form form={formReject} onFinish={(v) => processDons(showRejectModal!.ids, 'Rejected', v.reason)}>
          <p><InfoCircleOutlined style={{color: '#ff4d4f'}} /> Bạn đang thực hiện từ chối <b>{showRejectModal?.ids.length}</b> đơn đăng ký.</p>
          <Form.Item name="reason" label="Lý do từ chối (bắt buộc)" rules={[{required: true, message: 'Phải nhập lý do'}]}><Input.TextArea rows={3} placeholder="Nhập lý do tại đây..." /></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingDon ? "Sửa đơn đăng ký" : "Thêm đơn mới"} visible={showDon} onOk={() => formDon.submit()} onCancel={() => setShowDon(false)} width={700}>
        <Form form={formDon} layout="vertical" onFinish={handleSaveDon}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="hoTen" label="Họ tên" rules={[{required: true}]}><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="email" label="Email" rules={[{required: true, type:'email'}]}><Input/></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="sdt" label="SĐT"><Input/></Form.Item></Col>
            <Col span={8}>
              <Form.Item name="gioiTinh" label="Giới tính" initialValue="Nam">
                <Radio.Group><Radio value="Nam">Nam</Radio><Radio value="Nữ">Nữ</Radio></Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="idCLB" label="CLB" rules={[{required: true}]}>
                <Select>{dsCLB.map(c => <Select.Option key={c.id} value={c.id}>{c.tenCLB}</Select.Option>)}</Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="diaChi" label="Địa chỉ"><Input/></Form.Item>
          <Form.Item name="soTruong" label="Sở trường"><Input.TextArea rows={2}/></Form.Item>
          <Form.Item name="lyDoDangKy" label="Lý do đăng ký"><Input.TextArea rows={2}/></Form.Item>
        </Form>
      </Modal>

      <Modal title="Lý do từ chối" visible={!!showRejectModal} onOk={() => formReject.submit()} onCancel={() => setShowRejectModal(null)} okText="Xác nhận từ chối" okButtonProps={{danger: true}}>
        <Form form={formReject} onFinish={(v) => processDons(showRejectModal!.ids, 'Rejected', v.reason)}>
          <Text type="danger"><InfoCircleOutlined /> Bạn đang từ chối {showRejectModal?.ids.length} đơn.</Text>
          <Form.Item name="reason" label="Lý do (bắt buộc)" rules={[{required: true, message: 'Nhập lý do'}]} style={{marginTop: 15}}>
            <Input.TextArea rows={3} placeholder="Nhập lý do tại đây..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Game1;