import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { CreateCaptchaDto } from './dto/create-captcha.dto';
import { UpdateCaptchaDto } from './dto/update-captcha.dto';

@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @Post()
  create(@Body() createCaptchaDto: CreateCaptchaDto) {
    return this.captchaService.create(createCaptchaDto);
  }

  @Get()
  findAll() {
    return this.captchaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.captchaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaptchaDto: UpdateCaptchaDto) {
    return this.captchaService.update(+id, updateCaptchaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.captchaService.remove(+id);
  }
}
