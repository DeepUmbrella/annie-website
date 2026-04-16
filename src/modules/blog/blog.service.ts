import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async getPosts(published: boolean = true) {
    return this.prisma.post.findMany({
      where: { published },
      include: {
        author: {
          include: { profile: true },
        },
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getPostBySlug(slug: string) {
    return this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          include: { profile: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  async createPost(
    title: string,
    slug: string,
    content: string,
    authorId: string,
    excerpt?: string,
  ) {
    return this.prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        authorId,
      },
    });
  }

  async updatePost(
    id: string,
    authorId: string,
    data: { title?: string; content?: string; published?: boolean },
  ) {
    // Verify ownership
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post || post.authorId !== authorId) {
      throw new Error('无权修改此文章');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        ...(data.published && { publishedAt: new Date() }),
      },
    });
  }

  async deletePost(id: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post || post.authorId !== authorId) {
      throw new Error('无权删除此文章');
    }

    return this.prisma.post.delete({ where: { id } });
  }

  async getTags() {
    return this.prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }
}
