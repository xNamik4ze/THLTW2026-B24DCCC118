import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, Card, Button, Modal, Form, Input, Select, Space, 
  Typography, Table, Tag, message, Row, Col, DatePicker, Statistic
} from 'antd';
import { 
  PlusOutlined, DashboardOutlined, ProjectOutlined, EditOutlined,
  UnorderedListOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined 
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';

dayjs.extend(weekday);
dayjs.extend(localeData);

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const statusConfig = {
  todo: { label: 'Cần làm', color: 'blue' },
  doing: { label: 'Đang xử lý', color: 'orange' },
  done: { label: 'Hoàn thành', color: 'green' }
};

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  tags: string[];
}

const TH09 = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const saved = localStorage.getItem('kanban_tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const saveToStorage = (data: Task[]) => {
    localStorage.setItem('kanban_tasks', JSON.stringify(data));
  };

  const handleSave = (values: any) => {
    const newTask: Task = {
      ...values,
      id: editingTask?.id || Date.now().toString(),
      deadline: values.deadline.format('YYYY-MM-DD'),
    };
    const updated = editingTask 
      ? tasks.map(t => t.id === editingTask.id ? newTask : t)
      : [newTask, ...tasks];
    setTasks(updated);
    saveToStorage(updated);
    setIsModalOpen(false);
    message.success('Đã cập nhật công việc!');
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const updated = tasks.map(t => 
      t.id === draggableId ? { ...t, status: destination.droppableId as Task['status'] } : t
    );
    setTasks(updated);
    saveToStorage(updated);
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => t.status !== 'done' && dayjs().isAfter(dayjs(t.deadline))).length;
    return { total, completed, overdue };
  }, [tasks]);

  const columns = [
    { title: 'Tên Task', dataIndex: 'title', key: 'title' },
    { title: 'Trạng thái', dataIndex: 'status', render: (s: string) => {
        let color = 'blue';
        let text = 'Cần làm';
        if (s == 'doing') {color = 'orange'; text = 'Đang xử lý';}
        if (s == 'done') {color = 'green'; text = 'Hoàn thành';}
        return <Tag color={color}>{text}</Tag>;
        }
    },
    { title: 'Ưu tiên', dataIndex: 'priority', render: (p: string) => {
        let color = 'blue';
        let text = 'Thấp';
        if (p == 'High') {color = 'red'; text = 'Cao';}
        if (p == 'Medium') {color = 'orange'; text = 'Trung bình';}
        return <Tag color={color}>{text}</Tag>;
        }
    },   
    { title: 'Deadline', dataIndex: 'deadline', sorter: (a: Task, b: Task) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix() },
    { title: 'Thao tác', render: (_: any, r: Task) => <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingTask(r); form.setFieldsValue({ ...r, deadline: dayjs(r.deadline) }); setIsModalOpen(true); }}></Button > }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>TASK MANAGER</Title>
        <Space>
          <Button ghost icon={<DashboardOutlined />} onClick={() => setCurrentPage('dashboard')}>Dashboard</Button>
          <Button ghost icon={<ProjectOutlined />} onClick={() => setCurrentPage('kanban')}>Kanban</Button>
          <Button ghost icon={<UnorderedListOutlined />} onClick={() => setCurrentPage('list')}>Danh sách</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTask(null); form.resetFields(); setIsModalOpen(true); }}>Thêm Task</Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        
        {currentPage === 'dashboard' && (
          <Row gutter={16}>
            <Col span={8}><Card><Statistic title="Tổng số Task" value={stats.total} prefix={<ProjectOutlined />} /></Card></Col>
            <Col span={8}><Card><Statistic title="Hoàn thành" value={stats.completed} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
            <Col span={8}><Card><Statistic title="Quá hạn" value={stats.overdue} valueStyle={{ color: '#cf1322' }} prefix={<ExclamationCircleOutlined />} /></Card></Col>
          </Row>
        )}

        {currentPage === 'kanban' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Row gutter={16}>
              {(['todo', 'doing', 'done'] as const).map(colId => (
                <Col span={8} key={colId}>
                  <Card title={statusConfig[colId].label} style={{ background: '#f0f2f5' }}>
                    <Droppable droppableId={colId}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: 400 }}>
                          {tasks.filter(t => t.status === colId).map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  size="small"
                                  style={{ marginBottom: 8, ...provided.draggableProps.style }}
                                >
                                  <Text strong>{task.title}</Text>
                                  <br />
                                  <Tag color={task.priority === 'High' ? 'red' : 'blue'}>{task.priority}</Tag>
                                  <Text type="secondary" style={{ fontSize: '12px' }}><ClockCircleOutlined /> {task.deadline}</Text>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Card>
                </Col>
              ))}
            </Row>
          </DragDropContext>
        )}

        {currentPage === 'list' && (
          <Card title="Tất cả công việc">
            <Table dataSource={tasks} columns={columns} rowKey="id" />
          </Card>
        )}
      </Content>

      <Modal title={editingTask ? "Chỉnh sửa" : "Thêm mới"} visible={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="title" label="Tên công việc" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="Ưu tiên" rules={[{ required: true }]}>
                <Select options={[{ value: 'High', label: 'Cao' }, { value: 'Medium', label: 'Trung bình' }, { value: 'Low', label: 'Thấp' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                <Select options={[{ value: 'todo', label: 'Cần làm' }, { value: 'doing', label: 'Đang làm' }, { value: 'done', label: 'Hoàn thành' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="tags" label="Tags"><Select mode="tags" /></Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default TH09;