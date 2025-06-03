
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Edit, GripVertical } from 'lucide-react';

interface ProductOption {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  minSelections: number;
  maxSelections: number;
  items: ProductOptionItem[];
}

interface ProductOptionItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

interface ProductOptionsManagerProps {
  options: ProductOption[];
  onOptionsChange: (options: ProductOption[]) => void;
}

export const ProductOptionsManager = ({ 
  options, 
  onOptionsChange 
}: ProductOptionsManagerProps) => {
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);
  const [isAddingOption, setIsAddingOption] = useState(false);

  const addNewOption = () => {
    const newOption: ProductOption = {
      id: `option_${Date.now()}`,
      name: '',
      type: 'single',
      required: false,
      minSelections: 0,
      maxSelections: 1,
      items: []
    };
    setEditingOption(newOption);
    setIsAddingOption(true);
  };

  const saveOption = (option: ProductOption) => {
    const existingIndex = options.findIndex(opt => opt.id === option.id);
    if (existingIndex >= 0) {
      const newOptions = [...options];
      newOptions[existingIndex] = option;
      onOptionsChange(newOptions);
    } else {
      onOptionsChange([...options, option]);
    }
    setEditingOption(null);
    setIsAddingOption(false);
  };

  const removeOption = (optionId: string) => {
    onOptionsChange(options.filter(opt => opt.id !== optionId));
  };

  const OptionForm = ({ option, onSave, onCancel }: {
    option: ProductOption;
    onSave: (option: ProductOption) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<ProductOption>(option);

    const addOptionItem = () => {
      const newItem: ProductOptionItem = {
        id: `item_${Date.now()}`,
        name: '',
        price: 0,
        available: true
      };
      setFormData({
        ...formData,
        items: [...formData.items, newItem]
      });
    };

    const updateOptionItem = (itemId: string, updates: Partial<ProductOptionItem>) => {
      setFormData({
        ...formData,
        items: formData.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      });
    };

    const removeOptionItem = (itemId: string) => {
      setFormData({
        ...formData,
        items: formData.items.filter(item => item.id !== itemId)
      });
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">
            {isAddingOption ? 'Nova Opção' : 'Editar Opção'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Opção</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Ponto da Carne, Adicionais, Tamanho"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({
                  ...formData, 
                  type: e.target.value as 'single' | 'multiple',
                  maxSelections: e.target.value === 'single' ? 1 : formData.maxSelections
                })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="single">Escolha Única</option>
                <option value="multiple">Múltiplas Escolhas</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData({...formData, required: e.target.checked})}
              />
              <span className="text-sm">Obrigatório</span>
            </div>
          </div>

          {formData.type === 'multiple' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mín. Seleções</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minSelections}
                  onChange={(e) => setFormData({
                    ...formData, 
                    minSelections: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Máx. Seleções</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxSelections}
                  onChange={(e) => setFormData({
                    ...formData, 
                    maxSelections: parseInt(e.target.value) || 1
                  })}
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Itens da Opção</label>
              <Button size="sm" onClick={addOptionItem}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-2 p-2 border rounded">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome do item"
                    value={item.name}
                    onChange={(e) => updateOptionItem(item.id, { name: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    value={item.price}
                    onChange={(e) => updateOptionItem(item.id, { 
                      price: parseFloat(e.target.value) || 0 
                    })}
                    className="w-20"
                  />
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={(e) => updateOptionItem(item.id, { available: e.target.checked })}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeOptionItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={() => onSave(formData)}>
              Salvar Opção
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Opções e Adicionais</label>
        <Button size="sm" onClick={addNewOption}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Opção
        </Button>
      </div>

      {editingOption && (
        <OptionForm
          option={editingOption}
          onSave={saveOption}
          onCancel={() => {
            setEditingOption(null);
            setIsAddingOption(false);
          }}
        />
      )}

      <div className="space-y-3">
        {options.map((option) => (
          <Card key={option.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{option.name}</h4>
                    <Badge variant={option.type === 'single' ? 'default' : 'secondary'}>
                      {option.type === 'single' ? 'Única' : 'Múltipla'}
                    </Badge>
                    {option.required && (
                      <Badge variant="outline">Obrigatório</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {option.items.length} {option.items.length === 1 ? 'item' : 'itens'}
                    {option.type === 'multiple' && (
                      <span> • {option.minSelections}-{option.maxSelections} seleções</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {option.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {item.name} {item.price > 0 && `+R$ ${item.price.toFixed(2)}`}
                      </span>
                    ))}
                    {option.items.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{option.items.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingOption(option)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeOption(option.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {options.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma opção adicionada</p>
          <p className="text-sm">Adicione opções como tamanho, adicionais, etc.</p>
        </div>
      )}
    </div>
  );
};
