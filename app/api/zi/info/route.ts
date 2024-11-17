import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { MONGODB_URI, MONGODB_DB } from '@/lib/db';

const client = new MongoClient(MONGODB_URI);

// 添加接口定义
interface CharacterInfo {
  character: string;
  strokes: number;
  five_elements: string;
  pinyin: string;
  meaning: string;
  name_reference: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const characters = searchParams.get('characters')?.split(',') || [];

    if (!characters.length) {
      return NextResponse.json({
        success: false,
        message: '请提供汉字参数'
      }, { status: 400 });
    }

    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('zi');

    const characterInfos = await collection.find(
      { character: { $in: characters } },
      { 
        projection: {
          _id: 0,
          character: 1,
          strokes: 1,
          five_elements: 1,
          pinyin: 1,
          meaning: 1,
          name_reference: 1
        }
      }
    ).toArray();

    // 转换数据库返回的文档为 CharacterInfo 类型
    const result = characterInfos.reduce((acc, info) => {
      // 确保数据符合 CharacterInfo 接口
      const characterInfo: CharacterInfo = {
        character: info.character,
        strokes: info.strokes,
        five_elements: info.five_elements,
        pinyin: info.pinyin,
        meaning: info.meaning,
        name_reference: info.name_reference
      };
      
      acc[characterInfo.character] = characterInfo;
      return acc;
    }, {} as Record<string, CharacterInfo>);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('获取汉字信息失败:', error);
    return NextResponse.json({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 });
  } finally {
    await client.close();
  }
} 