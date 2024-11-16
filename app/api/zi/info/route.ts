import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { MONGODB_URI, MONGODB_DB } from '@/lib/db';

const client = new MongoClient(MONGODB_URI);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const character = searchParams.get('character');

    if (!character) {
      return NextResponse.json({
        success: false,
        message: '请提供汉字参数'
      }, { status: 400 });
    }

    await client.connect();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('zi');

    const characterInfo = await collection.findOne(
      { character: character },
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
    );

    if (!characterInfo) {
      return NextResponse.json({
        success: false,
        message: '未找到该汉字信息'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: characterInfo
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