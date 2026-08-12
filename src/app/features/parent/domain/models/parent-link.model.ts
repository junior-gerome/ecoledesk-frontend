export interface ParentLinkedStudent {
  studentId: number;
  studentName: string;
  dateOfBirth: string;
  gender: string;
}

export interface ParentMessageResponse {
  id: number;
  guardianId: number;
  message: string;
  createdAt: string;
}
