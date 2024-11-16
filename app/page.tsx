'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [containChar, setContainChar] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!lastName && !gender && !containChar) {
      alert('请至少输入一个搜索条件');
      return;
    }

    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        lastName,
        gender,
        containChar
      });

      router.push(`/names?${params.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
      alert('搜索失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">宝宝起名</h1>
          <p className="text-gray-600">为您的宝宝找寻最美好的名字</p>
        </div>
        
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">姓氏</label>
            <Input 
              placeholder="请输入姓氏" 
              className="h-11"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">性别</label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="选择性别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男</SelectItem>
                <SelectItem value="female">女</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">包含字</label>
            <Input 
              placeholder="搜索包含的字" 
              className="h-11"
              value={containChar}
              onChange={(e) => setContainChar(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full h-11 text-lg bg-blue-600 hover:bg-blue-700"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? '搜索中...' : '开始取名'}
          </Button>
        </div>
      </div>
    </main>
  )
}
