# 💕 San Valentino - Interactive Valentine's Day Webpage

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/Shipwithsimo/san-valentino)
[![GitHub](https://img.shields.io/badge/GitHub-Shipwithsimo-blue.svg)](https://github.com/Shipwithsimo)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow.svg)](https://github.com/Shipwithsimo/san-valentino)

> An elegant, interactive, and playful Valentine's Day invitation webpage that will melt hearts 💖

## 🎭 What is this?

**San Valentino** is not your average Valentine's Day card. It's an interactive web experience that turns asking someone to be your Valentine into a fun, unforgettable moment. Watch as the "No" button playfully runs away from your cursor while the "Yes" button grows bigger and more tempting with each attempt. It's cute, it's clever, and it's guaranteed to bring a smile!

Perfect for:
- 💝 Asking your crush to be your Valentine
- 🎉 Surprising your partner with a creative invitation
- 👩‍💻 Learning interactive web development techniques
- 🎨 Using as a template for playful interactive forms

## ✨ Features

- 🎯 **Interactive "No" Button** - Intelligently evades the cursor using proximity detection and safe repositioning algorithms
- 📈 **Growing "Yes" Button** - Progressively scales up with each "No" attempt, making acceptance increasingly irresistible
- 💬 **Dynamic Italian Messages** - Charming persuasive messages that change with every interaction
- 🥊 **Hidden Easter Egg** - Discover a special punch overlay animation after multiple "No" attempts (because persistence is key!)
- 💝 **Celebration Page** - Beautiful confetti particle animation awaits when they say "Yes"
- 💕 **Falling Hearts Animation** - Romantic animated hearts create an enchanting atmosphere
- 📱 **Fully Responsive** - Flawless experience on mobile, tablet, and desktop devices
- ♿ **Accessibility First** - Respects \`prefers-reduced-motion\`, includes ARIA labels, and supports keyboard navigation
- 🎨 **Elegant Design** - Modern, romantic UI with custom typography (Manrope + Playfair Display) and smooth animations
- 🚀 **Zero Dependencies** - Pure vanilla HTML, CSS, and JavaScript - no frameworks, no build process

## 🎥 Demo

### Preview

The interactive "No" button runs away from your cursor, while the "Yes" button grows larger with each attempt. After clicking "Yes," you're greeted with a beautiful celebration page featuring confetti animations and a heartfelt message.

> **Try it yourself!** Clone the repo and open \`index.html\` to experience the magic ✨

## 🛠️ Tech Stack

- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Custom properties, advanced animations, responsive grid/flexbox
- **Vanilla JavaScript (ES6+)** - No frameworks, just pure JavaScript magic
- **Google Fonts** - Manrope (modern sans-serif) & Playfair Display (elegant serif)

**Why Vanilla?**
Zero dependencies means instant loading, easy maintenance, and a great learning resource for understanding core web technologies!

## 🚀 Quick Start

Getting started is incredibly simple - no npm, no build tools, just open and run!

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/Shipwithsimo/san-valentino.git
cd san-valentino
\`\`\`

### 2. Open in your browser

**Option A: Double-click** \`index.html\` (simplest way)

**Option B: Use a local server** (recommended for best experience)

\`\`\`bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
\`\`\`

### 3. Visit in your browser

Open \`http://localhost:8000\` and watch the magic happen! ✨

That's it! **No build process, no package installation, no configuration.** Pure vanilla magic.

## 📂 Project Structure

\`\`\`
san-valentino/
├── index.html          # Main invitation page with interactive buttons
├── yes_page.html       # Celebration page with confetti animation
├── styles.css          # Main stylesheet with animations & responsive design
├── yes_style.css       # Celebration page styles
├── script.js           # Interactive logic for button evasion & scaling
├── assets/             # Images, GIFs, and audio files
│   ├── cat-love.gif
│   ├── sanhap-cat.gif
│   ├── giphy.gif
│   └── dbz-rapid-punches-sfx.mp3
└── version.json        # Project metadata
\`\`\`

## 🎨 Features Deep Dive

### Interactive "No" Button Logic

The evasive button isn't just moving randomly - it's smart!

- **Proximity Detection**: Monitors cursor position and triggers evasion at 120px distance
- **Safe Repositioning**: Calculates new positions that avoid both cursor and "Yes" button
- **Collision Prevention**: Ensures buttons never overlap, maintaining perfect UX
- **Cooldown System**: Prevents rapid jittery movements with a 24ms cooldown
- **Boundary Awareness**: Stays within viewport bounds with padding constraints
- **Mobile Adaptation**: Automatically disables evasion on touch devices

### Intelligent Scaling System

The "Yes" button grows strategically to encourage acceptance:

- Increases by 0.12 scale factor with each "No" attempt
- Different maximum scales: 1.35x on mobile, 1.8x on desktop
- Smooth CSS transform transitions for elegant growth
- Resets appropriately when needed

### Accessibility Features

Built with inclusivity in mind:

- **Reduced Motion Support**: Respects \`prefers-reduced-motion\` media query
- **ARIA Live Regions**: Screen reader announcements for dynamic content
- **Keyboard Navigation**: Full functionality without a mouse
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Focus Management**: Visible focus indicators for all interactive elements

### Easter Egg - Punch Overlay

Click "No" multiple times (8+ attempts) to unlock a surprise animation featuring Dragon Ball Z-inspired rapid punches with synchronized sound effects!

## 💡 How It Works

1. **Initial State**: User sees the invitation with two buttons
2. **Hover/Click "No"**: Button evades using proximity calculations
3. **Each Attempt**: "Yes" button scales up, making it more appealing
4. **Dynamic Feedback**: Italian messages update to persuade the user
5. **Easter Egg**: After 8+ "No" attempts, special animation triggers
6. **Victory**: Clicking "Yes" navigates to celebration page with confetti
7. **Celebration**: Particle system creates beautiful confetti rain animation

## 🎯 Use Cases

- 💝 **Romantic Proposals** - Ask your crush or partner to be your Valentine in a memorable way
- 🎉 **Special Invitations** - Create unique, interactive invitations for events
- 📚 **Learning Resource** - Study advanced JavaScript interactions and CSS animations
- 🎨 **Template** - Fork and customize for your own interactive forms or games
- 🏫 **Teaching Tool** - Demonstrate DOM manipulation, event handling, and animation techniques

## 🤝 Contributing

Contributions are welcome and encouraged! Here's how you can help:

- 🐛 **Report Bugs** - Found an issue? Open a bug report
- 💡 **Suggest Features** - Have an idea? Share it in the issues
- 🎨 **Improve Design** - Submit design improvements or new themes
- 🌍 **Add Translations** - Translate messages to other languages
- 📖 **Improve Docs** - Help make the documentation better
- ⭐ **Share** - Star the repo and share it with others!

**To contribute:**

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

Feel free to use it, modify it, and share it!

## 👨‍💻 Author

**Shipwithsimo**

- GitHub: [@Shipwithsimo](https://github.com/Shipwithsimo)
- Website: [shipwithsimo.com](https://shipwithsimo.com)

Made with ❤️ for Valentine's Day 2026

## 🌟 Inspiration & Credits

- **Design Philosophy**: Inspired by modern romantic aesthetics and playful UX patterns
- **Fonts**: [Google Fonts](https://fonts.google.com) - Manrope & Playfair Display
- **Concept**: The "evasive button" pattern popularized in playful web interactions

## ⭐ Show Your Support

If this project helped you win someone's heart, or if you just think it's cool, give it a ⭐️!

**Enjoying the project?**
- ⭐ Star this repository
- 🐦 Share it on social media
- 💬 Tell your friends about it
- 🎨 Create your own version and tag us!

---

<div align="center">

**[View Demo](#) • [Report Bug](https://github.com/Shipwithsimo/san-valentino/issues) • [Request Feature](https://github.com/Shipwithsimo/san-valentino/issues)**

Made with 💕 by [Shipwithsimo](https://github.com/Shipwithsimo)

</div>
