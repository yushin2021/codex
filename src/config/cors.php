<?php

return [

    // Paths where CORS should be applied
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Allowed HTTP methods
    'allowed_methods' => ['*'],

    // Allowed origins (frontend dev server)
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    // Allowed request headers
    'allowed_headers' => ['*'],

    // Headers that are exposed to the browser
    'exposed_headers' => [],

    // How long the results of a preflight request can be cached (in seconds)
    'max_age' => 0,

    // Allow sending credentials (cookies, authorization headers)
    'supports_credentials' => true,

];

