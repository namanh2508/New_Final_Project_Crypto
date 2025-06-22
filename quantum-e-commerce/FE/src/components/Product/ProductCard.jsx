import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { formatPrice } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const {
    id,
    name,
    price,
    main_image,
    rating,
    sold_count,
    seller_name,
    seller_type,
    discount_percent
  } = product;

  return (
    <Link to={`/product/${id}`} className="block group">
      <div className="card hover:shadow-lg transition-shadow duration-200">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={main_image || '/images/placeholder-product.jpg'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Discount Badge */}
          {discount_percent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{discount_percent}%
            </div>
          )}

          {/* Seller Type Badge */}
          {seller_type === 'shopee_mall' && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
              Mall
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3">
          {/* Product Name */}
          <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-primary font-semibold text-lg">
              {formatPrice(price)}
            </span>
            {discount_percent > 0 && (
              <span className="text-gray-400 text-sm line-through">
                {formatPrice(price * (1 + discount_percent / 100))}
              </span>
            )}
          </div>

          {/* Rating & Sales */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-1">{rating}</span>
              </div>
            </div>
            <span>Đã bán {sold_count}</span>
          </div>

          {/* Seller Name */}
          <div className="text-xs text-gray-400 mt-1 truncate">
            {seller_name}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;