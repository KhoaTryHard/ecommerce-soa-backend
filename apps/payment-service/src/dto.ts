import{IsNumber,IsPositive,IsString}from'class-validator';export class CreatePaymentDto{@IsString()order_id:string;@IsNumber()@IsPositive()amount:number;@IsString()currency:string;}
