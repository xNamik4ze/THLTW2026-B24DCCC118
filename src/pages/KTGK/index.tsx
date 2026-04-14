import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, Card, Button, Modal, Form, Input, 
  InputNumber, Select, Space, Typography, Table, 
  Tag, message, Popconfirm
} from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface Course {
  id: string;
  ten: string;
  lect: string;
  nums: number;
  stat: 'Đang mở' | 'Đã kết thúc' | 'Tạm dừng';
  des: string;
}

const Ktgk = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterGV, setFilterGV] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const listGV = ["Thầy Cường", "Thầy Tráng", "Cô Nga", "Cô Phụng",];

  useEffect(() => {
    const saved = localStorage.getItem('online_courses');
    if (saved) setCourses(JSON.parse(saved));
  }, []);

  const saveToStorage = (data: Course[]) => {
    localStorage.setItem('online_courses', JSON.stringify(data));
  };

  const handleSave = (values: any) => {
    const isDuplicate = courses.some(c => 
      c.ten.toLowerCase() === values.ten.toLowerCase() && c.id !== editingCourse?.id
    );

    if (isDuplicate) {
      return message.error("Tên khóa học đã tồn tại! Vui lòng kiểm tra lại.");
    }

    const newItem = { ...values, id: editingCourse?.id || Date.now().toString() };
    const updated = editingCourse 
      ? courses.map(c => c.id === editingCourse.id ? newItem : c) 
      : [newItem, ...courses];
    
    setCourses(updated);
    saveToStorage(updated);
    setIsModalOpen(false);
    message.success(editingCourse ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
  };

  const handleDelete = (id: string) => {
    const course = courses.find(c => c.id === id);
    if (course && course.nums > 0) {
      return message.warning("Không thể xóa khóa học đã có học viên!");
    }
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    saveToStorage(updated);
    message.success("Xóa khóa học thành công");
  };

  const filteredData = useMemo(() => {
    return courses
      .filter(c => c.ten.toLowerCase().includes(searchText.toLowerCase()))
      .filter(c => filterGV === 'all' || c.lect === filterGV)
      .filter(c => filterStatus === 'all' || c.stat === filterStatus)
      .sort((a, b) => b.nums - a.nums);
  }, [courses, searchText, filterGV, filterStatus]);

  return (
    <Layout style={{ minHeight: '100vh', padding: '24px' }}>
      <Header style={{ background: '#001529', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>QUẢN LÝ KHÓA HỌC ONLINE</Title>
      </Header>
      
      <Content>
        <Card>
          <Space style={{ marginBottom: 16 }} wrap>
            <Input 
              placeholder="Tìm tên khóa học..." 
              prefix={<SearchOutlined />} 
              onChange={e => setSearchText(e.target.value)} 
            />
            <Select defaultValue="all" style={{ width: 150 }} onChange={setFilterGV}>
              <Select.Option value="all">Tất cả giảng viên</Select.Option>
              {listGV.map(gv => <Select.Option key={gv} value={gv}>{gv}</Select.Option>)}
            </Select>
            <Select defaultValue="all" style={{ width: 150 }} onChange={setFilterStatus}>
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="Đang mở">Đang mở</Select.Option>
              <Select.Option value="Đã kết thúc">Đã kết thúc</Select.Option>
              <Select.Option value="Tạm dừng">Tạm dừng</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCourse(null); setIsModalOpen(true); form.resetFields(); }}>
              Thêm khóa học
            </Button>
          </Space>

          <Table 
            dataSource={filteredData} 
            rowKey="id"
            columns={[
              { title: 'ID', dataIndex: 'id', width: 120 },
              { title: 'Tên khóa học', dataIndex: 'ten', render: (t) => <Text strong>{t}</Text> },
              { title: 'Giảng viên', dataIndex: 'lect' },
              { title: 'Học viên', dataIndex: 'nums', sorter: (a, b) => a.nums - b.nums },
              { 
                title: 'Trạng thái', 
                dataIndex: 'stat',
                render: (st) => (
                  <Tag color={st === 'Đang mở' ? 'green' : st === 'Tạm dừng' ? 'orange' : 'red'}>{st}</Tag>
                )
              },
              { 
                title: 'Thao tác', 
                render: (r) => (
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => { setEditingCourse(r); setIsModalOpen(true); form.setFieldsValue(r); }} />
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ) 
              }
            ]}
          />
        </Card>
      </Content>

      <Modal 
        title={editingCourse ? "Sửa khóa học" : "Thêm khóa học mới"} 
        visible={isModalOpen} 
        onOk={() => form.submit()} 
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="ten" label="Tên khóa học" rules={[{ required: true, max: 100 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lect" label="Giảng viên" rules={[{ required: true }]}>
            <Select options={listGV.map(gv => ({ label: gv, value: gv }))} />
          </Form.Item>
          <Form.Item name="nums" label="Số lượng học viên" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stat" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={[
              { label: 'Đang mở', value: 'Đang mở' },
              { label: 'Đã kết thúc', value: 'Đã kết thúc' },
              { label: 'Tạm dừng', value: 'Tạm dừng' }
            ]} />
          </Form.Item>
          <Form.Item name="des" label="Mô tả (HTML)">
            <Input.TextArea rows={4} placeholder="Nhập mã HTML mô tả..." />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Ktgk;