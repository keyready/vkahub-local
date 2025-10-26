/** @type {import('tailwindcss').Config} */

const { nextui } = require('@nextui-org/react');

module.exports = {
    important: true,
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
        './node_modules/@nextui-org/theme/dist/components/skeleton.js',
    ],
    theme: {
        fontSize: {
            'xs': '10px',
            's': '12px',
            'm': '16px',
            'l': '20px',
            'xl': '24px',
            '2xl': '36px',
            '3xl': '48px',
            '10xl': '86px',
        },
        extend: {
            colors: {
                'primary': 'var(--primary-color)',
                'inverted': 'var(--inverted-bg-color)',
                'main': 'var(--text-main)',
                'main-bg': '#303030',
                'grad-start': 'var(--gradient-start)',
                'grad-end': 'var(--gradient-end)',
                'card-bg': 'var(--card-bg)',
                'listbox-bg': 'var(--listbox-bg)',
                'accent': 'var(--accent)',
                'input-bg': 'var(--input-bg)',
                'input-hover-bg': 'var(--input-hover-bg)',
                'input-outline': '#006fee',
            },
        },
    },
    darkMode: 'class',
    plugins: [
        nextui({
            themes: {
                dark: {
                    colors: {
                        danger: {
                            DEFAULT: 'rgb(239 68 68)',
                        },
                    },
                },
            },
        }),
    ],
};
