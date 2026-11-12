export type Gender = 'female' | 'male';

export type Senior = {
  id: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  phoneNumber: string;
};

export type SeniorForm = Omit<Senior, 'id'>;
