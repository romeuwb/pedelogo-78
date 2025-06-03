
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image } from 'lucide-react';

interface ProductImageManagerProps {
  productId?: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const ProductImageManager = ({ 
  productId, 
  images, 
  onImagesChange 
}: ProductImageManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const newImages = [...images];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Simular upload - aqui você integraria com Supabase Storage ou outro serviço
        const imageUrl = URL.createObjectURL(file);
        newImages.push(imageUrl);
      }

      onImagesChange(newImages);
      
      toast({
        title: "Imagens adicionadas",
        description: `${files.length} imagem(ns) adicionada(s) com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload das imagens.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">Imagens do Produto</label>
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <Button size="sm" disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Enviando...' : 'Adicionar Imagens'}
          </Button>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Produto ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma imagem adicionada</p>
          <p className="text-sm text-gray-400">
            Adicione fotos de alta qualidade para atrair mais clientes
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Dica: A primeira imagem será usada como imagem principal do produto.
        Recomendamos imagens com pelo menos 800x600 pixels.
      </p>
    </div>
  );
};
