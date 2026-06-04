
//import 'zone.js/node';
import { APP_BASE_HREF } from '@angular/common';
import { enableProdMode } from '@angular/core';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath, format, parse, UrlWithParsedQuery } from 'node:url';
//import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import AppServerModule from './main.server'; // Imports the server bootstrap function
import { environment } from './environments/environment';
//import { existsSync } from 'node:fs';
import * as redis from 'redis';
import cors from "cors";
import compression from 'compression';
if (environment.production || environment.staging) {
  enableProdMode();
}
// Setup Redis client if REDIS_URL is provided
// You can use environment variables for security and flexibility
const isRedisEnabled = process.env.REDIS_ENABLED === 'true'; 
const redisHost = process.env.REDIS_HOST || '127.0.0.1'; // Default to localhost
const redisPort = process.env.REDIS_PORT || 6379; // Default Redis port
const redisPassword = process.env.REDIS_PASSWORD || ''; // Optional password
const redisUrl = process.env['REDIS_URL'] || `redis://${redisPassword ? ':' + redisPassword + '@' : ''}${redisHost}:${redisPort}`
const redisCacheEnabled = process.env.CACHE_ENABLED === 'true';
let redisClient = null;
async function connectRedis() {  
  if (!isRedisEnabled) {
    //console.log('Redis is disabled, skipping connection.');
    return; // Exit function if Redis is not enabled
  }

  try {
    // createClient() connects to localhost:6379 by default
    // or you can use a URL: createClient({ url: process.env.REDIS_URL })
    redisClient = redis.createClient({ url: redisUrl });

    // Handle connection errors
    redisClient.on('error', (err) => console.error('Redis Client Error', err));

    await redisClient.connect();
    console.log('Connected to Redis successfully!');
    
  } catch (e) {
    console.error('Failed to connect to Redis:', e);
    // Optional: set client to null or handle the error as needed
    redisClient = null;
  }
}
// Function to get the client instance, only if it's connected
function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }
  // Return a 'dummy' client or null if not connected, depending on your app's needs
  return null; 
}

// Cache configuration
const CACHE_DURATION = 604800; // 1 week in seconds
// const CACHE_ENABLED = true; // Enable cache for testing - change to environment.production later
const CACHE_ENABLED = environment.production || environment.staging;

