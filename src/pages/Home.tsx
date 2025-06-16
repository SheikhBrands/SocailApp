import React from 'react';
import CreatePost from '../components/Feed/CreatePost';
import StoriesCarousel from '../components/Stories/StoriesCarousel';
import PostCard from '../components/Feed/PostCard';
import { Post, User } from '../types';

const Home: React.FC = () => {
  // Mock data for demonstration
  const mockUser: User = {
    id: '1',
    email: 'demo@example.com',
    username: 'demo_user',
    displayName: 'Demo User',
    bio: 'This is a demo user',
    profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    followers: [],
    following: [],
    isVerified: true,
    isPrivate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPosts: Post[] = [
    {
      id: '1',
      userId: '1',
      content: 'Just captured this amazing sunset! The colors were absolutely breathtaking. Nature never fails to amaze me 🌅✨ #sunset #photography #nature',
      mediaUrls: ['https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'],
      mediaTypes: ['image'],
      likes: ['user1', 'user2', 'user3'],
      comments: [
        {
          id: '1',
          userId: '2',
          content: 'Absolutely stunning! 😍',
          likes: [],
          replies: [],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: '2',
          userId: '3',
          content: 'Where was this taken?',
          likes: [],
          replies: [],
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        }
      ],
      shares: 5,
      views: 1247,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      hashtags: ['sunset', 'photography', 'nature'],
      mentions: [],
    },
    {
      id: '2',
      userId: '2',
      content: 'Working on some exciting new projects! Can\'t wait to share what we\'ve been building 🚀 #tech #startup #innovation',
      mediaUrls: [
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      mediaTypes: ['image', 'image', 'image'],
      likes: ['user1', 'user4', 'user5', 'user6'],
      comments: [
        {
          id: '3',
          userId: '1',
          content: 'Looks interesting! Looking forward to the reveal 👀',
          likes: [],
          replies: [],
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
        }
      ],
      shares: 12,
      views: 2156,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      hashtags: ['tech', 'startup', 'innovation'],
      mentions: [],
    },
    {
      id: '3',
      userId: '3',
      content: 'Morning workout complete! 💪 Starting the day with some energy. What\'s your favorite way to stay active?',
      mediaUrls: ['https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800'],
      mediaTypes: ['image'],
      likes: ['user2', 'user7', 'user8'],
      comments: [],
      shares: 3,
      views: 892,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      hashtags: ['fitness', 'morning', 'workout'],
      mentions: [],
    }
  ];

  const mockUsers: { [key: string]: User } = {
    '1': {
      ...mockUser,
      username: 'alex_photographer',
      displayName: 'Alex Smith',
      profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    '2': {
      ...mockUser,
      id: '2',
      username: 'sarah_tech',
      displayName: 'Sarah Johnson',
      profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      isVerified: false,
    },
    '3': {
      ...mockUser,
      id: '3',
      username: 'mike_fitness',
      displayName: 'Mike Wilson',
      profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      isVerified: true,
    }
  };

  return (
    <div className="space-y-6">
      {/* Stories */}
      <StoriesCarousel />
      
      {/* Create Post */}
      <CreatePost />
      
      {/* Feed */}
      <div className="space-y-6">
        {mockPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={mockUsers[post.userId]}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;