import { Typography, Card, List, Tag, Empty, Spin } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';

const { Title, Paragraph } = Typography;

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await axios.get(`${API}/api/v1/blog/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div style={{ padding: '48px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '48px', color: '#190019' }}>
          博客
        </Title>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Empty description="暂无文章" />
          </div>
        ) : (
          <List
            grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }}
            dataSource={posts}
            renderItem={item => (
              <List.Item>
                <Card
                  title={item.title}
                  size="default"
                  hoverable
                  style={{ width: '100%', height: '100%', background: '#Fbe4d8' }}
                >
                  <Paragraph ellipsis={{ rows: 3 }} type="secondary">
                    {item.excerpt || item.content}
                  </Paragraph>
                  <div style={{ marginTop: '16px' }}>
                    {item.tags?.map((tag: any) => (
                      <Tag key={tag.id} color="#522b5b" style={{ marginBottom: '4px' }}>
                        {tag.tag.name}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default Blog;
