RateLimiter
==
The purpose of this repo is to explore techniques for implementing rate limiters. I hope to experiment with the following
algorithms:
1. Token Bucket
2. Leaking Bucket
3. Sliding Window 

I will have a couple main goals for this project:
1. Understand the algorithms and their tradeoffs
2. Implement them in code for non-distributed and distributed systems

Running
--
### Non-distributed
To run this application: 

1. Run the docker compose file (this is for the redis container):
```
npm run start:redis
```

2. Go to the `src/config/configuration.json` file and update the parameters as needed (choose `TOKEN_BUCKET` for now)
3. Run the application:

``` 
npm run start:api
```

### Distributed



``` 
npm run start:distributed
```

This will spin up 4 instances of the API fronted by a load balancer. The load balancer will connect to redis and handle

General implementation
--
There are many ways to implement a token bucket rate limiter. You can have it on the client, server, or middleware. I
think the middleware approach is (generally) the best, as you get separation of concerns and it is removed from the
business logic, but for simplicity I will integrate it into the middleware of the application.

I plan to implement each rate limiter as a middleware using nodejs express as my api. The rate limiter will be backed with
redis.

Token Bucket Algorithm
--
Tokens are added to a bucket at a fixed rate x up to a maximum capacity of y tokens. Each request consumes one token
from the bucket. If there are no tokens available, the request is denied. If there are tokens available, one token is
removed from the bucket and the request is allowed.

<img src="https://bytebytego.com/images/courses/system-design-interview/design-a-rate-limiter/figure-4-5-FGZ35C5S.svg">

### Implementation
Additionally, I plan to implement a lazy refill method, where each user's id will be used to track their own token bucket.
Each time a request is made, we will calculate how many tokens to add to the bucket based on the time since the last request.
Then we will store the new timestamp along with the number of tokens in the bucket.

Leaky Bucket Algorithm
--
At its core, it's similar to the token bucket algorithm in the sense that there is a fixed capacity and a rate in which 
the tokens are refilled. The difference is that in the leaky bucket algorithm, requests are processed at a fixed rate, regardless 
of the incoming requests. If the bucket is full and a new request comes in, it is dropped.

### Implementation
I plan to implement this by holding a queue in the redis store. This queue will hold the timestamps for when requests were 
made within the relevant interval. Each time a request comes in, we will check the queue - we will remove any timestamps
that are older than the interval, and if the queue length is less than the capacity, we will allow the request and add
the current timestamp to the queue. If the queue length is equal to the capacity, we will deny the request returning information
about the leaky bucket to the user:
1. x-Rate-Limited-Refill-Rate
2. x-Rate-Limited-Bucket-Capacity
3. x-Rate-Limiter-Retry-After

Creating the distributed system
--
Going from the non-distributed to distributed system is a bit tricky since I have implemented the rate limiter with the 
middleware embedded into the API. The plan will be to create a load balancer that will act as the rate limiter as well. 
That way there is only one connection point to the redis store, and the load balancing logic can be completely separated 
from the API.

### Helpful Articles:
- [Running Redis locally and making cli commands](https://medium.com/redis-with-raphael-de-lio/how-to-run-redis-locally-in-a-docker-container-and-manage-it-with-redis-insight-and-redis-cli-14b0af54e1d2)

### Notes
- I found that I can write lua script and then execute them against my docker container hosting Redis like this:

```aiignore
docker exec -i <container_id>  redis-cli EVAL "$(cat <PATH_TO_FILE>)" 0
```

