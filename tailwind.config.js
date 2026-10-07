/** 主题变量集中在这里，换课件换主题时改这一份即可 */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        paper: { 50: '#fcfbf7', 100: '#f7f4eb', 200: '#efe8d8', 300: '#e2d5bd' },
        botanical: { 900: '#1b3022', 800: '#274731', 700: '#345e41', 500: '#4e8760', 100: '#e5f0e8' },
        autumn: { 400: '#fb8b24', 500: '#e36414', 600: '#9a031e', 700: '#5f0f40' },
        bark: { 800: '#3d2612', 600: '#6f4520', 100: '#f0e6df' },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', 'STSong', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        cute: ['TangYuan', '"PingFang SC"', '"Microsoft YaHei"', 'STSong', 'serif'],
      },
    },
  },
  plugins: [],
}
