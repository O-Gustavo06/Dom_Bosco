<?php

return [
    'secret' => env('JWT_SECRET', 'your-secret-key'),
    'ttl' => env('JWT_TTL', 43200), 
    'algo' => env('JWT_ALGO', 'HS256'),
];
