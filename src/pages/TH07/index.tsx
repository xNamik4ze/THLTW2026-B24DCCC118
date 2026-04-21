import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, Card, Button, Modal, Form, Input, Select, Space, 
  Typography, Table, Tag, message, Popconfirm, List, 
  Row, Col, Avatar, Divider, Descriptions 
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, 
  SearchOutlined, ArrowLeftOutlined, EyeOutlined,
  GithubOutlined, FacebookOutlined, UserOutlined, ClockCircleOutlined
} from '@ant-design/icons';

const { Header, Content} = Layout;
const { Title, Text, Paragraph } = Typography;

function useDebounceValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  avatar: string;
  author: string;
  tags: string[];
  status: 'Draft' | 'Published';
  views: number;
  createdAt: string;
}

const TH07 = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounceValue(searchText, 300);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ oldName: string } | null>(null);
  const [tagForm] = Form.useForm();

  useEffect(() => {
    const saved = localStorage.getItem('hieu_blog_final');
    if (saved) setPosts(JSON.parse(saved));
  }, []);

  const saveToStorage = (data: BlogPost[]) => {
    localStorage.setItem('hieu_blog_final', JSON.stringify(data));
  };

  const handleSaveTag = (values: { name: string }) => {
  const newName = values.name.trim();
  if (editingTag) {
    const updated = posts.map(p => ({
      ...p,
      tags: p.tags?.map(t => (t === editingTag.oldName ? newName : t))
      }));
      setPosts(updated);
      saveToStorage(updated);
      message.success(`Đã đổi tên thẻ thành ${newName}`);
  } else {
    message.info("Thẻ mới đã sẵn sàng! Bạn có thể chọn thẻ này khi thêm/sửa bài viết.");
  }
    setIsTagModalOpen(false);
    setEditingTag(null);
  };

  const handleDeleteTag = (tagName: string) => {
  const updated = posts.map(p => ({
    ...p,
    tags: p.tags?.filter(t => t !== tagName)
    }));
    setPosts(updated);
    saveToStorage(updated);
    message.success(`Đã xóa thẻ ${tagName}`);
  };

  const handleSave = (values: any) => {
    const newItem: BlogPost = {
      ...values,
      id: editingPost?.id || Date.now().toString(),
      views: editingPost?.views || 0,
      createdAt: editingPost?.createdAt || new Date().toLocaleDateString('vi-VN'),
      author: 'Nguyễn Hoàng Dương'
    };
    const updated = editingPost 
      ? posts.map(p => p.id === editingPost.id ? newItem : p)
      : [newItem, ...posts];
    setPosts(updated);
    saveToStorage(updated);
    setIsModalOpen(false);
    message.success('Đã lưu dữ liệu!');
  };

  const handleViewDetail = (post: BlogPost) => {
    const updated = posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p);
    setPosts(updated);
    saveToStorage(updated);
    setSelectedPost({ ...post, views: post.views + 1 });
    setCurrentPage('detail');
    window.scrollTo(0, 0);
  };

  const filteredHomePosts = useMemo(() => {
    return posts
      .filter(p => p.status === 'Published')
      .filter(p => p.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .filter(p => !selectedTag || p.tags.includes(selectedTag));
  }, [posts, debouncedSearch, selectedTag]);

  const relatedPosts = useMemo(() => {
    if (!selectedPost) return [];
    return posts
      .filter(p => p.id !== selectedPost.id && p.status === 'Published')
      .filter(p => p.tags.some(t => selectedPost.tags.includes(t)))
      .slice(0, 3);
  }, [posts, selectedPost]);

  const allTags = useMemo(() => {
    const tagMap: Record<string, number> = {};
    posts.forEach(p => p.tags?.forEach(t => tagMap[t] = (tagMap[t] || 0) + 1));
    return Object.entries(tagMap).map(([name, count]) => ({ name, count }));
  }, [posts]);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header style={{ background: '#001529', display: 'flex', justifyContent: 'space-between', padding: '0 50px' }}>
        <Title level={3} style={{ color: 'white', margin: '12px 0', cursor: 'pointer' }} onClick={() => setCurrentPage('home')}>MY BLOG</Title>
        <Space>
          <Button ghost onClick={() => setCurrentPage('home')}>Trang chủ</Button>
          <Button ghost onClick={() => setCurrentPage('about')}>Giới thiệu</Button>
          <Button ghost onClick={() => setCurrentPage('admin')}>Quản lý bài viết</Button>
          <Button ghost onClick={() => setCurrentPage('tags')}>Quản lý thẻ</Button>
        </Space>
      </Header>

      <Content style={{ maxWidth: 1200, margin: '24px auto', width: '100%', padding: '0 20px' }}>
        
        {currentPage === 'home' && (
          <Row gutter={24}>
            <Col span={18}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Input 
                  placeholder="Tìm kiếm bài viết..." 
                  prefix={<SearchOutlined />} 
                  style={{ width: 350 }} 
                  onChange={e => setSearchText(e.target.value)} 
                />
                {selectedTag && <Tag closable onClose={() => setSelectedTag(null)}>Đang lọc: {selectedTag}</Tag>}
              </div>
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={filteredHomePosts}
                pagination={{ pageSize: 9}}
                renderItem={post => (
                  <List.Item>
                    <Card
                      hoverable
                      cover={<img src={post.avatar || 'https://via.placeholder.com/300x150'} style={{ height: 150, objectFit: 'cover' }} />}
                      onClick={() => handleViewDetail(post)}
                      actions={[
                        <span style={{ fontSize: '12px', marginLeft: '4px' }}><UserOutlined /> {post.author}</span>,
                        <span style={{ fontSize: '12px' }}><ClockCircleOutlined /> {post.createdAt}</span>
                      ]}
                    >
                      <Title level={5} ellipsis={{ rows: 2 }}>{post.title}</Title>
                      <Paragraph ellipsis={{ rows: 2 }} type="secondary">{post.summary}</Paragraph>
                      <Space wrap>{post.tags?.map(t => <Tag key={t} color="blue" onClick={(e) => { e.stopPropagation(); setSelectedTag(t); }}>{t}</Tag>)}</Space>
                    </Card>
                  </List.Item>
                )}
              />
            </Col>
            <Col span={6}>
              <Card title="Danh mục thẻ" size="small">
                <Space wrap>
                  <Tag.CheckableTag checked={!selectedTag} onChange={() => setSelectedTag(null)}>Tất cả</Tag.CheckableTag>
                  {allTags.map(tag => (
                    <Tag.CheckableTag key={tag.name} checked={selectedTag === tag.name} onChange={() => setSelectedTag(tag.name)}>
                      {tag.name} ({tag.count})
                    </Tag.CheckableTag>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {currentPage === 'detail' && selectedPost && (
          <Row gutter={24}>
            <Col span={17}>
              <Card>
                <Button icon={<ArrowLeftOutlined />} onClick={() => setCurrentPage('home')} type="link" style={{ padding: 0 }}>Quay lại</Button>
                <Divider style={{ margin: '12px 0' }} />
                
                <Space style={{ marginBottom: 16 }}>
                  <Tag color="blue"><EyeOutlined /> {selectedPost.views} lượt xem</Tag>
                  <Text type="secondary"><ClockCircleOutlined /> {selectedPost.createdAt}</Text>
                  <Tag color="orange">{selectedPost.author}</Tag>
                </Space>

                <Title level={2}>{selectedPost.title}</Title>
                <img src={selectedPost.avatar} style={{ width: '100%', borderRadius: 8, marginBottom: 24 }} />
                
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 16, lineHeight: 1.8 }}>
                  {selectedPost.content}
                </div>
              </Card>
            </Col>

            <Col span={7}>
            <div style={{height: 'auto'}}> 
                <Title level={4}>Bài viết liên quan</Title>
                {relatedPosts.map(p => (
                <Card 
                    key={p.id} 
                    hoverable 
                    size="small" 
                    style={{marginBottom: 12, height: 'auto'}}
                    cover={<img src={p.avatar} style={{height: 100, objectFit: 'cover'}}/>}
                    onClick={() => handleViewDetail(p)}>
                    <Title level={5} ellipsis={{rows: 2}} style={{margin: 0}}>{p.title}</Title>
                    <Text type="secondary" style={{fontSize: 12}}>{p.createdAt}</Text>
                </Card>
                ))}
                {relatedPosts.length === 0 && <Text type="secondary">Không có bài viết liên quan</Text>}
            </div>
            </Col>
          </Row>
        )}

        {currentPage === 'admin' && (
          <Card>
            <Button 
              type="primary" 
              icon={<PlusOutlined/>} 
              onClick={() => {setEditingPost(null); form.resetFields(); setIsModalOpen(true);}} 
              style={{ marginBottom: 16 }}
            >
              Viết bài mới
            </Button>
            
            <Table 
              dataSource={posts} 
              rowKey="id"
              columns={[
                {title: 'Tiêu đề',dataIndex: 'title',ellipsis: true },
                {title: 'Trạng thái',dataIndex: 'status',render: s =><Tag color={s === 'Published' ? 'green' : 'gray'}>{s === 'Published' ? 'Đã đăng' : 'Nháp'}</Tag>},
                {title: 'Lượt xem',dataIndex: 'views' },
                {title: 'Thao tác',render: (_, r) => (
                  <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => { setEditingPost(r); form.setFieldsValue(r); setIsModalOpen(true); }} />
                    <Popconfirm title="Xóa bài?" onConfirm={() => {
                      const updated = posts.filter(p => p.id !== r.id);
                      setPosts(updated); saveToStorage(updated);
                    }}>
                      <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                  </Space>
                )}
              ]}
            />
          </Card>
        )}

        {currentPage === 'tags' && (
          <Card>
            <Button 
              type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}    
              onClick={() => { setEditingTag(null); tagForm.resetFields(); setIsTagModalOpen(true); }}
            >
              Thêm thẻ mới
            </Button>

            <Table 
              dataSource={allTags} rowKey="name"
              columns={[
                { title: 'Tên thẻ', dataIndex: 'name', render: t => <Tag color="blue">{t}</Tag> },
                { title: 'Số bài đang dùng', dataIndex: 'count', sorter: (a, b) => a.count - b.count },
                { 
                  title: 'Thao tác', 
                  render: (_, r) => (
                    <Space>
                      <Button 
                        icon={<EditOutlined />} size="small" 
                        onClick={() => { setEditingTag({ oldName: r.name }); tagForm.setFieldsValue({ name: r.name }); setIsTagModalOpen(true); }} 
                      />
                      <Popconfirm title="Xóa thẻ này khỏi tất cả bài viết?" onConfirm={() => handleDeleteTag(r.name)}>
                        <Button danger icon={<DeleteOutlined />} size="small" />
                      </Popconfirm>
                    </Space>
                  ) 
                }
              ]}
            />
          </Card>
        )}

        {currentPage === 'about' && (
          <Card style={{ textAlign: 'center', padding: 50 }}>
            <Avatar size={100} icon={<UserOutlined />} />
            <Title level={2}>Arthur</Title>
            <Paragraph>Lập trình viên</Paragraph>
            <Divider />
            <Descriptions column={1} bordered style={{ maxWidth: 600, margin: '0 auto' }}>
              <Descriptions.Item label="Kỹ năng">Python, C/C++, Java, JavaScript</Descriptions.Item>
              <Descriptions.Item label="Liên kết">
              <Space size="large">
                <Typography.Link href="https://github.com/xNamik4ze" target="_blank">
                <GithubOutlined /> GitHub
                </Typography.Link>
                <Typography.Link href="https://www.facebook.com/Capt.Zadask/" target="_blank" style={{ color: '#1877F2' }}>
                <FacebookOutlined /> Facebook
                </Typography.Link>
              </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Content>

      <Modal title="Sửa thẻ" visible={isTagModalOpen} onOk={() => tagForm.submit()} onCancel={() => setIsTagModalOpen(false)}>
        <Form form={tagForm} layout="vertical" onFinish={handleSaveTag}>
          <Form.Item name="name" label="Tên thẻ" rules={[{required: true}]}><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingPost ? "Sửa bài" : "Thêm bài"} visible={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)} width={800}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Row gutter={16}>
            <Col span={16}><Form.Item name="title" label="Tiêu đề" rules={[{required: true}]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="slug" label="Slug" rules={[{required: true}]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="summary" label="Tóm tắt" rules={[{required: true}]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{required: true}]}><Input.TextArea rows={8} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="avatar" label="URL Ảnh" rules={[{required: true}]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="tags" label="Tags" rules={[{ required: true}, { type: 'array' }]}>
              <Select 
                mode="multiple"
                options={allTags.map(t => ({ label: t.name, value: t.name }))}/></Form.Item></Col>
            <Col span={6}><Form.Item name="status" label="Trạng thái" rules={[{required: true}]}><Select options={[{label:'Đã đăng', value:'Published'},{label:'Nháp', value:'Draft'}]} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
};

export default TH07;