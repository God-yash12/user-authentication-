import { Injectable } from '@nestjs/common';
import { CreateCaptchaDto } from './dto/create-captcha.dto';
import { UpdateCaptchaDto } from './dto/update-captcha.dto';

@Injectable()
export class CaptchaService {
  create(createCaptchaDto: CreateCaptchaDto) {
    return 'This action adds a new captcha';
  }

  findAll() {
    return `This action returns all captcha`;
  }

  findOne(id: number) {
    return `This action returns a #${id} captcha`;
  }

  update(id: number, updateCaptchaDto: UpdateCaptchaDto) {
    return `This action updates a #${id} captcha`;
  }

  remove(id: number) {
    return `This action removes a #${id} captcha`;
  }
}
