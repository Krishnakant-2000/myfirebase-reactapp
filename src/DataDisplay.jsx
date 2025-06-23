// src/DataDisplay.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js'; // Ensure correct import path

function DataDisplay() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!db) {
      console.warn("Firestore (db) is not initialized yet in DataDisplay. Cannot fetch data.");
      return;
    }
    const itemsCollectionRef = collection(db, 'items');
    const unsubscribe = onSnapshot(itemsCollectionRef, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(fetchedItems);
      setError('');
    }, (err) => {
      console.error("Error fetching real-time data:", err);
      setError(`Error loading data: ${err.message}`);
    });
    return () => unsubscribe();
  }, [db]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (newItemName.trim() === '') {
      setError("Item name cannot be empty.");
      return;
    }
    if (!db) {
      setError("Firestore is not initialized. Cannot add item.");
      console.error("Firestore (db) is not initialized. Cannot add item.");
      return;
    }
    try {
      await addDoc(collection(db, 'items'), {
        name: newItemName,
        createdAt: new Date()
      });
      setNewItemName('');
      setError('');
      console.log('Item added successfully!');
    } catch (err) {
      console.error('Error adding item:', err);
      setError(`Error adding item: ${err.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-lg mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Firestore Data</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleAddItem} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Add new item"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Item
        </button>
      </form>
      {items.length === 0 ? (
        <p className="text-gray-600 text-center">No items yet. Add one!</p>
      ) : (
        <ul className="list-disc pl-5">
          {items.map((item) => (
            <li key={item.id} className="text-gray-800 py-1 border-b border-gray-200 last:border-b-0">
              {item.name}
              {item.createdAt && typeof item.createdAt.toDate === 'function' && (
                <span className="text-sm text-gray-500 ml-2">
                  ({item.createdAt.toDate().toLocaleString()})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DataDisplay;