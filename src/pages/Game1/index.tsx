import React, { useState, useEffect } from 'react'
import { Card, Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Tag, Typography, Row, Col, Statistic, Rate } from 'antd'
import { PlusOutlined, ScheduleOutlined, TeamOutlined, SkinOutlined, BarChartOutlined, StarOutlined, DeleteOutlined, EditOutlined, MessageOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface NhanVien {
  id: string;
  tenNV: string;
  lichViec: string;
  maxKhach: number;
}

interface DichVu {
  id: string;
  tenDV: string;
  gia: number;
  thoiGian: number;
}

interface LichHen {
  id: string;
  tenKhach: string;
  idNV: string;
  idDV: string;
  thoiGianStart: string;
  trangThai: 'Chờ duyệt' | 'Xác nhận' | 'Hoàn thành' | 'Hủy';
  danhGia: number;
  noiDungDG: string;
  phanHoiNV: string;
}

const Game1 = () => {
  const [formNV] = Form.useForm()
  const [formDV] = Form.useForm()
  const [formLich] = Form.useForm()
  const [formRate] = Form.useForm()
  const [formReply] = Form.useForm()

  const [dsNhanVien, setDsNhanVien] = useState<NhanVien[]>([])
  const [dsDichVu, setDsDichVu] = useState<DichVu[]>([])
  const [dsLichHen, setDsLichHen] = useState<LichHen[]>([])

  const [showNV, setShowNV] = useState(false)
  const [showDV, setShowDV] = useState(false)
  const [showLich, setShowLich] = useState(false)
  const [showRate, setShowRate] = useState<{ open: boolean, id: string }>({ open: false, id: '' })
  const [showReply, setShowReply] = useState<{ open: boolean, id: string }>({ open: false, id: '' })

  const [editingNV, setEditingNV] = useState<NhanVien | null>(null)
  const [editingDV, setEditingDV] = useState<DichVu | null>(null)

  useEffect(() => {
    const nv = localStorage.getItem('db_nv');
    const dv = localStorage.getItem('db_dv');
    const lh = localStorage.getItem('db_lh');
    if (nv) setDsNhanVien(JSON.parse(nv));
    if (dv) setDsDichVu(JSON.parse(dv));
    if (lh) setDsLichHen(JSON.parse(lh));
  }, [])

  const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data))

  const handleSaveNV = (v: any) => {
    let arr;
    if (editingNV) {
      arr = dsNhanVien.map(n => n.id === editingNV.id ? { ...n, ...v } : n);
      message.success('Cập nhật nhân viên thành công');
    } else {
      arr = [...dsNhanVien, { id: Date.now().toString(), ...v }];
      message.success('Thêm nhân viên thành công');
    }
    setDsNhanVien(arr); save('db_nv', arr);
    setShowNV(false); setEditingNV(null); formNV.resetFields();
  }

  const xoaNV = (id: string) => {
    const arr = dsNhanVien.filter(n => n.id !== id);
    setDsNhanVien(arr); save('db_nv', arr);
    message.warning('Đã xóa nhân viên');
  }

  const handleSaveDV = (v: any) => {
    let arr;
    if (editingDV) {
      arr = dsDichVu.map(d => d.id === editingDV.id ? { ...d, ...v } : d);
      message.success('Cập nhật dịch vụ thành công');
    } else {
      arr = [...dsDichVu, { id: Date.now().toString(), ...v }];
      message.success('Thêm dịch vụ thành công');
    }
    setDsDichVu(arr); save('db_dv', arr);
    setShowDV(false); setEditingDV(null); formDV.resetFields();
  }

  const xoaDV = (id: string) => {
    const arr = dsDichVu.filter(d => d.id !== id);
    setDsDichVu(arr); save('db_dv', arr);
    message.warning('Đã xóa dịch vụ');
  }

  const datLich = (v: any) => {
    const { idNV, thoiGianStart } = v;
    const ngay = thoiGianStart.split('T')[0];
    const nv = dsNhanVien.find(x => x.id === idNV);
    
    const soKhachTrongNgay = dsLichHen.filter(l => l.idNV === idNV && l.thoiGianStart.startsWith(ngay) && l.trangThai !== 'Hủy').length;
    if (nv && soKhachTrongNgay >= nv.maxKhach) return message.error('Nhân viên này đã kín lịch ngày hôm nay!');

    if (dsLichHen.some(l => l.idNV === idNV && l.thoiGianStart === thoiGianStart && l.trangThai !== 'Hủy')) 
        return message.error('Giờ này đã có lịch đặt trước!');

    const arr: LichHen[] = [{ id: Date.now().toString(), ...v, trangThai: 'Chờ duyệt', danhGia: 0, noiDungDG: '', phanHoiNV: '' }, ...dsLichHen];
    setDsLichHen(arr); save('db_lh', arr);
    setShowLich(false); formLich.resetFields();
    message.success('Đặt lịch thành công');
  }

  const doiTrangThai = (id: string, st: LichHen['trangThai']) => {
    const arr = dsLichHen.map(l => l.id === id ? { ...l, trangThai: st } : l);
    setDsLichHen(arr); save('db_lh', arr);
  }

  const handleRate = (v: any) => {
    const arr = dsLichHen.map(l => l.id === showRate.id ? { ...l, danhGia: v.danhGia, noiDungDG: v.noiDungDG } : l);
    setDsLichHen(arr); save('db_lh', arr);
    setShowRate({ open: false, id: '' }); formRate.resetFields();
    message.success('Cảm ơn bạn đã đánh giá!');
  }

  const handleReply = (v: any) => {
    const arr = dsLichHen.map(l => l.id === showReply.id ? { ...l, phanHoiNV: v.phanHoiNV } : l);
    setDsLichHen(arr); save('db_lh', arr);
    setShowReply({ open: false, id: '' }); formReply.resetFields();
    message.success('Đã gửi phản hồi của nhân viên');
  }

  const tongDoanhThu = dsLichHen.filter(l => l.trangThai === 'Hoàn thành')
    .reduce((sum, l) => sum + (dsDichVu.find(d => d.id === l.idDV)?.gia || 0), 0);

  const getRating = (idNV: string) => {
    const list = dsLichHen.filter(l => l.idNV === idNV && l.danhGia > 0);
    return list.length ? (list.reduce((s, x) => s + x.danhGia, 0) / list.length).toFixed(1) : '0';
  }

  const tabItems = [
    {
      key: '1',
      label: <span><ScheduleOutlined /> Lịch hẹn</span>,
      children: (
        <>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowLich(true)} style={{ marginBottom: 16 }}>Đặt lịch mới</Button>
          <Table dataSource={dsLichHen} rowKey="id" columns={[
            { title: 'Khách hàng', dataIndex: 'tenKhach' },
            { title: 'NV/Dịch vụ', render: (r) => (
              <div>
                <Text strong>{dsNhanVien.find(n => n.id === r.idNV)?.tenNV}</Text><br/>
                <Text type="secondary">{dsDichVu.find(d => d.id === r.idDV)?.tenDV}</Text>
              </div>
            )},
            { title: 'Thời gian', dataIndex: 'thoiGianStart' },
            { title: 'Trạng thái', render: (r) => <Tag color={r.trangThai==='Hoàn thành'?'green':r.trangThai==='Hủy'?'red':'blue'}>{r.trangThai}</Tag>},
            { title: 'Thao tác', render: (r) => (
              <Space>
                {r.trangThai === 'Chờ duyệt' && <Button size="small" onClick={() => doiTrangThai(r.id, 'Xác nhận')}>Duyệt</Button>}
                {r.trangThai === 'Xác nhận' && <Button size="small" type="primary" onClick={() => doiTrangThai(r.id, 'Hoàn thành')}>Xong</Button>}
                {r.trangThai !== 'Hủy' && r.trangThai !== 'Hoàn thành' && <Button size="small" danger onClick={() => doiTrangThai(r.id, 'Hủy')}>Hủy</Button>}
                {r.trangThai === 'Hoàn thành' && !r.danhGia && <Button size="small" icon={<StarOutlined />} onClick={() => setShowRate({ open: true, id: r.id })}>Đánh giá</Button>}
                {r.danhGia > 0 && !r.phanHoiNV && <Button size="small" icon={<MessageOutlined />} onClick={() => setShowReply({ open: true, id: r.id })}>Phản hồi</Button>}
              </Space>
            )}
          ]} />
        </>
      )
    },
    {
      key: '2',
      label: <span><TeamOutlined /> Nhân viên</span>,
      children: (
        <>
          <Button type="primary" onClick={() => { setEditingNV(null); formNV.resetFields(); setShowNV(true); }} style={{ marginBottom: 16 }}>Thêm NV</Button>
          <Table dataSource={dsNhanVien} rowKey="id" columns={[
            { title: 'Họ tên', dataIndex: 'tenNV' },
            { title: 'Lịch làm', dataIndex: 'lichViec' },
            { title: 'Max/Ngày', dataIndex: 'maxKhach' },
            { title: 'Rating', render: (r) => <Tag color="gold">{getRating(r.id)} ⭐</Tag> },
            { title: 'Thao tác', render: (r) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingNV(r); formNV.setFieldsValue(r); setShowNV(true); }} />
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => xoaNV(r.id)} />
              </Space>
            )}
          ]} />
        </>
      )
    },
    {
      key: '3',
      label: <span><SkinOutlined /> Dịch vụ</span>,
      children: (
        <>
          <Button type="primary" onClick={() => { setEditingDV(null); formDV.resetFields(); setShowDV(true); }} style={{ marginBottom: 16 }}>Thêm DV</Button>
          <Table dataSource={dsDichVu} rowKey="id" columns={[
            { title: 'Tên dịch vụ', dataIndex: 'tenDV' },
            { title: 'Giá', dataIndex: 'gia', render: (v) => v.toLocaleString() + 'đ' },
            { title: 'Thời gian', render: (r) => r.thoiGian + ' phút' },
            { title: 'Thao tác', render: (r) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingDV(r); formDV.setFieldsValue(r); setShowDV(true); }} />
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => xoaDV(r.id)} />
              </Space>
            )}
          ]} />
        </>
      )
    },
{
      key: '4',
      label: <span><BarChartOutlined /> Báo cáo</span>,
      children: (
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="Doanh thu theo dịch vụ" bordered={false} className="stat-card">
              <Table 
                pagination={false} 
                dataSource={dsDichVu.map(d => ({
                  key: d.id,
                  ten: d.tenDV,
                  dt: dsLichHen.filter(l => l.idDV === d.id && l.trangThai === 'Hoàn thành').length * d.gia
                }))} 
                columns={[
                  { title: 'Dịch vụ', dataIndex: 'ten', key: 'ten' }, 
                  { title: 'Doanh thu', render: (r) => <Text type="success" strong>{r.dt.toLocaleString()}đ</Text> }
                ]} 
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Doanh thu theo nhân viên" bordered={false} className="stat-card">
              <Table 
                pagination={false} 
                dataSource={dsNhanVien.map(n => {
                  const doanhThuNV = dsLichHen
                    .filter(l => l.idNV === n.id && l.trangThai === 'Hoàn thành')
                    .reduce((sum, l) => {
                      const giaDV = dsDichVu.find(d => d.id === l.idDV)?.gia || 0;
                      return sum + giaDV;
                    }, 0);
                  
                  return {
                    key: n.id,
                    ten: n.tenNV,
                    dt: doanhThuNV
                  };
                })} 
                columns={[
                  { title: 'Nhân viên', dataIndex: 'ten', key: 'ten' }, 
                  { title: 'Tổng doanh thu', render: (r) => <Text>{r.dt.toLocaleString()}đ</Text> }
                ]} 
              />
            </Card>
          </Col>
        </Row>
      )
    }
  ]

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 8 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>HỆ THỐNG QUẢN LÝ ĐẶT LỊCH - TH03</Title>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}><Statistic title="TỔNG DOANH THU" value={tongDoanhThu} prefix={<BarChartOutlined />} suffix="VNĐ" valueStyle={{ color: '#3f8600' }} /></Col>
          <Col span={12}><Statistic title="TỔNG LỊCH HẸN" value={dsLichHen.length} prefix={<ScheduleOutlined />} /></Col>
        </Row>
        
        <Tabs defaultActiveKey="1" type="card">
          {tabItems.map(item => (
            <Tabs.TabPane tab={item.label} key={item.key}>{item.children}</Tabs.TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal title={editingNV ? "Cập nhật nhân viên" : "Thêm nhân viên mới"} visible={showNV} onOk={() => formNV.submit()} onCancel={() => setShowNV(false)} destroyOnClose>
        <Form form={formNV} layout="vertical" onFinish={handleSaveNV}>
          <Form.Item name="tenNV" label="Tên nhân viên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="lichViec" label="Lịch làm việc" rules={[{ required: true }]}><Input/></Form.Item>
          <Form.Item name="maxKhach" label="Giới hạn khách/ngày" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingDV ? "Sửa dịch vụ" : "Thêm dịch vụ mới"} visible={showDV} onOk={() => formDV.submit()} onCancel={() => setShowDV(false)} destroyOnClose>
        <Form form={formDV} layout="vertical" onFinish={handleSaveDV}>
          <Form.Item name="tenDV" label="Tên dịch vụ" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="gia" label="Đơn giá" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="thoiGian" label="Thời gian thực hiện (phút)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Đặt lịch hẹn" visible={showLich} onOk={() => formLich.submit()} onCancel={() => setShowLich(false)}>
        <Form form={formLich} layout="vertical" onFinish={datLich}>
          <Form.Item name="tenKhach" label="Tên khách hàng" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="idNV" label="Chọn nhân viên" rules={[{ required: true }]}>
            <Select>{dsNhanVien.map(n => <Select.Option key={n.id} value={n.id}>{n.tenNV} ({n.lichViec})</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="idDV" label="Chọn dịch vụ" rules={[{ required: true }]}>
            <Select>{dsDichVu.map(d => <Select.Option key={d.id} value={d.id}>{d.tenDV} - {d.gia.toLocaleString()}đ</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="thoiGianStart" label="Thời gian" rules={[{ required: true }]}><Input type="datetime-local" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Đánh giá dịch vụ" visible={showRate.open} onOk={() => formRate.submit()} onCancel={() => setShowRate({ open: false, id: '' })}>
        <Form form={formRate} layout="vertical" onFinish={handleRate}>
          <Form.Item name="danhGia" label="Mức độ hài lòng" rules={[{ required: true }]}><Rate /></Form.Item>
          <Form.Item name="noiDungDG" label="Ý kiến đóng góp"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Phản hồi khách hàng" visible={showReply.open} onOk={() => formReply.submit()} onCancel={() => setShowReply({ open: false, id: '' })}>
        <Form form={formReply} layout="vertical" onFinish={handleReply}>
          <Form.Item name="phanHoiNV" label="Nội dung phản hồi" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Game1