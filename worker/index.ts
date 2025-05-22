interface Env {
  // Add environment variables if needed
}

// Mock user data for demonstration
const mockUsers = [
  { id: '1', email: 'admin@example.com', password: 'password', name: 'Admin User', isAdmin: true },
  { id: '2', email: 'user@example.com', password: 'password', name: 'Regular User', isAdmin: false },
];

// Define the shape of login request data
interface LoginRequest {
  email: string;
  password: string;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    console.log('env:', env);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      // Handle authentication
      if (url.pathname === '/api/auth/login') {
        if (request.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
            status: 405,
            headers: {
              'Content-Type': 'application/json',
            }
          });
        }

        try {
          const data = await request.json() as LoginRequest;
          const { email, password } = data;
          
          // Find user
          const user = mockUsers.find(u => u.email === email);
          
          if (!user || user.password !== password) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { 
              status: 401,
              headers: {
                'Content-Type': 'application/json',
              }
            });
          }
          
          // Return user without password
          const { password: _, ...userWithoutPassword } = user;
          
          return new Response(JSON.stringify(userWithoutPassword), {
            headers: {
              'Content-Type': 'application/json',
            }
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'Invalid request' }), { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          });
        }
      }
      
      // Handle user verification
      if (url.pathname === '/api/auth/me') {
        // In a real app, this would validate a token from the authorization header
        // For demonstration, we'll simply return a mock response
        return new Response(JSON.stringify({ 
          authenticated: true,
          message: 'This endpoint would verify user token in a real app' 
        }), {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
      
      // Handle polls API
      if (url.pathname.startsWith('/api/polls')) {
        return new Response(JSON.stringify({ 
          message: 'Polls API not yet implemented' 
        }), {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
      
      // Default API response for unknown routes
      return new Response(JSON.stringify({ 
        error: 'API endpoint not found',
        availableEndpoints: [
          '/api/auth/login',
          '/api/auth/me',
          '/api/polls'
        ]
      }), { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
    
    // Any non-API routes should be handled by the vite client-side app
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
