import React, { useState, useEffect } from 'react'
import {
Card, Tabs, Table, Button, Modal, Form,
Input, InputNumber, Popconfirm, message,
Tag, Select, DatePicker, Progress, Typography
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TabPane } = Tabs
const { Text } = Typography

const Game2 = () => {

const [form1] = Form.useForm()
const [form2] = Form.useForm()
const [form3] = Form.useForm()

const [monHoc, setMonHoc] = useState<string[]>([])
const [dsTienDo, setDsTienDo] = useState<any[]>([])
const [mucTieu, setMucTieu] = useState<any>({})

const [open1, setOpen1] = useState(false)
const [open2, setOpen2] = useState(false)
const [open3, setOpen3] = useState(false)

const [idDangSua, setIdDangSua] = useState<any>(null)
const [monDangChon, setMonDangChon] = useState('')

useEffect(() => {

let data1 = localStorage.getItem('study_categories')
let data2 = localStorage.getItem('study_progress')
let data3 = localStorage.getItem('study_goals')

if (data1) {
  try {
    setMonHoc(JSON.parse(data1))
  } catch {
    setMonHoc([])
  }
} else {
  setMonHoc(['Toán', 'Văn', 'Anh', 'Khoa học'])
}

if (data2) {
  try {
    setDsTienDo(JSON.parse(data2))
  } catch {
    setDsTienDo([])
  }
}

if (data3) {
  try {
    setMucTieu(JSON.parse(data3))
  } catch {
    setMucTieu({})
  }
}

}, [])

const saveLocal = (key: string, value: any) => {
localStorage.setItem(key, JSON.stringify(value))
}

const themMon = (values: any) => {
let arr = [...monHoc]
arr.push(values.name)

setMonHoc(arr)
saveLocal('study_categories', arr)

setOpen1(false)
form1.resetFields()

message.success('Thêm thành công')

}

const xoaMon = (index: number) => {
let arr = monHoc.filter((_, i) => i !== index)
setMonHoc(arr)
saveLocal('study_categories', arr)
}

const luuTienDo = (values: any) => {

let obj = {
  ...values,
  id: idDangSua ? idDangSua : Date.now(),
  date: values.date ? values.date.format('YYYY-MM-DD HH:mm') : ''
}

let arr: any[] = []

if (idDangSua) {
  arr = dsTienDo.map(item => {
    if (item.id === idDangSua) return obj
    return item
  })
} else {
  arr = [obj, ...dsTienDo]
}

setDsTienDo(arr)
saveLocal('study_progress', arr)

setOpen2(false)
setIdDangSua(null)
form2.resetFields()

message.success('Lưu xong')

}

const luuMucTieu = (values: any) => {
let temp = { ...mucTieu }
temp[monDangChon] = values.target

setMucTieu(temp)
saveLocal('study_goals', temp)

setOpen3(false)
message.success('Đã cập nhật')

}

const tinhTong = (mon: string) => {
let tong = 0

for (let i = 0; i < dsTienDo.length; i++) {
  if (dsTienDo[i].subject === mon) {
    tong += dsTienDo[i].duration ? dsTienDo[i].duration : 0
  }
}

return tong

}

return (
<div style={{ padding: 20 }}>
<Card title="BÀI 2: QUẢN LÝ TIẾN ĐỘ"
style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
>
<Tabs defaultActiveKey="1">

      <TabPane tab="Danh mục" key="1">

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen1(true)}
          style={{ marginBottom: 16 }}
        >
          Thêm môn
        </Button>

        <Table
          dataSource={monHoc.map((m, i) => ({ key: i, name: m }))}
          columns={[
            { title: 'Tên môn học', dataIndex: 'name' },
            {
              title: 'Thao tác',
              render: (_, __, index) => (
                <Popconfirm
                  title="Xóa môn?"
                  onConfirm={() => xoaMon(index)}
                >
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              )
            }
          ]}
          pagination={{ pageSize: 5 }}
        />

      </TabPane>

      <TabPane tab="Tiến độ" key="2">

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIdDangSua(null)
            setOpen2(true)
          }}
          style={{ marginBottom: 16 }}
        >
          Thêm buổi học
        </Button>

        <Table
          dataSource={dsTienDo}
          rowKey="id"
          columns={[
            {
              title: 'Môn',
              dataIndex: 'subject',
              render: (text) => <Tag color="blue">{text}</Tag>
            },
            { title: 'Ngày giờ', dataIndex: 'date' },
            { title: 'Thời lượng', dataIndex: 'duration' },
            { title: 'Nội dung', dataIndex: 'content' },
            {
              title: 'Thao tác',
              render: (record) => (
                <div style={{ display: 'flex', gap: 5 }}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setIdDangSua(record.id)
                      form2.setFieldsValue({
                        ...record,
                        date: record.date ? dayjs(record.date) : null
                      })
                      setOpen2(true)
                    }}
                  />
                  <Popconfirm
                    title="Xóa?"
                    onConfirm={() => {
                      let arr = dsTienDo.filter(x => x.id !== record.id)
                      setDsTienDo(arr)
                      saveLocal('study_progress', arr)
                    }}
                  >
                    <Button danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              )
            }
          ]}
        />

      </TabPane>

      <TabPane tab="Mục tiêu" key="3">

        <div style={{ maxWidth: 600, paddingTop: 10 }}>

          {monHoc.map(m => {

            let tong = tinhTong(m)
            let target = mucTieu[m] ? mucTieu[m] : 0

            let percent = 0
            if (target > 0) {
              percent = Math.round((tong / target) * 100)
              if (percent > 100) percent = 100
            }

            return (
              <div
                key={m}
                style={{
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 15
                }}
              >
                <div style={{ width: 100 }}>
                  <Text strong>{m}</Text>
                </div>

                <div style={{ width: 300 }}>
                  <Progress
                    percent={percent}
                    status={target > 0 && tong >= target ? 'success' : 'active'}
                    format={() => `${tong}/${target}`}
                  />
                </div>

                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setMonDangChon(m)
                    form3.setFieldsValue({ target: target })
                    setOpen3(true)
                  }}
                />
              </div>
            )

          })}

        </div>

      </TabPane>

    </Tabs>
  </Card>

  <Modal
    title="Thêm môn"
    visible={open1}
    onCancel={() => setOpen1(false)}
    onOk={() => form1.submit()}
  >
    <Form form={form1} onFinish={themMon} layout="vertical">
      <Form.Item name="name" label="Tên môn" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
  </Modal>

  <Modal
    title={idDangSua ? 'Sửa tiến độ' : 'Thêm tiến độ'}
    visible={open2}
    onCancel={() => setOpen2(false)}
    onOk={() => form2.submit()}
  >
    <Form form={form2} onFinish={luuTienDo} layout="vertical">

      <Form.Item name="subject" label="Môn học" rules={[{ required: true }]}>
        <Select>
          {monHoc.map(m => (
            <Select.Option key={m} value={m}>{m}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="date" label="Ngày giờ" rules={[{ required: true }]}>
        <DatePicker showTime style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="duration" label="Thời lượng" rules={[{ required: true }]}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="content" label="Nội dung">
        <Input />
      </Form.Item>

    </Form>
  </Modal>

  <Modal
    title={`Mục tiêu: ${monDangChon}`}
    visible={open3}
    onCancel={() => setOpen3(false)}
    onOk={() => form3.submit()}
    destroyOnClose
  >
    <Form form={form3} onFinish={luuMucTieu} layout="vertical">
      <Form.Item name="target" label="Số phút mục tiêu" rules={[{ required: true }]}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  </Modal>

</div>

)
}

export default Game2