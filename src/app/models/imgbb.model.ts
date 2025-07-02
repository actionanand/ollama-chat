export interface ImgbbImageInfo {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
}

export interface ImgbbThumbInfo {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
}

export interface ImgbbMediumInfo {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
}

export interface ImgbbData {
  id: string;
  title: string;
  url_viewer: string;
  url: string;
  display_url: string;
  width: number;
  height: number;
  size: number;
  time: number;
  expiration: number;
  image: ImgbbImageInfo;
  thumb: ImgbbThumbInfo;
  medium: ImgbbMediumInfo;
  delete_url: string;
}

export interface ImgbbResponse {
  data: ImgbbData;
  success: boolean;
  status: number;
}
