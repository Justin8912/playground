-- random.lua
local key = "randkey:" .. tostring(math.random(1000000))
local value = tostring(math.random(1000000))

redis.call("SET", key, value)

return {key, value}
