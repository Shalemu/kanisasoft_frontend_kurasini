export interface Preaching {
  id: number;
  date: string;
  preacher_name: string;
  title: string;
  description?: string;
  pdf_file?: string;
  pdf_url?: string;
  video_link?: string;
  is_active: boolean;
}