'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";



// 定义字符数据的接口
interface Character {
  character: string;
  gender_preference?: '男' | '女';
  usage_count: number;
}

export default function CharactersList() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [gender, setGender] = useState<'all' | 'male' | 'female'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 100;

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/zi/list?page=${currentPage}&pageSize=${pageSize}&gender=${gender}`);
      const data = await response.json();
      if (data.success) {
        setCharacters(data.data.characters);
        setTotalPages(Math.ceil(data.data.total / pageSize));
      }
    } catch (error) {
      console.error('获取汉字列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, gender, pageSize]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleCharacterClick = (char: string) => {
    router.push(`/names?containChar=${char}`);
  };

  const handleGenderChange = (newGender: 'all' | 'male' | 'female') => {
    setGender(newGender);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">汉字列表</h1>
      
      <div className="flex justify-center gap-3 mb-8">
        <Button
          variant={gender === 'all' ? 'default' : 'outline'}
          onClick={() => handleGenderChange('all')}
          className="min-w-24"
          disabled={isLoading}
        >
          全部
        </Button>
        <Button
          variant={gender === 'male' ? 'default' : 'outline'}
          onClick={() => handleGenderChange('male')}
          className="min-w-24"
          disabled={isLoading}
        >
          男孩常用
        </Button>
        <Button
          variant={gender === 'female' ? 'default' : 'outline'}
          onClick={() => handleGenderChange('female')}
          className="min-w-24"
          disabled={isLoading}
        >
          女孩常用
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          加载中...
        </div>
      ) : (
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 md:gap-3 mb-8">
          {characters.map((char) => (
            <div 
              key={char.character}
              className={`aspect-square flex items-center justify-center border rounded-lg 
                       hover:bg-gray-50 cursor-pointer text-base md:text-lg
                       transition-colors duration-200
                       ${gender === 'all' && !char.gender_preference ? 'text-blue-600' : 
                         char.gender_preference === '男' ? 'text-blue-600' : 
                         char.gender_preference === '女' ? 'text-pink-600' : ''}`}
              onClick={() => handleCharacterClick(char.character)}
            >
              {char.character}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
          className="hover:bg-gray-100"
        >
          上一页
        </Button>
        <span className="flex items-center px-4">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || isLoading}
          className="hover:bg-gray-100"
        >
          下一页
        </Button>
      </div>
    </div>
  );
} 