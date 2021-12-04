import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productsCart = [...cart];
      
      const getProductStock = await api.get(`/stock/${productId}`);
      const amountStock = getProductStock?.data.amount;

      const productExists = productsCart.find((product) => product.id === productId);
      const amountProductStock = productExists ? productExists.amount : 0;
      const totalAmount = amountProductStock + 1;

      if (amountStock < totalAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }

      productExists ? productExists.amount = totalAmount : await api.get(`/products/${productId}`).then((res) => {
        const addProduct = { ...res.data, amount: 1 };
        productsCart.push(addProduct)
        console.log("HERE: ", productsCart)
      });
      
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(productsCart))
      setCart(productsCart)
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const removeProduct = cart.find((product) => product.id === productId);
      if (removeProduct) {
        const removedProduct = cart.filter((product) => product.id !== productId);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(removedProduct))
        setCart(removedProduct)
        return
      }  
      toast.error('Erro na remoção do produto');
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
