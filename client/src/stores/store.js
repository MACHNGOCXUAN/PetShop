import { configureStore } from "@reduxjs/toolkit";
import productReducer from './productSlice.js';
import cartReducer from './cartSlice.js';
import categoryReducer from './catetorySlice.js'
import userReducer from './userSlice.js';

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    categories: categoryReducer,
    user: userReducer,
  },
});