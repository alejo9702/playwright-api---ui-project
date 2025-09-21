export interface User {
  id?: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo?: {
      lat: string;
      lng: string;
    };
  };
  company?: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface Post {
  id?: number;
  title: string;
  body: string;
  userId: number;
}

export interface Comment {
  id?: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export const testUsers: User[] = [
  {
    name: 'John Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: {
        lat: '-37.3159',
        lng: '81.1496'
      }
    },
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets'
    }
  },
  {
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane.smith@example.com',
    phone: '1-463-123-4447',
    website: 'anastasia.net',
    address: {
      street: 'Victor Plains',
      suite: 'Suite 879',
      city: 'Wisokyburgh',
      zipcode: '90566-7771',
      geo: {
        lat: '-43.9509',
        lng: '-34.4618'
      }
    },
    company: {
      name: 'Deckow-Crist',
      catchPhrase: 'Proactive didactic contingency',
      bs: 'synergize scalable supply-chains'
    }
  }
];

export const testPosts: Post[] = [
  {
    title: 'Test Post 1',
    body: 'This is the body of test post 1',
    userId: 1
  },
  {
    title: 'Test Post 2',
    body: 'This is the body of test post 2',
    userId: 1
  },
  {
    title: 'Test Post 3',
    body: 'This is the body of test post 3',
    userId: 2
  }
];

export const testComments: Comment[] = [
  {
    postId: 1,
    name: 'Test Commenter 1',
    email: 'commenter1@example.com',
    body: 'This is a test comment for post 1'
  },
  {
    postId: 1,
    name: 'Test Commenter 2',
    email: 'commenter2@example.com',
    body: 'This is another test comment for post 1'
  },
  {
    postId: 2,
    name: 'Test Commenter 3',
    email: 'commenter3@example.com',
    body: 'This is a test comment for post 2'
  }
]; 