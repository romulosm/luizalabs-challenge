import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  spotifyId: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: [String] })
  photos: string[];
}
