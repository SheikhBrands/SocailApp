import React, { useState } from 'react';
import { Image, Video, Smile, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const CreatePost: React.FC = () => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedMedia([...selectedMedia, ...files]);
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(selectedMedia.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Handle post creation
    console.log('Creating post:', { content, media: selectedMedia });
    setContent('');
    setSelectedMedia([]);
    setIsExpanded(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <img
          src={user?.profileImage || `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400`}
          alt={user?.displayName}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What's on your mind?"
            className="w-full resize-none border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 text-lg"
            rows={isExpanded ? 3 : 1}
          />

          {/* Media Preview */}
          <AnimatePresence>
            {selectedMedia.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2"
              >
                {selectedMedia.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer text-gray-500 hover:text-primary-500 transition-colors">
                    <Image className="w-5 h-5" />
                    <span className="text-sm font-medium">Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMediaSelect}
                      className="hidden"
                    />
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-gray-500 hover:text-primary-500 transition-colors">
                    <Video className="w-5 h-5" />
                    <span className="text-sm font-medium">Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleMediaSelect}
                      className="hidden"
                    />
                  </label>

                  <button className="flex items-center space-x-2 text-gray-500 hover:text-primary-500 transition-colors">
                    <Smile className="w-5 h-5" />
                    <span className="text-sm font-medium">Emoji</span>
                  </button>

                  <button className="flex items-center space-x-2 text-gray-500 hover:text-primary-500 transition-colors">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-medium">Location</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      setContent('');
                      setSelectedMedia([]);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() && selectedMedia.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Post
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;