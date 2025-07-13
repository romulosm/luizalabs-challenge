import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class User extends Document {
  declare _id: Types.ObjectId;

  @Prop({ default: uuidv4, unique: true })
  uuid: string;

  @Prop({ required: true, unique: true })
  spotifyId: string;

  @Prop()
  displayName: string;

  @Prop()
  email: string;

  @Prop([String])
  photos: string[];

  @Prop()
  accessToken: string;

  @Prop()
  refreshToken: string;

  @Prop({ type: Object })
  profileJson: object;
}

export const UserSchema = SchemaFactory.createForClass(User);
