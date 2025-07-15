import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findBySpotifyId(spotifyId: string): Promise<User | null> {
    return await this.userModel.findOne({ spotifyId }).exec();
  }

  async findById(uuid: string): Promise<User | null> {
    return await this.userModel.findOne({ uuid }).exec();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return await user.save();
  }

  async update(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    return await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
  }

  async delete(userId: string): Promise<User | null> {
    return await this.userModel.findByIdAndDelete(userId).exec();
  }
}
