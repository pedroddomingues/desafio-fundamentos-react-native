import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

import formatValue from '../utils/formatValue';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
  totalItensInCart(): number;
  cartTotal(): string;
}

const CartContext = createContext<CartContext>({});

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([] as Product[]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cartProducts = await AsyncStorage.getItem(
        '@GoMarketplaceCartProducts',
      );

      if (cartProducts) {
        setProducts(JSON.parse(cartProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      if (products.length === 0) {
        product.quantity = 0;
        products.push(product);
      }

      let hasProduct;

      const newProducts = products.map((item, index, arr) => {
        if (item.id === product.id) {
          item.quantity++;
          hasProduct = true;
          return item;
        }
        return item;
      });

      if (!hasProduct) {
        product.quantity = 1;
        newProducts.push(product);
      }

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplaceCartProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const incrementedProducts = products.filter(item => {
        if (item.id === id) {
          item.quantity++;
        }
        return true;
      });
      setProducts(incrementedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplaceCartProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const decrementedProducts = products.filter(item => {
        if (item.id === id) {
          item.quantity--;
        }
        if (item.quantity === 0) {
          return false;
        }
        return true;
      });

      setProducts(decrementedProducts);

      await AsyncStorage.setItem(
        '@GoMarketplaceCartProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const totalItensInCart = useCallback(() => {
    // TODO RETURN THE SUM OF THE QUANTITY OF THE PRODUCTS IN THE CART
    const totalItems = products.reduce(
      (acc, product) => acc + product.quantity,
      0,
    );
    return totalItems;
  }, [products]);

  const cartTotal = useCallback(() => {
    // TODO RETURN THE SUM OF THE QUANTITY OF THE PRODUCTS IN THE CART
    const totalPrice = products.reduce(
      (acc, product) => acc + product.quantity * product.price,
      0,
    );

    return formatValue(totalPrice);
  }, [products]);

  const value = React.useMemo(
    () => ({
      addToCart,
      increment,
      decrement,
      products,
      totalItensInCart,
      cartTotal,
    }),
    [products, addToCart, increment, decrement, totalItensInCart, cartTotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
