# DSA QBank 🚀

A comprehensive Data Structures and Algorithms preparation platform designed to help developers ace technical interviews.

🔗 **Live Demo**: [https://qbankdsa.vercel.app/](https://qbankdsa.vercel.app/)

## ✨ Features

- **Extensive Question Bank**: Access 4000+ curated DSA problems covering all difficulty levels
- **Company-wise Filtering**: Practice questions frequently asked by top tech companies (Google, Amazon, Microsoft, Meta, Apple, and more)
- **Topic-based Organization**: Browse problems by data structures and algorithms topics
- **Advanced Filtering & Sorting**: Filter by difficulty, subtopics, and company tags
- **Search Functionality**: Quickly find specific problems with real-time search
- **Pagination**: Easily navigate through the extensive problem collection
- **Dark Mode Support**: Toggle between light and dark themes for comfortable studying
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Modern UI**: Clean and intuitive interface built with Shadcn UI components

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Routing**: React Router
- **State Management**: Zustand
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rajatsinghten/DSA_QBank.git
   cd DSAQbank
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── pages/
│   ├── LandingPage.tsx        # Landing page with features showcase
│   └── ResourcesPage.tsx      # Main DSA problems listing page
├── components/
│   ├── LandingPageComponents/ # Landing page sections
│   └── ui/                    # Reusable UI components (buttons, cards, etc.)
├── store/
│   └── useResourceStore.ts    # Zustand store for state management
├── data/
│   └── dsa.json              # DSA questions database
└── App.tsx                   # Main application component
```

## 🎨 Features in Detail

### Question Bank
- Over 4000+ carefully curated problems from LeetCode
- Problems categorized by difficulty: Easy, Medium, Hard
- Direct links to problem statements

### Smart Filtering
- Filter by multiple subtopics simultaneously
- Company-specific problem lists
- Real-time search across problem names
- Sort by difficulty or company frequency

### User Experience
- Pagination for easy navigation
- Responsive grid layout
- Loading states and error handling
- Keyboard-friendly interface
- Dark mode for reduced eye strain

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Problem data sourced from various online coding platforms
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or feedback, feel free to reach out or open an issue on GitHub.

---

Made with ❤️ for developers preparing for technical interviews
