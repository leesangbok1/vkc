// Category and Topic Types for VietKConnect

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  description?: string;
  topicCount: number;
  questionCount: number;
  color?: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  questionCount: number;
  followersCount: number;
  description?: string;
}

export interface SubTopic {
  id: string;
  name: string;
  slug: string;
  topicId: string;
  questionCount: number;
}

export interface UserInterest {
  userId: string;
  topicIds: string[];
  categoryIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Hot Topic Interface
export interface HotTopic {
  id: string;
  name: string;
  category: string;
  trend: 'rising' | 'hot' | 'new';
  questionCount: number;
}
