export interface ISpotifyProfile {
  provider: 'spotify';
  id: string;
  username: string;
  displayName: string;
  profileUrl: string;
  photos: string[];
  emails: Array<{
    value: string;
  }>;
  _raw: string;
  _json: {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
      filter_enabled: boolean;
      filter_locked: boolean;
    };
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string | null;
      total: number;
    };
    href: string;
    id: string;
    images: Array<{
      height: number;
      url: string;
      width: number;
    }>;
    product: string;
    type: string;
    uri: string;
  };
}
