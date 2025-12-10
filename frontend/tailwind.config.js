/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                prime: {
                    red: '#EF4444',   // Logo "PRIME" color (approx)
                    blue: '#3B82F6',  // Logo "AUDIO SOLUTIONS" color (approx)
                    dark: '#0f172a',
                    light: '#f8fafc',
                },
                dark: {
                    bg: '#020617',
                    surface: '#1e293b',
                    card: '#0f172a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}
