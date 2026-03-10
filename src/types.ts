export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  first_name?: string;
  last_name?: string;
  license_front_url?: string;
  license_back_url?: string;
}

export interface Invitation {
  id: number;
  code: string;
  created_at: string;
  used_by?: number;
  used_by_name?: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface Catch {
  id: number;
  species: string;
  weight: number;
  length: number;
  date: string;
  angler: string;
  location: string;
  image_url?: string;
  user_id?: number;
}
