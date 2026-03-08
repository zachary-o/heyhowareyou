export type OpenerType = {
  id: string;
  user_id: string;
  text: string;
  score: number;
  feedback: string;
  is_public: boolean;
  created_at: string;
};

export type Result = {
  score: number;
  verdict: string;
  feedback: string;
};