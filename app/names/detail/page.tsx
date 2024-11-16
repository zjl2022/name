'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// 添加 NameDetail 接口定义
interface NameDetail {
  content: string;
  // 根据实际数据添加其他必要的字段
}

// 创建一个新的组件来包含使用 useSearchParams 的内容
function NameDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [detail, setDetail] = useState<NameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const surname = searchParams.get('surname') || '';
  const name = searchParams.get('name') || '';

  // 处理点击单个字的事件
  const handleCharacterClick = (char: string) => {
    const params = new URLSearchParams({
      lastName: surname,
      containChar: char,
      page: '1'
    });
    router.push(`/names?${params.toString()}`);
  };

  useEffect(() => {
    const fetchNameDetail = async () => {
      if (!surname || !name) return;
      
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          surname,
          name
        });
        
        const response = await fetch(`/api/names/detail?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const { success, data, message } = await response.json();
        
        if (!success) {
          throw new Error(message || '获取数据失败');
        }

        setDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取名字详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchNameDetail();
  }, [surname, name]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          加载中...
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center text-red-500">
          {error || '未找到名字信息'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
  

        {/* 显示姓名和评分 */}


        {/* 详情内容 */}
        <div 
          className="name-detail-content"
          dangerouslySetInnerHTML={{ __html: detail.content }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('zi')) {
              e.preventDefault();
              handleCharacterClick(target.textContent || '');
            }
          }}
        />


<style jsx global>{`
          .name_content {
            position: relative;
            background: #fff;
            padding: 20px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }

          .name_content h1 {
            font-size: 22px;
            color: #333;
            text-align: center;
            padding: 10px 0;
            margin-bottom: 20px;
            font-weight: normal;
          }

          /* 相关成语和诗词的标题样式 */
          .name-detail-content b {
            display: block;
            color: #333;
            font-size: 15px;
            margin: 15px 0 10px 0;
          }

          /* 相关成语样式 */
          .name-detail-content .idiom {
            color: #333;
            margin: 8px 0;
          }

          .name-detail-content .idiom em {
            color: #e55352;
            font-style: normal;
          }

          .name-detail-content .idiom i {
            color: #999;
            font-style: normal;
            font-size: 14px;
            margin-left: 8px;
          }

          .name-detail-content .idiom_text {
            color: #666;
            font-size: 14px;
            margin: 5px 0 12px 0;
            padding-left: 2px;
          }

          /* 相关诗词样式 */
          .name-detail-content .poem_title {
            color: #333;
            margin: 8px 0 5px 0;
          }

          .name-detail-content .poem_title i {
            color: #999;
            font-style: normal;
            font-size: 14px;
            margin-left: 8px;
          }

          .name-detail-content .poem_text {
            color: #666;
            font-size: 14px;
            margin: 0 0 8px 0;
            padding-left: 2px;
          }

          .name-detail-content .poem_text em {
            color: #e55352;
            font-style: normal;
          }

          /* 分割线样式 */
          .name-detail-content b:not(:first-child) {
            border-top: 1px solid #eee;
            padding-top: 15px;
            margin-top: 20px;
          }

          /* 基础文本样式 */
          .name-detail-content p {
            color: #666;
            font-size: 14px;
            line-height: 1.8;
            margin: 8px 0;
          }

          /* 字信息样式 */
          .zi-info {
            padding: 15px 0;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
          }

          .zi-info ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .zi-info li {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
          }

          .zi-info .zi {
            width: 65px;
            height: 65px;
            line-height: 65px;
            text-align: center;
            font-size: 40px;
            border: 1px solid #e8e8e8;
            margin-right: 15px;
            background: #f9f9f9;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .zi-info .zi:hover {
            background-color: #e55352;
            color: white;
            border-color: #e55352;
          }

          /* 评分样式 */
          .name_content .fraction {
            position: absolute;
            top: 65px;
            right: -10px;
            background: #e55352;
            color: #fff;
            padding: 8px 20px;
            border-radius: 25px 0 0 25px;
          }

          .name_content .fraction strong {
            font-size: 16px;
            font-weight: normal;
          }

          /* 响应式样式 */
          @media screen and (max-width: 767px) {
            .name_content .fraction {
              top: 55px;
              right: -5px;
              padding: 5px 15px;
            }

            .zi-info .zi {
              width: 50px;
              height: 50px;
              line-height: 50px;
              font-size: 30px;
            }
          }
        `}</style>
      </div>
  
  );
} 

// 添加默认导出的页面组件
export default function NameDetailPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <NameDetailContent />
    </Suspense>
  );
}
