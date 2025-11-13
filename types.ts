
export interface Petitioner {
  id: number;
  created_at?: string;
  name: string;
  position: string;
  address: string;
  signature: string; // Base64 data URL of the signature image
}