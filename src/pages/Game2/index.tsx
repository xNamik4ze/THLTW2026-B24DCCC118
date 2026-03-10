import React, { useState, useEffect } from 'react'
import { Card, Tabs, Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Tag, Typography } from 'antd'
import { PlusOutlined, FileSearchOutlined } from '@ant-design/icons'

const { TabPane } = Tabs
const { Title } = Typography

interface MonHoc {
  id: string
  maMon: string
  tenMon: string
  soTinChi: number
}

interface KhoiKienThuc {
  id: string
  tenKhoi: string
}

interface CauHoi {
  id: string
  monHocId: string
  khoiKienThucId: string
  noiDung: string
  mucDo: string
}

interface DeThi {
  id: string
  tenDe: string
  monHocId: string
  dsCauHoi: CauHoi[]
  ngayTao: string
}

const Game2 = () => {

  const [formMon] = Form.useForm()
  const [formKhoi] = Form.useForm()
  const [formCau] = Form.useForm()
  const [formDe] = Form.useForm()

  const [monHoc, setMonHoc] = useState<MonHoc[]>([])
  const [khoiKT, setKhoiKT] = useState<KhoiKienThuc[]>([])
  const [cauHoi, setCauHoi] = useState<CauHoi[]>([])
  const [deThi, setDeThi] = useState<DeThi[]>([])

  const [showMon, setShowMon] = useState(false)
  const [showKhoi, setShowKhoi] = useState(false)
  const [showCauHoi, setShowCauHoi] = useState(false)

  useEffect(() => {
    const m = localStorage.getItem('db_mon')
    const k = localStorage.getItem('db_khoi')
    const c = localStorage.getItem('db_cau')
    const d = localStorage.getItem('db_de')

    if (m) setMonHoc(JSON.parse(m))
    if (k) setKhoiKT(JSON.parse(k))
    if (c) setCauHoi(JSON.parse(c))
    if (d) setDeThi(JSON.parse(d))
  }, [])

  function save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data))
  }

  function themMon(v: any) {
    const item = { id: new Date().getTime().toString(), ...v }
    const arr = [...monHoc, item]
    setMonHoc(arr)
    save('db_mon', arr)
    setShowMon(false)
    formMon.resetFields()
    message.success('Đã thêm môn')
  }

  function themKhoi(v: any) {
    const item = { id: new Date().getTime().toString(), ...v }
    const arr = [...khoiKT, item]
    setKhoiKT(arr)
    save('db_khoi', arr)
    setShowKhoi(false)
    formKhoi.resetFields()
    message.success('Đã thêm khối')
  }

  function themCau(v: any) {
    const item = { id: new Date().getTime().toString(), ...v }
    const arr = [...cauHoi, item]
    setCauHoi(arr)
    save('db_cau', arr)
    setShowCauHoi(false)
    formCau.resetFields()
    message.success('Đã thêm câu hỏi')
  }

  function pick(arr: any[], n: number) {
    const a = [...arr]
    a.sort(() => Math.random() - 0.5)
    return a.slice(0, n)
  }

  function taoDe(v: any) {
    const monHocId = v.monHocId
    const tenDe = v.tenDe
    const soDe = v.soDe || 0
    const soTB = v.soTB || 0
    const soKho = v.soKho || 0
    const soRK = v.soRK || 0

    const list = cauHoi.filter(q => q.monHocId === monHocId)

    const de = list.filter(q => q.mucDo === 'Dễ')
    const tb = list.filter(q => q.mucDo === 'Trung bình')
    const kho = list.filter(q => q.mucDo === 'Khó')
    const rk = list.filter(q => q.mucDo === 'Rất khó')

    if (de.length < soDe || tb.length < soTB || kho.length < soKho || rk.length < soRK) {
      message.error('Không đủ câu hỏi')
      return
    }

    const ds = [
      ...pick(de, soDe),
      ...pick(tb, soTB),
      ...pick(kho, soKho),
      ...pick(rk, soRK)
    ]

    const item = {
      id: new Date().getTime().toString(),
      tenDe,
      monHocId,
      dsCauHoi: ds,
      ngayTao: new Date().toLocaleString()
    }

    const arr = [item, ...deThi]
    setDeThi(arr)
    save('db_de', arr)
    message.success('Đã tạo đề')
  }

  function getMon(id: string) {
    const m = monHoc.find(x => x.id === id)
    if (m) return m.tenMon
    return ''
  }

  function getColor(v: string) {
    if (v === 'Dễ') return 'green'
    if (v === 'Khó') return 'red'
    if (v === 'Rất khó') return 'purple'
    return 'blue'
  }

  return (
    <div style={{ padding: 20 }}>
      <Card>
        <Title level={3}>Hệ thống quản lý ngân hàng câu hỏi</Title>

        <Tabs defaultActiveKey="1" type="card">

          <TabPane tab="Môn học" key="1">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowMon(true)} style={{ marginBottom: 16 }}>
              Thêm môn
            </Button>

            <Table
              dataSource={monHoc}
              rowKey="id"
              columns={[
                { title: 'Mã môn', dataIndex: 'maMon' },
                { title: 'Tên môn', dataIndex: 'tenMon' },
                { title: 'Tín chỉ', dataIndex: 'soTinChi' }
              ]}
            />
          </TabPane>

          <TabPane tab="Khối kiến thức" key="2">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowKhoi(true)} style={{ marginBottom: 16 }}>
              Thêm khối
            </Button>

            <Table
              dataSource={khoiKT}
              rowKey="id"
              columns={[{ title: 'Tên khối', dataIndex: 'tenKhoi' }]}
            />
          </TabPane>

          <TabPane tab="Câu hỏi" key="3">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCauHoi(true)} style={{ marginBottom: 16 }}>
              Thêm câu hỏi
            </Button>

            <Table
              dataSource={cauHoi}
              rowKey="id"
              columns={[
                { title: 'Nội dung', dataIndex: 'noiDung', width: '40%' },
                { title: 'Môn', dataIndex: 'monHocId', render: (id) => getMon(id) },
                { title: 'Mức độ', dataIndex: 'mucDo', render: (v) => <Tag color={getColor(v)}>{v}</Tag> }
              ]}
            />
          </TabPane>

          <TabPane tab="Đề thi" key="4">
            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 20 }}>

              <Card title="Tạo đề" size="small">
                <Form form={formDe} layout="vertical" onFinish={taoDe}>

                  <Form.Item name="tenDe" label="Tên đề" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>

                  <Form.Item name="monHocId" label="Môn" rules={[{ required: true }]}>
                    <Select>
                      {monHoc.map(m => (
                        <Select.Option key={m.id} value={m.id}>{m.tenMon}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Space wrap>
                    <Form.Item name="soDe" label="Dễ"><InputNumber min={0} style={{ width: 60 }} /></Form.Item>
                    <Form.Item name="soTB" label="TB"><InputNumber min={0} style={{ width: 60 }} /></Form.Item>
                    <Form.Item name="soKho" label="Khó"><InputNumber min={0} style={{ width: 60 }} /></Form.Item>
                    <Form.Item name="soRK" label="Rất khó"><InputNumber min={0} style={{ width: 60 }} /></Form.Item>
                  </Space>

                  <Button type="primary" htmlType="submit" block icon={<FileSearchOutlined />}>
                    Tạo đề
                  </Button>

                </Form>
              </Card>

              <Card title="Danh sách đề" size="small">
                <Table
                  dataSource={deThi}
                  rowKey="id"
                  columns={[
                    { title: 'Tên đề', dataIndex: 'tenDe' },
                    { title: 'Môn', dataIndex: 'monHocId', render: (id) => getMon(id) },
                    { title: 'Ngày tạo', dataIndex: 'ngayTao' },
                    { title: 'Số câu', render: (r) => <Tag color="orange">{r.dsCauHoi.length}</Tag> }
                  ]}
                />
              </Card>

            </div>
          </TabPane>

        </Tabs>
      </Card>

      <Modal title="Thêm môn" visible={showMon} onOk={() => formMon.submit()} onCancel={() => setShowMon(false)}>
        <Form form={formMon} layout="vertical" onFinish={themMon}>
          <Form.Item name="maMon" label="Mã môn" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="tenMon" label="Tên môn" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="soTinChi" label="Tín chỉ" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Thêm khối kiến thức" visible={showKhoi} onOk={() => formKhoi.submit()} onCancel={() => setShowKhoi(false)}>
        <Form form={formKhoi} layout="vertical" onFinish={themKhoi}>
          <Form.Item name="tenKhoi" label="Tên khối" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Thêm câu hỏi" visible={showCauHoi} width={600} onOk={() => formCau.submit()} onCancel={() => setShowCauHoi(false)}>
        <Form form={formCau} layout="vertical" onFinish={themCau}>

          <Form.Item name="monHocId" label="Môn học" rules={[{ required: true }]}>
            <Select>
              {monHoc.map(m => <Select.Option key={m.id} value={m.id}>{m.tenMon}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="khoiKienThucId" label="Khối kiến thức" rules={[{ required: true }]}>
            <Select>
              {khoiKT.map(k => <Select.Option key={k.id} value={k.id}>{k.tenKhoi}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="noiDung" label="Nội dung" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="mucDo" label="Mức độ" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Dễ">Dễ</Select.Option>
              <Select.Option value="Trung bình">Trung bình</Select.Option>
              <Select.Option value="Khó">Khó</Select.Option>
              <Select.Option value="Rất khó">Rất khó</Select.Option>
            </Select>
          </Form.Item>

        </Form>
      </Modal>

    </div>
  )
}

export default Game2