import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(
      messages.filter(msg => msg.image).map(msg => msg.image)
    );
  }, [messages]);

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""}`}>
      {/* Top content */}
      <div>
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-20 aspect-[1/1] rounded-full"
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
            ></span>
            {selectedUser.fullName}
          </h1>
          <p className="px-10 mx-auto text-center">
            {selectedUser.bio || 'No bio available.'}
          </p>
        </div>

        <hr className="border-[#ffffff50] my-4" />

        <div className="px-5 text-xs">
          <p className="text-sm font-medium mb-2">Media</p>
          <div className="max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {msgImages.map((url, index) => (
              <div key={index} onClick={() => window.open(url)} className="cursor-pointer rounded">
                <img src={url} alt={`media-${index}`} className="h-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout button at bottom */}
      <div className="py-5 flex justify-center">
        <button
          onClick={logout}
          className="bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;
