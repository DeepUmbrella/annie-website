import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocsService {
  private docsPath = path.join(process.cwd(), 'docs');

  async getDocContent(docPath: string) {
    const fullPath = path.join(this.docsPath, `${docPath}.md`);
    
    try {
      const content = await fs.promises.readFile(fullPath, 'utf-8');
      return { content };
    } catch (error) {
      throw new Error('文档不存在');
    }
  }

  async getDocTree() {
    const scanDir = async (dir: string, basePath = ''): Promise<any[]> => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      const result = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;

        if (entry.isDirectory()) {
          const children = await scanDir(fullPath, relative);
          result.push({
            name: entry.name,
            type: 'directory',
            path: relativePath,
            children,
          });
        } else if (entry.name.endsWith('.md')) {
          result.push({
            name: entry.name.replace('.md', ''),
            type: 'file',
            path: relativePath.replace('.md', ''),
          });
        }
      }

      return result;
    };

    return scanDir(this.docsPath);
  }

  async searchDocs(query: string) {
    const results = [];
    
    const searchInDir = async (dir: string, basePath = ''): Promise<void> => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;

        if (entry.isDirectory()) {
          await searchInDir(fullPath, relativePath);
        } else if (entry.name.endsWith('.md')) {
          const content = await fs.promises.readFile(fullPath, 'utf-8');
          
          if (content.toLowerCase().includes(query.toLowerCase())) {
            const lines = content.split('\n');
            let title = entry.name;
            let excerpt = '';

            for (const line of lines) {
              if (line.startsWith('# ')) {
                title = line.substring(2).trim();
                break;
              }
            }

            const index = content.toLowerCase().indexOf(query.toLowerCase());
            if (index !== -1) {
              const start = Math.max(0, index - 50);
              const end = Math.min(content.length, index + 150);
              excerpt = '...' + content.substring(start, end) + '...';
            }

            results.push({
              title,
              path: relativePath.replace('.md', ''),
              excerpt,
            });
          }
        }
      }
    };

    await searchInDir(this.docsPath);
    return results;
  }
}
