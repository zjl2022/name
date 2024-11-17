import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { MONGODB_URI, MONGODB_DB } from '@/lib/db';

const client = new MongoClient(MONGODB_URI);

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

    // 转换为对象格式，方便前端使用
    const result = characterInfos.reduce((acc, info) => {
      acc[info.character] = info;
      return acc;
    }, {} as Record<string, any>);

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