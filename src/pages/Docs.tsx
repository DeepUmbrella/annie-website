import { Typography, Card, Input, List } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';

const { Title, Paragraph } = Typography;

const Docs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const searchDocs = async () => {
      if (searchQuery) {
        try {
          const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const response = await axios.get(`${API}/api/v1/docs/search?q=${searchQuery}`);
          setSearchResults(response.data);
        });
      }
    };

    const timeoutId = setTimeout(searchDocs, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const docSections = [
    {
      title: '快速开始',
      path: 'getting-started',
      description: '快速上手 Annie API',
    },
    {
      title: '认证 API',
      path: 'api/authentication',
      description: '用户注册、登录和个人资料管理',
    },
    {
      title: '对话 API',
      path: 'api/chat',
      description: '与 Annie AI 助手进行对话',
    },
  ];

  return (
    <div style={{ padding: '48px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '48px', color: '#190019' }}>
          开发者文档
        </Title>

        <Input.Search
          placeholder="搜索文档..."
          allowClear
          enterButton
          size="large"
          style={{ marginBottom: '32px' }}
          onChange={e => setSearchQuery(e.target.value)}
        />

        {searchQuery && searchResults.length > 0 ? (
          <div>
            <Title level={2}>搜索结果</Title>
            <List
              dataSource={searchResults}
              renderItem={item => (
                <List.Item>
                  <Card
                    title={item.title}
                    size="small"
                    style={{ width: '100%' }}
                  >
                    <Paragraph ellipsis={{ rows: 2 }}>{item.excerpt}</Paragraph>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <>
            <Title level={2} style={{ marginBottom: '24px' }}>
              文档目录
            </Title>
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
              dataSource={docSections}
              renderItem={item => (
                <List.Item>
                  <Card
                    title={item.title}
                    size="small"
                    style={{ width: '100%' }}
                    hoverable
                  >
                    <Paragraph type="secondary">{item.description}</Paragraph>
                  </Card>
                </List.Item>
              )}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Docs;
