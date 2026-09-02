import{Body,Controller,Get,Headers,Param,Patch,Post,Query,UseGuards}from'@nestjs/common';import{EventPattern,Payload,Ctx,RmqContext}from'@nestjs/microservices';import{ApiBearerAuth,ApiTags}from'@nestjs/swagger';import{JwtAuthGuard,Public}from'@app/common';import{CreateOrderDto,UpdateStatusDto}from'./dto';import{OrderService}from'./order.service';
@ApiTags('orders')@ApiBearerAuth()@UseGuards(JwtAuthGuard)@Controller('orders')export class OrderController{constructor(private readonly service:OrderService){}
 @Post()create(@Body()dto:CreateOrderDto,@Headers('idempotency-key')key:string,@Headers('authorization')auth:string){return this.service.create(dto,key,auth)}
 @Get()byUser(@Query('userId')id:string){return this.service.findByUser(id)}
 @Get(':id')get(@Param('id')id:string){return this.service.findOne(id)}
 @Post(':id/confirm')confirm(@Param('id')id:string){return this.service.transition(id,'CONFIRMED')}
 @Post(':id/cancel')cancel(@Param('id')id:string){return this.service.transition(id,'CANCELLED')}
 @Patch(':id/status')status(@Param('id')id:string,@Body()dto:UpdateStatusDto){return this.service.transition(id,dto.status as any)} }
@Controller()export class EventController{constructor(private readonly service:OrderService){}@EventPattern('payment.succeeded')async paid(@Payload()data:any,@Ctx()ctx:RmqContext){await this.service.transition(data.order_id,'CONFIRMED');ctx.getChannelRef().ack(ctx.getMessage())}@Public()@Get('health')health(){return{status:'ok',service:'order-service'}}}
