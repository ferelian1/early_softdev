import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocialLink, SocialLinkDocument } from './schemas/social-link.schema';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';

@Injectable()
export class SocialLinksService {
  constructor(
    @InjectModel(SocialLink.name)
    private readonly socialLinkModel: Model<SocialLinkDocument>,
  ) {}

  async findAll(): Promise<SocialLinkDocument[]> {
    return this.socialLinkModel.find().sort({ order: 1 }).exec();
  }

  async findOne(id: string): Promise<SocialLinkDocument> {
    const link = await this.socialLinkModel.findById(id).exec();
    if (!link) {
      throw new NotFoundException(`SocialLink with id "${id}" not found`);
    }
    return link;
  }

  async create(dto: CreateSocialLinkDto): Promise<SocialLinkDocument> {
    const created = new this.socialLinkModel(dto);
    return created.save();
  }

  async update(
    id: string,
    dto: UpdateSocialLinkDto,
  ): Promise<SocialLinkDocument> {
    const updated = await this.socialLinkModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`SocialLink with id "${id}" not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.socialLinkModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`SocialLink with id "${id}" not found`);
    }
  }
}
