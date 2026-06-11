import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get('best-sellers')
  bestSellers() {
    return this.service.bestSellers();
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body('stock') stock: number) {
    return this.service.updateStock(Number(id), Number(stock));
  }
}
