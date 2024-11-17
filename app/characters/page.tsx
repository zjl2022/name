'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function CharactersList() {
  const router = useRouter();
  const [characters, setCharacters] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedChar, setSelectedChar] = useState('');
  const [lastName, setLastName] = useState(() => {
    // 从 localStorage 获取上次保存的姓氏
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastName') || '';
    }
    return '';
  });
  const [gender, setGender] = useState<'all' | 'male' | 'female'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 100;

  useEffect(() => {
    fetchCharacters();
  }, [currentPage, gender]);

  // 保存姓氏到 localStorage
  useEffect(() => {
    if (lastName) {
      localStorage.setItem('lastName', lastName);
    }
  }, [lastName]);

  const fetchCharacters = async () => {
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
  };

  const handleCharacterClick = (char: string) => {
    if (lastName) {
      // 如果已有姓氏，直接跳转
      router.push(`/names?lastName=${lastName}&containChar=${char}`);
    } else {
      // 否则打开对话框要求输入姓氏
      setSelectedChar(char);
    }
  };

  const handleSearch = () => {
    if (!lastName) {
      alert('请输入姓氏');
      return;
    }
    router.push(`/names?lastName=${lastName}&containChar=${selectedChar}`);
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
            <Dialog key={char.character} open={selectedChar === char.character && !lastName}>
              <DialogTrigger asChild>
                <div 
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
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl mb-4">
                    选择姓氏以搜索包含『{char.character}』的名字
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="请输入姓氏"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="text-center text-lg"
                  />
                  <Button 
                    className="w-full"
                    onClick={handleSearch}
                  >
                    开始搜索
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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