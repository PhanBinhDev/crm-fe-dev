export interface IFeedback {
  id: string;
  fullName: string;
  email: string;
  numPhone: string;
  studentId: string;
  rating: number;
  comments: string | null;
  image: string[] | null;
  submittedAt: Date;
}
