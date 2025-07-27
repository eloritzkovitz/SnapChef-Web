"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import categories from "../../data/categories";
import AddIngredientForm from "./AddIngredientForm";
import EditIngredientForm from "./EditIngredientForm";
import DeleteItemForm from "./DeleteItemForn.tsx";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  imageURL: string;
}

const ITEMS_PER_PAGE = 20;

const IngredientList: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
    []
  );
  const [visibleIngredients, setVisibleIngredients] = useState<Ingredient[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Ingredient | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | null>(
    null
  );
  const [ingredientToDelete, setIngredientToDelete] =
    useState<Ingredient | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Fetch all ingredients from the API
  const fetchIngredients = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/ingredients`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ingredients.");
      }
      const data = await response.json();
      setIngredients(data);
      setFilteredIngredients(data);
      setVisibleIngredients(data.slice(0, ITEMS_PER_PAGE));
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch ingredients on component mount
  useEffect(() => {
    fetchIngredients();
  }, []);

  // Update visible ingredients when page or filtered ingredients change
  useEffect(() => {
    setVisibleIngredients(filteredIngredients.slice(0, page * ITEMS_PER_PAGE));
  }, [page, filteredIngredients]);

  // Filter ingredients based on search term, category, and sort order
  useEffect(() => {
    let updatedIngredients = [...ingredients];

    if (searchTerm) {
      updatedIngredients = updatedIngredients.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      updatedIngredients = updatedIngredients.filter(
        (ingredient) => ingredient.category === selectedCategory
      );
    }

    if (sortField) {
      updatedIngredients.sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredIngredients(updatedIngredients);
    setPage(1);
  }, [searchTerm, selectedCategory, sortField, sortOrder, ingredients]);

  // Infinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (page * ITEMS_PER_PAGE < filteredIngredients.length) {
            setPage((prevPage) => prevPage + 1);
          }
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [filteredIngredients, page]);

  // Handle sorting of ingredients
  const handleSort = (field: keyof Ingredient) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Handle adding a new ingredient
  const handleAddIngredient = (newIngredient: Ingredient) => {
    setIngredients((prev) => [...prev, newIngredient]);
    setFilteredIngredients((prev) => [...prev, newIngredient]);
    setVisibleIngredients((prev) =>
      [...prev, newIngredient].slice(0, page * ITEMS_PER_PAGE)
    );
    setIsAddModalOpen(false);
  };

  // Handle editing an existing ingredient
  const handleEditIngredient = (updatedIngredient: Ingredient) => {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
      )
    );
    setFilteredIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
      )
    );
    setVisibleIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
      )
    );
    setIsEditModalOpen(false);
    setIngredientToEdit(null);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center mb-4">
        {/* Header */}
        <Link href="/admin/dashboard" className="mr-2 text-black flex items-center">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>

        <h1 className="text-2xl font-bold">View Ingredients</h1>
      </div>

      {/* Menu */}
      <div className="flex justify-between items-center mb-4">
        {/* Search */}
        <div className="flex items-center w-full max-w-md border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 ml-2" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 focus:outline-none"
          />
        </div>

        {/* Select category */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
        </div>

        {/* Add Ingredient */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
        >
          <PlusIcon className="h-5 w-5" /> Add Ingredient
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 table-fixed">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left w-1/12">Image</th>

              <th className="p-3 text-left w-1/4">Item ID</th>
              <th
                className="p-3 text-left cursor-pointer w-1/2"
                onClick={() => handleSort("name")}
              >
                Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="p-3 text-left cursor-pointer w-1/4"
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-3 text-left w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleIngredients.map((ingredient) => (
              <tr
                key={ingredient.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3 w-1/12">
                  <img
                    src={
                      ingredient.imageURL
                        ? `${ingredient.imageURL}${
                            ingredient.imageURL.includes("?") ? "&" : "?"
                          }t=${ingredient.id}`
                        : "/images/placeholder_image.png"
                    }
                    alt={ingredient.name}
                    className="w-full h-10 object-contain rounded bg-white"
                    style={{ maxWidth: "40px", maxHeight: "40px" }}
                  />
                </td>
                <td className="p-3 w-1/4">{ingredient.id}</td>
                <td className="p-3 w-1/2">{ingredient.name}</td>
                <td className="p-3 w-1/4">{ingredient.category}</td>
                <td className="p-3 flex space-x-2">
                  <button
                    onClick={() => {
                      setIngredientToEdit(ingredient);
                      setIsEditModalOpen(true);
                    }}
                    className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-1"
                  >
                    <PencilIcon className="h-5 w-5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setIngredientToDelete(ingredient);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1"
                  >
                    <TrashIcon className="h-5 w-5" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {page * ITEMS_PER_PAGE < filteredIngredients.length && (
        <div
          ref={loaderRef}
          className="text-center py-4 flex items-center justify-center"
        >
          <ArrowPathIcon className="animate-spin h-5 w-5 text-black mr-2" />
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <AddIngredientForm
              categories={categories}
              onAddIngredient={handleAddIngredient}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}

      {isEditModalOpen && ingredientToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            {/* Edit Ingredient Form */}
            <EditIngredientForm
              categories={categories}
              ingredient={ingredientToEdit}
              onEditIngredient={handleEditIngredient}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}

      {isDeleteDialogOpen && ingredientToDelete && (
        <DeleteItemForm
          itemId={ingredientToDelete.id}
          itemName={ingredientToDelete.name}
          onDeleteSuccess={() => {
            setIngredients((prev) =>
              prev.filter(
                (ingredient) => ingredient.id !== ingredientToDelete.id
              )
            );
            setFilteredIngredients((prev) =>
              prev.filter(
                (ingredient) => ingredient.id !== ingredientToDelete.id
              )
            );
            setVisibleIngredients((prev) =>
              prev.filter(
                (ingredient) => ingredient.id !== ingredientToDelete.id
              )
            );
            setIsDeleteDialogOpen(false);
            setIngredientToDelete(null);
          }}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setIngredientToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default IngredientList;
