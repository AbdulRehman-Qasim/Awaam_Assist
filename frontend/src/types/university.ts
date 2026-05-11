export interface University {
  id: string;
  title: string;
  city: string;
  province: string;
  discipline: string;
  degree: string;
  ranking: number;
  merit: number;
  fee: number;
  semesterFee?: number;
  feeType?: string;
  url: string;
  web?: string;
  contact?: string;
  info?: string;
  logo?: string;
  status?: number;
  admissions?: string;
  deadline?: string;
  admission?: string;
  map?: {
    address?: string;
    lat?: number;
    location?: string;
    long?: number;
  };
}
