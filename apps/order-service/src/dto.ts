import{IsArray,IsIn,IsInt,IsOptional,IsPositive,IsString,ValidateNested}from'class-validator';import{Type}from'class-transformer';
class OrderItemDto{@IsString()product_id:string;@IsInt()@IsPositive()quantity:number;}
export class CreateOrderDto{@IsString()customer_id:string;@IsArray()@ValidateNested({each:true})@Type(()=>OrderItemDto)items:OrderItemDto[];@IsOptional()@IsString()currency='VND';}
export class UpdateStatusDto{@IsIn(['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'])status:string;}
