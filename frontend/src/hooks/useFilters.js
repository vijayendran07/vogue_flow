import { useState, useCallback } from 'react';

/**
 * Custom hook for managing product filters
 * Handles price, category, ratings, sort, and pagination
 */
export const useFilters = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [price, setPrice] = useState([0, 25000]);
  const [category, setCategory] = useState("");
  const [ratings, setRatings] = useState(0);
  const [sort, setSortBy] = useState("newest");

  const handlePriceChange = useCallback((index, value) => {
    const newPrice = [...price];
    newPrice[index] = Number(value);
    setPrice(newPrice);
  }, [price]);

  const clearFilters = useCallback(() => {
    setPrice([0, 25000]);
    setCategory("");
    setRatings(0);
    setSortBy("newest");
    setCurrentPage(1);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    // State
    currentPage,
    price,
    category,
    ratings,
    sort,
    // Setters
    setCurrentPage,
    setPrice,
    setCategory,
    setRatings,
    setSortBy,
    // Utilities
    handlePriceChange,
    clearFilters,
    resetPagination,
  };
};

export default useFilters;
