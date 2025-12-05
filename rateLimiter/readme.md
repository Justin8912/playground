RateLimiter
==
The purpose of this repo is to explore techniques for implementing rate limiters. I hope to experiment with the following
algorithms:
1. Token Bucket
2. Leaking Bucket
3. Sliding Window 

I will have a couple main goals for this project:
1. Understand the algorithms and their tradeoffs
2. Implement them in code
3. Benchmark their performance
4. Write tests to verify correctness
5. Document the implementations and findings

Token Bucket Algorithm
--
Tokens are added to a bucket at a fixed rate x up to a maximum capacity of y tokens. Each request consumes one token
from the bucket. If there are no tokens available, the request is denied. If there are tokens available, one token is
removed from the bucket and the request is allowed.

<img src="https://bytebytego.com/images/courses/system-design-interview/design-a-rate-limiter/figure-4-5-FGZ35C5S.svg">

### Implementation
There are many ways to implement a token bucket rate limiter. You can have it on the client, server, or middleware. I
think the middleware approach is (generally) the best, as you get separation of concerns and it is removed from the
business logic, but for simplicity I will integrate it into the application.

I plan to implement the rate limiter as a middleware using nodejs express as my api. The rate limiter will be backed with
redis.

Additionally, I plan to implement a lazy refill method, where each user's id will be used to track their own token bucket.
Each time a request is made, we will calculate how many tokens to add to the bucket based on the time since the last request.
Then we will store the new timestamp along with the number of tokens in the bucket.