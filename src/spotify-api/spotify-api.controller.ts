import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { IAuthenticatedRequest } from 'src/auth/interfaces/authenticate-request';
import { SpotifyApiService } from './spotify-api.service';

@Controller('spotify')
@UseGuards(JwtAuthGuard)
export class SpotifyApiController {
  constructor(private readonly spotifyService: SpotifyApiService) {}

  @Get('top-artists')
  getTopArtists(
    @Req() req: IAuthenticatedRequest,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.spotifyService.getTopArtists(req.user, +limit, +offset);
  }

  @Get('artist/:id/albums')
  getArtistAlbums(
    @Req() req: IAuthenticatedRequest,
    @Param('id') artistId: string,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.spotifyService.getArtistAlbums(
      req.user,
      artistId,
      +limit,
      +offset,
    );
  }

  @Get('playlists')
  getUserPlaylists(
    @Req() req: IAuthenticatedRequest,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.spotifyService.getUserPlaylists(req.user, +limit, +offset);
  }

  @Post('playlists')
  createPlaylist(
    @Req() req: IAuthenticatedRequest,
    @Body() body: { name: string; description?: string; isPublic?: boolean },
  ) {
    return this.spotifyService.createPlaylist(
      req.user,
      body.name,
      body.description,
      body.isPublic,
    );
  }
}