const IGNORED_PARAMS_FOR_CACHE = ['srsltid', 'utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'utm_content', 'gad_campaignid', 'gad_source', 'gclid', 'vt_adgroup', 'vt_campaign', 'vt_keyword', 'vt_loc_interest', 'vt_matchtype', 'vt_network', 'vt_physical', 'vt_placement', 'gbraid', 'wbraid', 'utm_id', 'utm_term'];

//console.log(`Cache configuration: CACHE_ENABLED=${CACHE_ENABLED}, CACHE_DURATION=${CACHE_DURATION}`);

// Cache middleware
const cacheMiddleware = (duration: number = CACHE_DURATION) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    //console.log(`Cache middleware called for: ${req.url}, method: ${req.method}`);
    const urlPath = req.path || req.url;
    // Define a regex that matches '/user/' OR '/admin/' OR '/profile/' at the start
    const pathRegex = /^\/(api|v1)\//i;
    const extRegex = /\.(php|config|mysql|txt|xml)$/i;   
    // Skip caching for certain routes or conditions
    if (!redisCacheEnabled || !CACHE_ENABLED || req.method !== 'GET' || pathRegex.test(urlPath) || extRegex.test(urlPath)) {
      //console.log(`Skipping cache for: ${req.url}, enabled: ${CACHE_ENABLED}, method: ${req.method}`);
      return next();
    }

    const rawUrl = req.url;
    const normalizedUrl = normalizeUrl(rawUrl);
    const cacheKey = normalizedUrl == '/true' ? 'ssr:/' : `ssr:${normalizedUrl}`;
    // const cacheKey = `ssr:${req.url}`;
    //console.log(`Cache key: ${cacheKey}`);
    
    try {      
      const client = getRedisClient();
      // Check Redis connection
      if (client && !client.isOpen) {
        //console.log('Redis client not connected, skipping cache');
        return next();
      }
      if(client){
        // Check if page exists in cache
        const cachedPage = await client.get(cacheKey);        
        if (cachedPage) {
          //console.log(`Cache hit for: ${req.url}`);
          res.setHeader('X-Cache', 'HIT');
          return res.send(cachedPage);
        }
        
        //console.log(`Cache miss for: ${req.url}`);
        
        // Override res.send to cache the response
        const originalSend = res.send.bind(res);
        res.send = (body: any) => {
          //console.log(`Response for ${req.url}: status=${res.statusCode}, type=${typeof body}, hasHTML=${typeof body === 'string' && body.includes('<!DOCTYPE html>')}`);
          
          // Only cache successful HTML responses
          if (res.statusCode === 200 && typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
            //console.log(`Attempting to cache: ${cacheKey}`);
            client.setEx(cacheKey, duration, body)
              .then(() => {
                console.log(`Successfully cached page: ${req.url}`);
              })
              .catch((err) => {
                console.error(`Failed to cache page: ${req.url}`, err);
              });
          }
          res.setHeader('X-Cache', 'MISS');
          return originalSend(body);
        };
      } else {
        //console.log('Cannot perform Redis operations: client not available.');
      }
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

const normalizeUrl = (url: string): string => {
  const parsed: UrlWithParsedQuery = parse(url, true);
  // Filter out ignored parameters
  const cleanedQuery: Record<string, string | string[]> = {};
  for (const key of Object.keys(parsed.query)) {
    if (!IGNORED_PARAMS_FOR_CACHE.includes(key)) {
      cleanedQuery[key] = parsed.query[key];
    }
  }
  // Sort remaining parameters to ensure consistent cache key
  const sortedQuery: Record<string, string | string[]> = {};
  Object.keys(cleanedQuery).sort().forEach(key => {
    sortedQuery[key] = cleanedQuery[key];
  });
  return format({
    pathname: parsed.pathname,
    query: sortedQuery
  });
};

// Cache invalidation helper
const invalidateCache = (pattern: string = 'ssr:*') => {
  return new Promise((resolve, reject) => {
    if(redisClient && redisClient.isOpen){
      redisClient.keys(pattern)
        .then((keys: string[]) => {
          if (keys.length > 0) {
            return redisClient.del(keys);
          }
          return 0;
        })
        .then((result: number) => {
          console.log(`Invalidated ${result} cache entries`);
          resolve(result);
        })
        .catch(reject);
    }
  });
};

/// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  server.use(compression());
  
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(cors());

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  // const browserDistFolder = join(process.cwd(), 'dist/frontend/browser');
  // const indexHtml = existsSync(join(browserDistFolder, 'index.original.html'))
  //   ? join(browserDistFolder, 'index.original.html')
  //   : join(browserDistFolder, 'index.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Add cache invalidation endpoint (optional - for manual cache clearing)
  server.post('/api/cache/invalidate', async (req, res) => {
    try {
      const pattern = req.body.pattern || 'ssr:*';
      await invalidateCache(pattern);
      res.json({ success: true, message: 'Cache invalidated' });
    } catch (error) {
      console.error('Cache invalidation error:', error);
      res.status(500).json({ success: false, error: 'Cache invalidation failed' });
    }
  });

  let crawlableRobotsTxt;
  
  if(environment.staging){
    crawlableRobotsTxt = `
    User-agent: *\n
    Disallow: / \n\n
    Disallow: uat.tradesale.com \n\n
    Disallow: uat-admin.tradesale.com \n\n
    Disallow: uat-vendor.tradesale.com \n\n
    User-agent: Googlebot\n
    Disallow: /\n\n
    User-agent: Googlebot-Image\n
    Disallow: /`;    
  } else {
    crawlableRobotsTxt = `
    User-agent: *\n
    Disallow: \n
    Disallow: admin.tradesale.com \n\n
    Disallow: vendor.tradesale.com \n\n`;
  }  

  server.use('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send(crawlableRobotsTxt);
  })

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', cacheMiddleware(), (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    //Configuration based rendering
    // commonEngine
    //   .render({
    //     bootstrap,
    //     documentFilePath: indexHtml,
    //     url: `${protocol}://${headers.host}${originalUrl}`,
    //     publicPath: distFolder,
    //     providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    //   })
    //   .then((html) => res.send(html))
    //   .catch((err) => next(err));
     
     //Module based rendering
     commonEngine
      .render({
        bootstrap: AppServerModule,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if(redisClient && redisClient.isOpen){
     redisClient.quit();
  } 
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if(redisClient && redisClient.isOpen){
     redisClient.quit();
  } 
  process.exit(0);
});

run();