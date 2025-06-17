import React, { useEffect, useRef, useState, useContext } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/Util';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    await sendMessage({ text: inputMessage });
    setInputMessage('');
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  return selectedUser ? (
    <div className="flex flex-col h-screen relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500 bg-black sticky top-0 z-20">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className="md:hidden w-7" />
        <img src={assets.help_icon} alt="" className="max-md:hidden w-5" />
      </div>

      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, index) => {
          if (!msg || !msg.senderId) return null;

          return (
            <div
              key={index}
              className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                    msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <div className="text-center text-xs">
                <img
                  src={
                    msg.senderId === authUser?._id
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  alt=""
                  className="w-7 rounded-full"
                />
                <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom input bar */}
      <div className="border-t border-stone-600 p-3 flex items-center gap-3 bg-black sticky bottom-0 z-20">
        <div className="flex-1 flex items-center bg-gray-100/10 px-3 rounded-full">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="upload" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-screen">
      <img src={assets.logo_icon} alt="" className="w-16" />
      <p className="text-lg font-medium text-white">Chat anytime anywhere</p>
    </div>
  );
};

export default ChatContainer;
