export default async ({ req, res, log, error }) => {
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
  const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Gyanith</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/appwrite@14.0.0"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              gold: '#d4a574',
              dark: '#070a10',
            },
            fontFamily: {
              orbitron: ['Orbitron', 'sans-serif'],
              rajdhani: ['Rajdhani', 'sans-serif'],
            }
          }
        }
      }
    </script>
    <style>
        body {
            background-color: #000;
            background-image: radial-gradient(circle at 50% 50%, #070a10 0%, #000000 100%);
            color: white;
            font-family: 'Rajdhani', sans-serif;
        }
        
        /* Scanline effect */
        .scanline {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: linear-gradient(to bottom, rgba(212, 165, 116, 0), rgba(212, 165, 116, 0.05) 50%, rgba(212, 165, 116, 0));
            opacity: 0.1;
            animation: scanline 8s linear infinite;
            pointer-events: none;
            z-index: 50;
        }

        @keyframes scanline {
            0% { top: -100px; }
            100% { top: 100%; }
        }

        .gold-glow {
            text-shadow: 0 0 10px rgba(212, 165, 116, 0.3);
        }

        .input-group:focus-within label {
            color: #d4a574;
        }
        
        .input-group:focus-within input {
            border-color: #d4a574;
            box-shadow: 0 0 15px -3px rgba(212, 165, 116, 0.2);
        }

        .btn-hover:hover {
            box-shadow: 0 0 20px rgba(212, 165, 116, 0.4);
            transform: translateY(-1px);
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <div class="scanline"></div>
    
    <!-- Background Elements -->
    <div class="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div class="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px]"></div>
    </div>

    <!-- Card -->
    <div id="recoveryCard" class="relative z-10 w-full max-w-md bg-[#070a10]/80 backdrop-blur-xl border border-gold/20 rounded-2xl shadow-[0_0_40px_-10px_rgba(212,165,116,0.1)] overflow-hidden">
        <!-- Top Bar -->
        <div class="h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>

        <div class="p-8 md:p-10 space-y-8">
            <!-- Header -->
            <div class="text-center space-y-2">
                <h1 class="font-orbitron text-2xl md:text-3xl text-gold font-bold tracking-wider gold-glow uppercase">
                    Reset Access
                </h1>
                <p class="text-white/40 text-sm tracking-widest uppercase font-medium">
                    Secure Checkpoint
                </p>
            </div>

            <!-- Form -->
            <form id="resetForm" class="space-y-6">
                <div class="input-group space-y-2">
                    <label for="password" class="block text-xs uppercase tracking-widest text-white/60 transition-colors font-bold">New Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        required 
                        minlength="8" 
                        placeholder="••••••••"
                        class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-rajdhani text-lg"
                    >
                </div>
                
                <div class="input-group space-y-2">
                    <label for="confirmPassword" class="block text-xs uppercase tracking-widest text-white/60 transition-colors font-bold">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        required 
                        minlength="8" 
                        placeholder="••••••••"
                        class="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-all duration-300 font-rajdhani text-lg"
                    >
                </div>

                <div id="statusMessage" class="hidden p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-xs text-center font-bold tracking-wide"></div>

                <button 
                    type="submit" 
                    id="submitBtn"
                    class="w-full bg-gold text-black font-orbitron font-bold uppercase tracking-wider py-4 rounded-lg transition-all duration-300 btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Update Credentials
                </button>
            </form>
            
            <div class="text-center">
                <p class="text-[10px] text-white/20 uppercase tracking-[0.2em] font-orbitron">
                    Gyanith Systems // Secure
                </p>
            </div>
        </div>
    </div>

    <!-- Success Card -->
    <div id="successCard" class="hidden relative z-10 w-full max-w-md bg-[#070a10]/80 backdrop-blur-xl border border-green-500/30 rounded-2xl shadow-[0_0_40px_-10px_rgba(34,197,94,0.15)] overflow-hidden text-center p-10">
        <div class="mb-6 flex justify-center">
             <div class="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/50 flex items-center justify-center">
                <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
             </div>
        </div>
        <h1 class="font-orbitron text-2xl text-white font-bold tracking-wider mb-4">
            Access Restored
        </h1>
        <p class="text-white/60 text-lg font-rajdhani mb-8">
            Your password has been successfully updated. You may now return to the application and sign in.
        </p>
    </div>

    <script>
        const client = new Appwrite.Client();
        client
            .setEndpoint('${endpoint}')
            .setProject('${projectId}');

        const account = new Appwrite.Account(client);

        const form = document.getElementById('resetForm');
        const submitBtn = document.getElementById('submitBtn');
        const statusMessage = document.getElementById('statusMessage');
        const recoveryCard = document.getElementById('recoveryCard');
        const successCard = document.getElementById('successCard');

        // Get URL parameters
        // Appwrite creates recovery link like: https://example.com?userId=xyz&secret=abc&expire=...
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        const secret = urlParams.get('secret');

        if (!userId || !secret) {
            showError('Invalid or expired recovery link.');
            form.style.display = 'none';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }
            
            if (password.length < 8) {
                showError('Password must be at least 8 characters');
                return;
            }

            setLoading(true);

            try {
                await account.updateRecovery(
                    userId,
                    secret,
                    password,
                    confirmPassword
                );
                showSuccess();
            } catch (error) {
                console.error(error);
                showError(error.message || 'Failed to update password. Link may be expired.');
                setLoading(false);
            }
        });

        function showError(msg) {
            statusMessage.textContent = msg;
            statusMessage.classList.remove('hidden');
            
            // Shake animation
            recoveryCard.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ], {
                duration: 300,
                iterations: 1
            });
        }

        function showSuccess() {
            recoveryCard.style.display = 'none';
            successCard.classList.remove('hidden');
        }

        function setLoading(isLoading) {
            submitBtn.disabled = isLoading;
            submitBtn.innerHTML = isLoading 
                ? '<span class="inline-block animate-pulse">UPDATING...</span>' 
                : 'UPDATE CREDENTIALS';
            
            if (isLoading) {
                statusMessage.classList.add('hidden');
            }
        }
    </script>
</body>
</html>
  `;

  return res.text(html, 200, {
    "content-type": "text/html; charset=UTF-8",
  });
};
