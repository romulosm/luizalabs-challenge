export interface ISpotifyPlaylistOwner {
  display_name: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  type: string;
  uri: string;
}

export interface ISpotifyPlaylistImage {
  height: number | null;
  url: string;
  width: number | null;
}

export interface ISpotifyPlaylistTracks {
  href: string;
  total: number;
}

export interface ISpotifyPlaylist {
  collaborative: boolean;
  description: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ISpotifyPlaylistImage[];
  name: string;
  owner: ISpotifyPlaylistOwner;
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: ISpotifyPlaylistTracks;
  type: string;
  uri: string;
}
