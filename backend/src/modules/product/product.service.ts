import { Injectable } from '@nestjs/common';
import { ActivityType } from '../../constants/enums';
import { UserService } from '../user/user.service';

type ProductSku = { code: string; price: number; stock: number };

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  specs: Record<string, string>;
  images: string[];
  skus: ProductSku[];
  sales: number;
};

@Injectable()
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      name: '陶艺入门泥料包',
      category: 'pottery',
      price: 68,
      stock: 80,
      specs: { weight: '2kg' },
      images: ['/uploads/clay.jpg'],
      skus: [{ code: 'CLAY-2KG', price: 68, stock: 80 }],
      sales: 15,
    },
  ];

  constructor(private readonly userService: UserService) {}

  create(payload: Omit<Product, 'id' | 'sales'>) {
    const product: Product = { ...payload, id: Date.now(), sales: 0 };
    this.products.push(product);
    return product;
  }

  list(query: { category?: string; keyword?: string }) {
    return this.products.filter(
      (item) =>
        (!query.category || item.category === query.category) &&
        (!query.keyword || item.name.includes(query.keyword)),
    );
  }

  bestSellers() {
    return [...this.products].sort((a, b) => b.sales - a.sales);
  }

  updateStock(id: number, newStock: number): Product | null {
    const product = this.products.find((item) => item.id === id);
    if (!product) return null;
    const oldStock = product.stock;
    product.stock = newStock;
    if (product.skus.length > 0) {
      product.skus[0].stock = newStock;
    }
    if (oldStock !== newStock) {
      this.userService.addActivityForFavoriters(product.id, ActivityType.FavoriteProductStockChange, {
        productId: product.id,
        productName: product.name,
        oldStock,
        newStock,
      });
    }
    return product;
  }

  findById(id: number): Product | undefined {
    return this.products.find((item) => item.id === id);
  }
}
