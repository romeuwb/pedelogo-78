
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", name: "Todos", emoji: "🍽️" },
  { id: "fast-food", name: "Fast Food", emoji: "🍔" },
  { id: "pizza", name: "Pizza", emoji: "🍕" },
  { id: "japanese", name: "Japonesa", emoji: "🍱" },
  { id: "coffee", name: "Café", emoji: "☕" },
  { id: "mexican", name: "Mexicana", emoji: "🌮" },
  { id: "healthy", name: "Saudável", emoji: "🥗" },
  { id: "dessert", name: "Sobremesas", emoji: "🍰" },
  { id: "brazilian", name: "Brasileira", emoji: "🇧🇷" }
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex overflow-x-auto space-x-4 pb-4">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
          className={`flex-shrink-0 flex items-center space-x-2 ${
            selectedCategory === category.id 
              ? "gradient-delivery text-white shadow-delivery" 
              : "hover:border-delivery-orange hover:text-delivery-orange"
          }`}
        >
          <span>{category.emoji}</span>
          <span>{category.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
