import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="card animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
      
      {/* Content Skeleton */}
      <div className="p-3 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        
        {/* Rating & Sales */}
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        
        {/* Seller */}
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;