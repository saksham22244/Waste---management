import React from "react";
import { User } from "lucide-react";
import NotificationPopup from "./NotificationPopup";
import ProfilePopup from "./ProfilePopup";

const Header = () => {
  return (
    <div className="w-full flex justify-between items-center px-8 py-4 bg-transparent">
      <div className="text-3xl font-bold text-[#2A3B2A]">GREEN CYCLE</div>
      <div className="flex items-center space-x-4">
        <NotificationPopup />
        <div className="p-2 rounded-full bg-gray-100">
          <ProfilePopup />
        </div>
      </div>
    </div>
  );
};

export default Header;