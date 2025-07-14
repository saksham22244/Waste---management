import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArticleCard = ({ image, title, link }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (title.toLowerCase().includes('recyclable waste') || title.toLowerCase().includes('recycle')) {
            navigate('/viewPost');
        } else if (link) {
            navigate(link);
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

export default ArticleCard;