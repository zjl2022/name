'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

interface NameData {
  name: string;
  content: string;
  gender_suitability: string;
  score: number;
}

interface CharacterInfo {
  character: string;
  strokes: number;
  five_elements: string;
  pinyin: string;
  meaning: string;
  name_reference: string;
}

// 创建一个新的组件来包含使用 useSearchParams 的部分
function NameSearchContent() {
  const [names, setNames] = useState<NameData[]>([]);
  const [characterInfos, setCharacterInfos] = useState<Record<string, CharacterInfo>>({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const lastName = searchParams.get('lastName') || '';
  const gender = searchParams.get('gender') || '';
  const containChar = searchParams.get('containChar') || '';

  // 使用 useEffect 监听 URL 参数变化
  useEffect(() => {
    // 当 lastName, gender, containChar 变化时，重置页码到第一页
    setCurrentPage(1);
  }, [lastName, gender, containChar]);

  // 获取字的信息
  const fetchCharacterInfo = async (char: string) => {
    try {
      console.log('正在获取汉字信息:', char);
      const response = await fetch(`/api/zi/info?character=${char}`);
      const data = await response.json();
      console.log('获取到的汉字信息:', data);
      
      if (!data.success) {
        console.error('获取汉字信息失败:', data.message);
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error('获取汉字信息失败:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchNames = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          lastName,
          ...(gender && { gender: gender === 'male' ? '男' : '女' }),
          ...(containChar && { containChar }),
          page: currentPage.toString(),
          pageSize: '9'
        });

        const response = await fetch(`/api/names/search?${params.toString()}`);
        const { data } = await response.json();
        setNames(data);

        // 获取所有需要的汉字信息
        const chars = new Set([lastName, ...data.flatMap((n: NameData) => n.name.split(''))]);
        const charInfos: Record<string, CharacterInfo> = {};
        
        console.log('需要获取信息的汉字:', [...chars]);
        
        for (const char of chars) {
          if (char) {  // 确保字符不为空
            const info = await fetchCharacterInfo(char);
            if (info) {
              console.log(`成功获取 "${char}" 的信息:`, info);
              charInfos[char] = info;
            } else {
              console.log(`未能获取 "${char}" 的信息`);
            }
          }
        }

        console.log('所有汉字信息:', charInfos);
        setCharacterInfos(charInfos);
      } catch (error) {
        console.error('获取名字失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNames();
  }, [lastName, gender, containChar, currentPage]);

  // 修改 CharacterGrid 组件
  const CharacterGrid = ({ char }: { char: string }) => (
    <div className="relative w-16 h-16 border border-gray-300">
      {/* 简化米字格线条实现 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 h-full w-[1px] bg-gray-300 transform -translate-x-1/2"></div>
        <div className="absolute left-0 top-1/2 w-full h-[1px] bg-gray-300 transform -translate-y-1/2"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-0 w-full h-full border-t border-gray-300 transform origin-top-left rotate-45"></div>
          <div className="absolute top-0 right-0 w-full h-full border-t border-gray-300 transform origin-top-right -rotate-45"></div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-2xl">
        {char}
      </div>
    </div>
  );

  // 新增 CharacterInfo 组件
  // const CharacterInfo = ({ char }: { char: string }) => {
  //   const info = characterInfos[char];
  //   console.log(`渲染 "${char}" 的信息:`, info);
  //   
  //   return (
  //     <div className="text-sm space-y-1.5 bg-gray-50 p-2 rounded">
  //       <div className="flex items-center gap-2">
  //         <span className="w-14 text-gray-500">笔画：</span>
  //         <span>{info?.strokes || '未知'}</span>
  //       </div>
  //       <div className="flex items-center gap-2">
  //         <span className="w-14 text-gray-500">五行：</span>
  //         <span>{info?.five_elements || '未知'}</span>
  //       </div>
  //       <div className="flex items-center gap-2">
  //         <span className="w-14 text-gray-500">拼音：</span>
  //         <span>{info?.pinyin || '未知'}</span>
  //       </div>
  //     </div>
  //   );
  // };

  // 修改 handleCharacterClick 函数，确保总是从第一页开始
  const handleCharacterClick = (char: string) => {
    const params = new URLSearchParams({
      lastName,
      ...(gender && { gender }),
      containChar: char,
      page: '1' // 显式设置页码为 1
    });
    router.push(`/names?${params.toString()}`);
  };

  // 修改分页按钮的处理函数，在 URL 中包含页码
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams({
      lastName,
      ...(gender && { gender }),
      ...(containChar && { containChar }),
      page: newPage.toString()
    });
    router.push(`/names?${params.toString()}`);
  };

  // 修改卡片点击处理函数
  const handleNameCardClick = (nameData: NameData) => {
    const params = new URLSearchParams({
      surname: lastName,
      name: nameData.name
    });
    router.push(`/names/detail?${params.toString()}`);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      {/* 添加浮动切换按钮 */}
      {gender && (
        <button
          onClick={() => {
            const newGender = gender === 'male' ? 'female' : 'male';
            const params = new URLSearchParams({
              lastName,
              gender: newGender,
              ...(containChar && { containChar }),
              page: '1' // 切换性别时重置到第一页
            });
            router.push(`/names?${params.toString()}`);
          }}
          className="fixed bottom-8 right-8 bg-white shadow-lg rounded-full px-6 py-3 
            text-base font-medium hover:shadow-xl transition-shadow
            border border-gray-200 flex items-center gap-2"
        >
          <span>切换到</span>
          <span className={gender === 'male' ? 'text-pink-500' : 'text-blue-500'}>
            {gender === 'male' ? '���孩名' : '男孩名'}
          </span>
        </button>
      )}

      {/* 原有的列表内容 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {names.map((nameData, index) => {
          const chars = nameData.name.split('');
          return (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleNameCardClick(nameData)}
            >
              {/* 主体内容 */}
              <div className="flex justify-between">
                {/* 左侧内容区域 */}
                <div className="flex gap-8 flex-1">
                  {/* 字格列 */}
                  <div className="flex flex-col gap-[1.75rem]">
                    <div onClick={(e) => {
                      e.stopPropagation();
                      handleCharacterClick(lastName);
                    }}>
                      <CharacterGrid char={lastName} />
                    </div>
                    {chars.map((char, idx) => (
                      <div 
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCharacterClick(char);
                        }}
                      >
                        <CharacterGrid char={char} />
                      </div>
                    ))}
                  </div>
                  
                  {/* 信息列 */}
                  <div className="flex flex-col gap-[1.75rem] flex-1">
                    {/* 姓氏信息 */}
                    <div className="text-sm bg-gray-50 p-2.5 rounded h-16 flex items-center">
                      <div className="grid grid-cols-[4rem,1fr] gap-1">
                        <span className="text-gray-500">笔画：</span>
                        <span>{characterInfos[lastName]?.strokes || ''}</span>
                        <span className="text-gray-500">五行：</span>
                        <span>{characterInfos[lastName]?.five_elements || ''}</span>
                        <span className="text-gray-500">拼音：</span>
                        <span>{characterInfos[lastName]?.pinyin || ''}</span>
                      </div>
                    </div>

                    {/* 名字字符信息 */}
                    {chars.map((char, idx) => (
                      <div key={idx} className="text-sm bg-gray-50 p-2.5 rounded h-16 flex items-center">
                        <div className="grid grid-cols-[4rem,1fr] gap-1">
                          <span className="text-gray-500">笔画：</span>
                          <span>{characterInfos[char]?.strokes || ''}</span>
                          <span className="text-gray-500">五行：</span>
                          <span>{characterInfos[char]?.five_elements || ''}</span>
                          <span className="text-gray-500">拼音：</span>
                          <span>{characterInfos[char]?.pinyin || ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 评分 */}
                <div className="bg-red-500 text-white h-fit px-3 py-1.5 rounded-full text-base font-medium ml-4">
                  {nameData.score}分
                </div>
              </div>

              {/* 字义和取名参考 */}
              <div className="mt-6 space-y-4 border-t pt-4">
                {/* 字义说明 */}
                <div className="text-sm">
                  <div className="font-medium mb-2 text-gray-900">字义解释</div>
                  {chars.map((char, idx) => (
                    <div key={idx} className="mb-2 text-gray-600">
                      <span className="inline-block bg-gray-100 px-2 py-0.5 rounded mr-2">『{char}』</span>
                      {characterInfos[char]?.meaning || ''}
                    </div>
                  ))}
                </div>

                {/* 取名参考 */}
                <div className="text-sm">
                  <div className="font-medium mb-2 text-gray-900">取名参考</div>
                  {chars.map((char, idx) => (
                    <div key={idx} className="mb-2 text-gray-600">
                      <span className="inline-block bg-gray-100 px-2 py-0.5 rounded mr-2">『{char}』</span>
                      {characterInfos[char]?.name_reference || ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 分页控制 */}
      <div className="mt-8 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="hover:bg-gray-100"
        >
          上一页
        </Button>
        <span className="flex items-center px-4">第 {currentPage} 页</span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          className="hover:bg-gray-100"
        >
          下一页
        </Button>
      </div>
    </div>
  );
}

// 主页面组件
export default function NamesPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <NameSearchContent />
    </Suspense>
  );
}