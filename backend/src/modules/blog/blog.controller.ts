import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreatePostDto, UpdatePostDto } from './dto/blog.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get('posts')
  async getPosts() {
    return this.blogService.getPosts();
  }

  @Get('posts/:slug')
  async getPostBySlug(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async createPost(
    @CurrentUser() userId: string,
    @Body() dto: CreatePostDto,
) {
    return this.blogService.createPost(
      dto.title,
      dto.slug,
      dto.content,
      userId,
      dto.excerpt,
    );
  }

  @Put('posts/:id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.blogService.updatePost(id, userId, dto);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ) {
    return this.blogService.deletePost(id, userId);
  }

  @Get('tags')
  async getTags() {
    return this.blogService.getTags();
  }
}
