import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface Story {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  profileImage: string;
  mediaUrl: string;
  hasViewed: boolean;
}

const StoriesCarousel: React.FC = () => {
  const { user } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock data for stories
  const stories: Story[] = [
    {
      id: '1',
      userId: '1',
      username: 'alex_photographer',
      displayName: 'Alex Smith',
      profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
      hasViewed: false,
    },
    {
      id: '2',
      userId: '2',
      username: 'sarah_travels',
      displayName: 'Sarah Johnson',
      profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaUrl: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=400',
      hasViewed: true,
    },
    {
      id: '3',
      userId: '3',
      username: 'mike_fitness',
      displayName: 'Mike Wilson',
      profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      hasViewed: false,
    },
    {
      id: '4',
      userId: '4',
      username: 'emma_chef',
      displayName: 'Emma Davis',
      profileImage: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
      mediaUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      hasViewed: true,
    },
  ];

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(stories.length - 1, currentIndex + 1));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stories</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= stories.length - 4}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex space-x-4 overflow-hidden">
        {/* Add Story Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 cursor-pointer"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <img
                  src={user?.profileImage || `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400`}
                  alt="Your story"
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400 max-w-[64px] truncate">
            Your Story
          </p>
        </motion.div>

        {/* Stories */}
        {stories.slice(currentIndex, currentIndex + 4).map((story) => (
          <motion.div
            key={story.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 cursor-pointer"
          >
            <div className={`w-16 h-16 rounded-full p-[2px] ${
              story.hasViewed 
                ? 'bg-gray-300 dark:bg-gray-600' 
                : 'bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500'
            }`}>
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-[2px]">
                <img
                  src={story.profileImage}
                  alt={story.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400 max-w-[64px] truncate">
              {story.username}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StoriesCarousel;