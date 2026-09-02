import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common'; import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; import { JwtAuthGuard, Public, Roles, RolesGuard } from '@app/common'; import { CreateProductDto,ListProductsDto,ReserveStockDto,SearchDto,UpdateProductDto } from './dto'; import { ProductService } from './product.service';
@ApiTags('products') @ApiBearerAuth() @UseGuards(JwtAuthGuard,RolesGuard) @Controller('products') export class ProductController{constructor(private readonly service:ProductService){}
 @Public() @Get('search') search(@Query() q:SearchDto){return this.service.search(q)}
 @Public() @Get() list(@Query() q:ListProductsDto){return this.service.list(q)}
 @Public() @Get(':id') get(@Param('id') id:string){return this.service.findOne(id)}
 @Roles('SELLER','ADMIN') @Post() create(@Body() dto:CreateProductDto){return this.service.create(dto)}
 @Roles('SELLER','ADMIN') @Put(':id') update(@Param('id') id:string,@Body() dto:UpdateProductDto){return this.service.update(id,dto)}
 @Roles('SELLER','ADMIN') @HttpCode(204) @Delete(':id') remove(@Param('id') id:string){return this.service.remove(id)}
 @Post(':id/reservations') reserve(@Param('id') id:string,@Body() dto:ReserveStockDto){return this.service.reserve(id,dto.quantity)} }
@Controller() export class HealthController{@Public() @Get('health') health(){return{status:'ok',service:'product-service'}}}
