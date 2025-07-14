import React from 'react';
import { useNavigate } from 'react-router-dom';

const GCArticleCard = ({ image, title, link }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (title.toLowerCase().includes('recyclable waste') || title.toLowerCase().includes('recycle')) {
            navigate('/gcviewpost');
        }
    };

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 cursor-pointer"
            onClick={handleClick}
        >
            <img src={image} alt={title} className="w-full h-48 object-cover" />
            <div className="p-4 text-center">
                <h3 className="font-bold text-xl">{title}</h3>
            </div>
        </div>
    );
};

export default GCArticleCard;