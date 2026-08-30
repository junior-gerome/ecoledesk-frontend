export interface SubjectReponse {
  id?: number;
  nameSubject: string;
  code: string;
  coefficient: number;
  description?: string;
  active: boolean;

}

export interface SubjectRequest{
  nameSubject: string;
  code: string;
  coefficient: number;
  description?: string;
  active: boolean;
}
