import{NestFactory}from'@nestjs/core';import{createProxyMiddleware}from'http-proxy-middleware';import{AppModule}from'./app.module';
async function bootstrap(){const app=await NestFactory.create(AppModule);app.enableCors({origin:process.env.CORS_ORIGINS?.split(',')??['http://localhost:3000'],credentials:true});
 const routes=[
  ['/api/v1/auth',process.env.USER_SERVICE_URL??'http://user-service:3001'],['/api/v1/users',process.env.USER_SERVICE_URL??'http://user-service:3001'],
  ['/api/v1/products',process.env.PRODUCT_SERVICE_URL??'http://product-service:3002'],['/api/v1/orders',process.env.ORDER_SERVICE_URL??'http://order-service:3003'],
  ['/api/v1/payments',process.env.PAYMENT_SERVICE_URL??'http://payment-service:3004'],['/api/v1/notifications',process.env.NOTIFICATION_SERVICE_URL??'http://notification-service:3005']
 ] as const;
 for(const[prefix,target]of routes)app.use(prefix,createProxyMiddleware({target,changeOrigin:true,xfwd:true,pathRewrite:(path)=>`${prefix}${path}`,proxyTimeout:15000,on:{error:(err,req,res:any)=>{if(!res.headersSent)res.writeHead(502,{'content-type':'application/json'});res.end(JSON.stringify({statusCode:502,error:'Bad Gateway',message:'Upstream service unavailable'}));}}}));
 await app.listen(process.env.PORT??3000,'0.0.0.0');}bootstrap();
