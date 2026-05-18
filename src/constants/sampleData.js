export const currentUser = {
  _id: 'user-me',
  fullName: 'Rohit Sharma',
  email: 'rohit@example.com',
  bio: 'Building quick conversations with a clean mobile experience.',
};

export const sampleUsers = [
  {
    _id: 'user-1',
    fullName: 'Alison Martin',
    bio: 'Hi everyone, I am using QuickChat',
    online: true,
    unread: 2,
  },
  {
    _id: 'user-2',
    fullName: 'Martin Johnson',
    bio: 'Product designer and coffee person.',
    online: false,
    unread: 0,
  },
  {
    _id: 'user-3',
    fullName: 'Enrique Martinez',
    bio: 'Always available for project updates.',
    online: true,
    unread: 1,
  },
];

export const sampleGroups = [
  {
    _id: 'group-1',
    name: 'Project Team',
    bio: 'Design, backend, and mobile app discussion.',
    isGroup: true,
    unread: 4,
    members: [
      { _id: 'user-me', fullName: 'Rohit Sharma', online: true },
      { _id: 'user-1', fullName: 'Alison Martin', online: true },
      { _id: 'user-2', fullName: 'Martin Johnson', online: false },
    ],
  },
];

export const sampleMessages = [
  {
    _id: 'msg-1',
    senderId: 'user-1',
    text: 'Hey, native app ka setup ho gaya?',
    createdAt: '2026-05-18T09:15:00.000Z',
  },
  {
    _id: 'msg-2',
    senderId: 'user-me',
    text: 'Haan, screens split karke professional structure bana raha hoon.',
    createdAt: '2026-05-18T09:16:00.000Z',
  },
  {
    _id: 'msg-3',
    senderId: 'user-1',
    text: 'Perfect. Backend same rahega, UI native feel hona chahiye.',
    createdAt: '2026-05-18T09:18:00.000Z',
  },
];
