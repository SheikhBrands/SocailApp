import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Post, User } from '../../types';

interface PostCardProps {
  post: Post;
  author: User;
}

const PostCard: React.FC<PostCardProps> = ({ post, author }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={author.profileImage || `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400`}
            alt={author.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {author.displayName}
              </h3>
              {author.isVerified && (
                <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              @{author.username} • {formatDistanceToNow(post.createdAt)} ago
            </p>
          </div>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-900 dark:text-white leading-relaxed">
            {post.content}
          </p>
        </div>
      )}

      {/* Media */}
      {post.mediaUrls.length > 0 && (
        <div className="relative">
          {post.mediaUrls.length === 1 ? (
            <div className="relative">
              {isVideo(post.mediaUrls[0]) ? (
                <div className="relative group">
                  <video
                    src={post.mediaUrls[0]}
                    className="w-full max-h-96 object-cover"
                    controls
                    poster={`${post.mediaUrls[0]}?frame=1`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={post.mediaUrls[0]}
                  alt="Post media"
                  className="w-full max-h-96 object-cover"
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.mediaUrls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative">
                  {isVideo(url) ? (
                    <video
                      src={url}
                      className="w-full h-48 object-cover"
                      poster={`${url}?frame=1`}
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`Post media ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  {index === 3 && post.mediaUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{post.mediaUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center space-x-1 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } transition-colors`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likes.length + (isLiked ? 1 : 0)}</span>
            </motion.button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments.length}</span>
            </button>

            <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">{post.shares}</span>
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={`${
              isSaved ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
            } transition-colors`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {post.views > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {post.views.toLocaleString()} views
          </p>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
          {post.comments.slice(0, 3).map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <img
                src={`https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400`}
                alt="Commenter"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">username</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(comment.createdAt)} ago
                  </span>
                  <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Like
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {post.comments.length > 3 && (
            <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
              View all {post.comments.length} comments
            </button>
          )}

          {/* Add comment */}
          <div className="flex items-center space-x-3 pt-2">
            <img
              src={`https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400`}
              alt="Your profile"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;